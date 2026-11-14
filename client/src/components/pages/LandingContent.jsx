export default function LandingContent({ app }) {
  const { heroImage, mobileMenuOpen, setLoginPageMode, setMobileMenuOpen, setShowLoginPage } = app

  return (
    <>
    <nav className="navbar">
            <div className={`nav-links${mobileMenuOpen ? ' mobile-open' : ''}`}>
              <a href="#hero" id="nav-home" onClick={() => setMobileMenuOpen(false)}>Home</a>
              <a href="#hero" id="nav-how-it-works" onClick={() => setMobileMenuOpen(false)}>How it works</a>
              <a href="#hero" id="nav-about" onClick={() => setMobileMenuOpen(false)}>About</a>
            </div>
    
            <a href="#hero" className="nav-mark" id="nav-logo" aria-label="BorrowBuddy home">
              <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <path d="M12 8.5 25.2 2.7a4.8 4.8 0 0 1 4.2.2l9.2 5.2v23.8c0 1.8-1 3.4-2.6 4.2l-11.9 6.2a4.8 4.8 0 0 1-4.5-.1l-9.3-5.4a4.7 4.7 0 0 1-2.3-4.1V12.8c0-1.8 1-3.5 3-4.3Z" fill="currentColor" />
                <circle cx="38" cy="12" r="8.5" fill="#4e9b32" stroke="#f8f7f5" strokeWidth="3" />
              </svg>
            </a>
    
            <button className="nav-signup" id="nav-signup" onClick={() => { setLoginPageMode('login'); setShowLoginPage(true) }}>Get started</button>
    
            <button
              className="nav-hamburger"
              id="nav-hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </nav>
    
          <section className="hero-section" id="hero">
            <div className="hero-content">
              <h1 className="hero-heading">Share more. Borrow better.</h1>
              <p className="hero-description">
                Access what you need, share what you have, and build a more connected community.
              </p>
              <div className="hero-buttons">
                <button className="btn-get-started" id="btn-get-started" onClick={() => { setLoginPageMode('login'); setShowLoginPage(true) }}>
                  Explore BorrowBuddy
                </button>
              </div>
            </div>
    
            <div className="hero-image-wrapper">
              <div className="hero-image-frame">
                <img
                  src={heroImage}
                  alt="A bright shared workspace with a desktop monitor, laptop, keyboard, and an ergonomic chair"
                  className="hero-image"
                />
              </div>
            </div>
          </section>
    </>
  )
}
