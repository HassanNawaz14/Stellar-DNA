export default function ErrorBox({ message, onRetry }) {
  return (
    <div className="error-box" role="alert">
      <strong>Something went wrong.</strong>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-ghost" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
