import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import StarMap from '../components/StarMap.jsx'
import ElementChart from '../components/ElementChart.jsx'
import ProfileCard from '../components/ProfileCard.jsx'
import TraitProfile from '../components/TraitProfile.jsx'
import SpectralBar from '../components/SpectralBar.jsx'
import Loader from '../components/Loader.jsx'
import ErrorBox from '../components/ErrorBox.jsx'
import { postPart2 } from '../api/client.js'

function ProfileStars() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')
    let id; let s = []
    const resize = () => {
      c.width = window.innerWidth; c.height = window.innerHeight
      const n = Math.floor((c.width * c.height) / 7000)
      s = Array.from({ length: n }, () => ({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 1.4 + 0.2, a: Math.random() * 0.5 + 0.1, sp: Math.random() * 0.1 + 0.01, d: Math.random() * 0.25 - 0.125 }))
    }
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      for (const t of s) { t.y -= t.sp; t.x += t.d; if (t.y < -2) { t.y = c.height + 2; t.x = Math.random() * c.width } if (t.x < -2) t.x = c.width + 2; if (t.x > c.width + 2) t.x = -2; const f = 0.7 + 0.3 * Math.sin(performance.now() * 0.002 * t.sp * 10 + t.x); ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(200, 220, 255, ${t.a * f})`; ctx.fill() }
      id = requestAnimationFrame(draw)
    }
    resize(); draw()
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} className="profile-stars" aria-hidden="true" />
}

export default function Profile() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const part1 = state?.part1
  const birth = state?.birth

  const [part2, setPart2] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!part1) return
    let cancelled = false
    setLoading(true); setError(null)
    postPart2(part1)
      .then((d) => { if (!cancelled) setPart2(d) })
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [part1])

  if (!part1) {
    return (
      <div className="page profile-page">
        <Header />
        <main className="empty-state">
          <h1>No profile yet.</h1>
          <p>Enter your birth details on the home page to generate a Stellar DNA profile.</p>
          <Link to="/" className="btn btn-primary">Go to home</Link>
        </main>
      </div>
    )
  }

  const displayName = birth?.name || 'Your'

  return (
    <div className="page profile-page">
      <ProfileStars />
      <div className="profile-over">
        <Header />

        {/* ── Hero ── */}
        <section className="pr-hero">
          <div className="pr-hero-inner">
            <p className="pr-hero-label">Your Stellar DNA</p>
            <h1 className="pr-hero-title">
              {displayName}&rsquo;s <span className="pr-hero-accent">Cosmic Profile</span>
            </h1>
            <p className="pr-hero-location">{birth?.location_name || ''}</p>
            <p className="pr-hero-date">{birth?.birth_date} · {birth?.birth_time}</p>
            {part2?.archetype_name && (
              <div className="pr-hero-archetype-wrap">
                <span className="pr-hero-archetype-label">Archetype</span>
                <p className="pr-hero-archetype">{part2.archetype_name}</p>
              </div>
            )}
          </div>
          <button className="pr-hero-back" onClick={() => navigate('/')}>← Back</button>
        </section>

        {/* ── Star Map ── */}
        <section className="pr-section pr-map-section">
          <h2 className="pr-section-heading">Your birth sky</h2>
          <p className="pr-section-sub">The stars that were overhead the moment you arrived</p>
          <div className="pr-map-card">
            <StarMap stars={part1.star_positions || []} />
          </div>
        </section>

        {/* ── Birth Sky Stats ── */}
        <section className="pr-section pr-stats-section">
          <ProfileCard data={part1} birth={birth} />
        </section>

        {/* ── Charts ── */}
        <section className="pr-section pr-charts-section">
          <div className="pr-charts-grid">
            <div className="pr-chart">
              <ElementChart data={part1.element_percentages || {}} />
            </div>
            <div className="pr-chart">
              <SpectralBar weights={part1.spectral_weights || {}} />
            </div>
          </div>
        </section>

        {/* ── Trait Profile ── */}
        <section className="pr-section pr-trait-section">
          {loading && <Loader label="Computing your trait profile…" />}
          {error && <ErrorBox message={error} onRetry={() => setError(null)} />}
          {part2 && <TraitProfile data={part2} />}
        </section>

        {/* ── Disclaimer ── */}
        <section className="pr-disclaimer">
          <p>
            Stellar DNA is a poetic interpretation inspired by real stellar physics,
            not a scientific prediction. The 5 trait scores are reproducible math derived
            from the birth sky; the narrative is generated by an LLM and is unique to your input.
          </p>
        </section>
      </div>
    </div>
  )
}
