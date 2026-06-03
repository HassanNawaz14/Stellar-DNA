export default function ScoreBar({ label, value, max = 100, hint }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="score-bar">
      <div className="score-bar-head">
        <span className="score-label">{label}</span>
        <span className="score-value">
          {value}
          {max === 100 ? '/100' : ''}
        </span>
      </div>
      <div className="score-track">
        <div className="score-fill" style={{ width: `${pct}%` }} />
      </div>
      {hint && <p className="score-hint">{hint}</p>}
    </div>
  )
}
