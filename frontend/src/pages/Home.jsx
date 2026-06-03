import InputForm from '../components/InputForm.jsx'
import Header from '../components/Header.jsx'

const STEPS = [
  {
    n: '01',
    title: 'Enter your birth moment',
    body: 'A date, a time, and the place you came into the world. The city is geocoded to latitude and longitude automatically — no manual coordinates needed.',
  },
  {
    n: '02',
    title: 'Reconstruct the sky',
    body: 'The backend pulls the HYG star catalog and uses skyfield to find every star above your horizon at that exact moment, classified by spectral type.',
  },
  {
    n: '03',
    title: 'Trace your atoms',
    body: 'Each spectral class has a known nucleosynthesis yield. We compute the elemental mass fractions that built you, and the stellar process that forged them.',
  },
  {
    n: '04',
    title: 'Score and narrate',
    body: 'Five trait dimensions are scored through deterministic math. A free LLM then turns the 11 numbers into a unique 3-paragraph portrait — no horoscopes, no templates.',
  },
]

export default function Home() {
  return (
    <div className="page home">
      <Header />
      <main className="home-main">
        <section className="hero">
          <div className="hero-text">
            <p className="hero-eyebrow">Inspired by real astrophysics</p>
            <h1 className="hero-title">
              Discover your<br />
              <span className="hero-accent">Stellar DNA.</span>
            </h1>
            <p className="hero-sub">
              Every atom in your body was forged in a star. Enter when and where you were born,
              and we will reconstruct the sky above you at that exact moment, classify it, and
              trace your matter back to its stellar origin.
            </p>
          </div>
          <div className="hero-form">
            <InputForm />
          </div>
        </section>

        <section className="how">
          <h2 className="section-title">How it works</h2>
          <div className="steps">
            {STEPS.map((s) => (
              <article className="step" key={s.n}>
                <span className="step-num">{s.n}</span>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-body">{s.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="disclaimer">
          <p>
            Stellar DNA is a poetic, physics-inspired interpretation. The LLM call explicitly
            frames its output as artistic language, not a scientific prediction. The 5 trait
            scores are deterministic and reproducible — they are math, not mysticism.
          </p>
        </section>
      </main>
    </div>
  )
}
