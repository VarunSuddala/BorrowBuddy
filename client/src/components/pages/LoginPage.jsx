import heroImage from '../../assets/borrowbuddy-hero-reference.png'


export default function LoginPage({ app }) {
  const { authMessage, handleLogin, handleSignup, loginData, loginPageMode, mobileMenuOpen, returnToLanding, setAuthMessage, setLoginData, setLoginPageMode, setMobileMenuOpen, setShowLoginPassword, setShowPassword, setSignupData, showLoginPassword, showPassword, signupData } = app

  return (
    app.showLoginPage && (
    <div className="login-page" id="login-page">
              <nav className="navbar login-page-navbar">
                <div className={`nav-links${mobileMenuOpen ? ' mobile-open' : ''}`}>
                  <a href="#hero" onClick={returnToLanding}>Home</a>
                  <a href="#hero" onClick={returnToLanding}>How it works</a>
                  <a href="#hero" onClick={returnToLanding}>About</a>
                </div>
    
                <button className="nav-mark login-page-mark" onClick={returnToLanding} aria-label="Return to BorrowBuddy home">
                  <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <path d="M12 8.5 25.2 2.7a4.8 4.8 0 0 1 4.2.2l9.2 5.2v23.8c0 1.8-1 3.4-2.6 4.2l-11.9 6.2a4.8 4.8 0 0 1-4.5-.1l-9.3-5.4a4.7 4.7 0 0 1-2.3-4.1V12.8c0-1.8 1-3.5 3-4.3Z" fill="currentColor" />
                    <circle cx="38" cy="12" r="8.5" fill="#4e9b32" stroke="#f8f7f5" strokeWidth="3" />
                  </svg>
                </button>
    
                <button className="nav-signup" onClick={() => { setLoginPageMode('login'); setAuthMessage({ type: '', text: '' }) }}>Get started</button>
    
                <button className="nav-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {mobileMenuOpen ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
                  </svg>
                </button>
              </nav>
    
              <main className="login-page-layout">
                <section className="login-page-story">
                  <div className="login-page-copy">
                    <h1>Share more.<br />Borrow better.</h1>
                    <p>Access what you need, share what you have, and build a more connected community.</p>
                    <div className="login-page-create">
                      <span>{loginPageMode === 'login' ? 'Don’t have an account?' : 'Already have an account?'}</span>
                      <button onClick={() => { setLoginPageMode(loginPageMode === 'login' ? 'signup' : 'login'); setAuthMessage({ type: '', text: '' }) }}>
                        {loginPageMode === 'login' ? 'Create account' : 'Log in'} <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </div>
                  <div className="login-page-preview">
                    <img src={heroImage} alt="A shared workspace with a monitor, laptop, and ergonomic chair" />
                  </div>
                </section>
    
                <section className="login-page-visual" aria-label={loginPageMode === 'login' ? 'Log in to BorrowBuddy' : 'Create a BorrowBuddy account'}>
                  <img className="login-page-background" src={heroImage} alt="" />
                  <div className="login-page-card" key={loginPageMode}>
                    <h2>{loginPageMode === 'login' ? 'Log in to your account' : 'Create your account'}</h2>
                    {authMessage.text && <div className={`auth-message ${authMessage.type}`}>{authMessage.text}</div>}
                    {loginPageMode === 'login' ? (
                      <form id="login-page-form" onSubmit={handleLogin}>
                      <label className="login-page-field">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
                        </svg>
                        <span className="sr-only">Email address</span>
                        <input type="email" placeholder="Enter your email" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} />
                      </label>
    
                      <label className="login-page-field">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
                        </svg>
                        <span className="sr-only">Password</span>
                        <input type={showLoginPassword ? 'text' : 'password'} placeholder="Enter your password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
                        <button type="button" className="login-page-password-toggle" onClick={() => setShowLoginPassword(!showLoginPassword)} aria-label="Toggle password visibility">
                          {showLoginPassword ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.5 0 9 7 9 7a15 15 0 0 1-3 3.8M6.2 6.2C4.1 7.5 3 12 3 12s3.5 7 9 7a9.5 9.5 0 0 0 2.1-.2" /></svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                          )}
                        </button>
                      </label>
    
                      <div className="login-page-options">
                        <label><input type="checkbox" /> <span>Remember me</span></label>
                        <a href="#forgot">Forgot your password?</a>
                      </div>
    
                      <button className="login-page-submit" type="submit">Log in</button>
                      </form>
                    ) : (
                      <form id="signup-page-form" onSubmit={handleSignup}>
                        <label className="login-page-field">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
                          </svg>
                          <span className="sr-only">Full name</span>
                          <input type="text" placeholder="Enter your full name" value={signupData.name} onChange={(e) => setSignupData({ ...signupData, name: e.target.value })} />
                        </label>
    
                        <label className="login-page-field">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
                          </svg>
                          <span className="sr-only">Email address</span>
                          <input type="email" placeholder="Enter your email" value={signupData.email} onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} />
                        </label>
    
                        <label className="login-page-field">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
                          </svg>
                          <span className="sr-only">Password</span>
                          <input type={showPassword ? 'text' : 'password'} placeholder="Create a password" value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} />
                          <button type="button" className="login-page-password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
                            {showPassword ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.5 0 9 7 9 7a15 15 0 0 1-3 3.8M6.2 6.2C4.1 7.5 3 12 3 12s3.5 7 9 7a9.5 9.5 0 0 0 2.1-.2" /></svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                            )}
                          </button>
                        </label>
    
                        <button className="login-page-submit" type="submit">Create account</button>
                      </form>
                    )}
                  </div>
                </section>
              </main>
            </div>
    )
  )
}
