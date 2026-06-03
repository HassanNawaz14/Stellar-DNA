import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'

export default function NotFound() {
  return (
    <div className="page">
      <Header />
      <main className="empty-state">
        <h1>404</h1>
        <p>That page is somewhere outside the observable universe.</p>
        <Link to="/" className="btn btn-primary">Back to home</Link>
      </main>
    </div>
  )
}
