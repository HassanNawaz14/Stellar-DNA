export default function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="/">
        <span className="brand-glyph" aria-hidden="true">✦</span>
        <span className="brand-name">Stellar DNA</span>
      </a>
      <nav className="site-nav">
        <a href="/">Home</a>
        <a href="/about">About</a>
      </nav>
    </header>
  )
}
