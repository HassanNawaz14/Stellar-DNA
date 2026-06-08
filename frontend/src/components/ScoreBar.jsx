export default function ScoreBar({ label, value, max = 100, hint }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))

  function gradientForScore(v) {
    if (v < 34) return 'linear-gradient(90deg, #5fb5d4, #7c9bff)'
    if (v < 67) return 'linear-gradient(90deg, #7c9bff, #b18bff)'
    return 'linear-gradient(90deg, #b18bff, #e16a8d)'
  }

  return (
    <div className="sb2-bar">
      <div className="sb2-bar-head">
        <span className="sb2-label">{label}</span>
        <span className="sb2-value">{value}/100</span>
      </div>
      <div className="sb2-track">
        <div
          className="sb2-fill"
          style={{ width: `${pct}%`, background: gradientForScore(value) }}
        />
      </div>
      {hint && <p className="sb2-hint">{hint}</p>}
    </div>
  )
}
