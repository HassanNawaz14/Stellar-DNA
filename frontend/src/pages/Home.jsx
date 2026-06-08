import { useEffect, useRef, useState } from 'react'
import InputForm from '../components/InputForm.jsx'
import Header from '../components/Header.jsx'

const STEPS = [
  {
    num: '01',
    title: 'Enter your birth moment',
    short: 'Date, time, place. That is all we need.',
    detail: 'The city is geocoded to latitude and longitude automatically via OpenStreetMap — no manual coordinates required.',
    accent: '#7c9bff',
    icon: '✦',
  },
  {
    num: '02',
    title: 'Reconstruct the sky',
    short: 'Every star above you, classified by type.',
    detail: 'The HYG star catalog (~120k stars) runs through Skyfield to find exactly which stars were overhead at your birth moment.',
    accent: '#b18bff',
    icon: '◎',
  },
  {
    num: '03',
    title: 'Trace your atoms',
    short: 'What stars made the matter in your body.',
    detail: 'Published nucleosynthesis yield tables (Kobayashi et al. 2020) are weighted by your sky composition to compute your elemental profile.',
    accent: '#e16a8d',
    icon: '⚛',
  },
  {
    num: '04',
    title: 'Score & narrate',
    short: 'Five trait scores, one unique story.',
    detail: 'Deterministic math produces 5 trait dimensions; a free LLM turns the 11 numbers into a 3-paragraph cosmic portrait — no horoscopes.',
    accent: '#c9a14a',
    icon: '✦',
  },
]

const ELEMENTS_STRIP = ['C', 'O', 'Fe', 'Ca', 'Au', 'N', 'Mg', 'Si']

function StarField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let stars = []

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const count = Math.floor((canvas.width * canvas.height) / 6000)
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.6 + 0.3,
        a: Math.random() * 0.6 + 0.15,
        speed: Math.random() * 0.12 + 0.02,
        drift: Math.random() * 0.3 - 0.15,
      }))
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const s of stars) {
        s.y -= s.speed
        s.x += s.drift
        if (s.y < -2) { s.y = canvas.height + 2; s.x = Math.random() * canvas.width }
        if (s.x < -2) s.x = canvas.width + 2
        if (s.x > canvas.width + 2) s.x = -2
        const flicker = 0.7 + 0.3 * Math.sin(performance.now() * 0.002 * s.speed * 10 + s.x)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 220, 255, ${s.a * flicker})`
        ctx.fill()
      }
      animId = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="home-starfield" aria-hidden="true" />
}

function ScrollArrow() {
  return (
    <div className="scroll-arrow">
      <svg width="20" height="32" viewBox="0 0 20 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="16" height="28" rx="8" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="2" fill="currentColor" className="scroll-dot" />
      </svg>
    </div>
  )
}

function HowStep({ step, index, active, setActive }) {
  const open = active === index
  return (
    <div className={`how-step ${open ? 'is-open' : ''}`}>
      <div className="how-step-line">
        <div className="how-step-dot" style={{ borderColor: step.accent }} />
        {index < STEPS.length - 1 && <div className="how-step-connector" />}
      </div>
      <div className="how-step-card" onClick={() => setActive(open ? null : index)}>
        <div className="how-step-header">
          <span className="how-step-num" style={{ color: step.accent }}>{step.num}</span>
          <span className="how-step-icon" style={{ color: step.accent }}>{step.icon}</span>
          <div className="how-step-titles">
            <h3 className="how-step-title">{step.title}</h3>
            <p className="how-step-short">{step.short}</p>
          </div>
          <span className="how-step-chevron">{open ? '−' : '+'}</span>
        </div>
        {open && (
          <div className="how-step-detail">
            <p>{step.detail}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const [activeStep, setActiveStep] = useState(null)

  return (
    <div className="page home">
      <StarField />
      <div className="home-overlay">
        <Header />
        <main className="home-main">
          {/* ── Hero ── */}
          <section className="hero-section">
            <h1 className="hero-headline">
              Every atom in your body<br />
              was forged in a dying star.
            </h1>
            <p className="hero-subtitle">
              Find out which ones, and what they say about you.
            </p>
            <ScrollArrow />
          </section>

          {/* ── Floating elements strip ── */}
          <div className="elements-strip-wrap" aria-hidden="true">
            <div className="elements-strip">
              {[...Array(3)].map((_, pass) =>
                ELEMENTS_STRIP.map((el, i) => (
                  <span key={`${pass}-${i}`} className="el-chip">{el}</span>
                ))
              )}
            </div>
          </div>

          {/* ── Form + Inspirational Text ── */}
          <section className="form-section">
            <div className="form-split">
              <div className="form-col-left">
                <p className="form-eyebrow">Enter your birth moment</p>
                <div className="form-card">
                  <InputForm />
                </div>
              </div>
              <div className="form-col-right">
                <p className="form-inspire-label">The astrophysics behind it</p>

                <div className="form-theory">
                  <p className="form-theory-p">
                    Every atom of carbon in your body was fused in the core of a star that lived and died
                    before the Sun was born. The oxygen you breathe was flung into space by a supernova.
                    The iron in your blood was forged in the heart of a white dwarf that exploded billions
                    of years ago. <strong>You are physically made of starlight.</strong>
                  </p>
                  <p className="form-theory-p">
                    Stellar DNA connects <em>you</em> to that chain of cosmic events. It reconstructs the
                    exact night sky visible from your birthplace at your birth moment, classifies every
                    star above the horizon by its spectral type (O, B, A, F, G, K, M), and uses published
                    nucleosynthesis yield tables from peer-reviewed astrophysics to compute which elements
                    each class of star contributed to the universe — and therefore to you.
                  </p>
                  <div className="form-theory-highlight">
                    <span className="form-theory-highlight-icon">⟡</span>
                    <div>
                      Your spectral sky distribution determines your elemental signature.
                      Your elemental signature determines your nucleosynthesis pathway.
                      Together, they feed 5 deterministic trait scores — pure math,
                      reproducible by anyone who runs the same code.
                    </div>
                  </div>
                  <p className="form-theory-p">
                    No astrology. No randomness. Just the physical fact that the stars above you
                    at the moment you arrived are the same stars that built the matter you are made of.
                    The numbers are real. The narrative is poetry built on those numbers.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── How It Works ── */}
          <section className="how-section-modern">
            <div className="how-modern-inner">
              <h2 className="how-modern-title">How it works</h2>
              <div className="how-steps">
                {STEPS.map((s, i) => (
                  <HowStep
                    key={i}
                    step={s}
                    index={i}
                    active={activeStep}
                    setActive={setActiveStep}
                  />
                ))}
              </div>
              <div className="how-disclaimer">
                <p>
                  <strong>Note:</strong> Stellar DNA is a poetic, physics-inspired interpretation.
                  The LLM frames its output as artistic language, not a scientific prediction.
                  The 5 trait scores are deterministic and reproducible — they are math, not mysticism.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
