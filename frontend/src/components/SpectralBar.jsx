const SPECTRAL_COLORS = {
  O: '#9bb0ff',
  B: '#aabfff',
  A: '#cad7ff',
  F: '#f8f7ff',
  G: '#fff4e8',
  K: '#ffd2a1',
  M: '#ffcc6f',
}

const SPECTRAL_NAMES = {
  O: 'Blue (hottest)',
  B: 'Blue-white',
  A: 'White',
  F: 'Yellow-white',
  G: 'Yellow (Sun-like)',
  K: 'Orange',
  M: 'Red (coolest)',
}

const SPECTRAL_PHRASES = {
  O: "the universe's most violent stars",
  B: 'rare giants that die young',
  A: 'bright and beautiful, gone too soon',
  F: 'slightly restless, slightly brilliant',
  G: 'steady burners — like our Sun',
  K: 'calm, long-lived, dependable',
  M: 'the oldest stars still burning',
}

export default function SpectralBar({ weights = {} }) {
  const classes = ['O', 'B', 'A', 'F', 'G', 'K', 'M']
  const max = Math.max(...classes.map((c) => weights[c] || 0), 0.01)
  return (
    <div className="spectral-bar">
      <h3 className="card-subtitle">Spectral composition of your birth sky</h3>
      <div className="spectral-rows">
        {classes.map((c) => {
          const v = (weights[c] || 0) * 100
          const pct = (v / (max * 100)) * 100
          return (
            <div className="spectral-row" key={c}>
              <span className="spectral-class" style={{ color: SPECTRAL_COLORS[c] }}>
                {c}
              </span>
              <div className="spectral-name-cell">
                <span className="spectral-name">{SPECTRAL_NAMES[c]}</span>
                <span className="spectral-phrase">{SPECTRAL_PHRASES[c]}</span>
              </div>
              <div className="spectral-track">
                <div
                  className="spectral-fill"
                  style={{
                    width: `${pct}%`,
                    background: SPECTRAL_COLORS[c],
                  }}
                />
              </div>
              <span className="spectral-val">{v.toFixed(1)}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
