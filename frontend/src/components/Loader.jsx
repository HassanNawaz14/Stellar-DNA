export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="loader-orbit">
        <div className="loader-core" />
        <div className="loader-ring" />
      </div>
      <p className="loader-label">{label}</p>
    </div>
  )
}
