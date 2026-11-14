export default function LoginModal({ app }) {
  const { authMessage, handleLogin, loginData, setLoginData, setShowLogin, setShowLoginPassword, setShowSignup, showLoginPassword } = app

  return (
    app.showLogin && (
    <div className="signup-overlay" id="login-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowLogin(false) }}>
              <div className="signup-modal" id="login-modal">
                <button className="signup-close" id="login-close" onClick={() => setShowLogin(false)} aria-label="Close">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
    
                <div className="signup-left">
                  <div className="signup-left-content">
                    <div className="signup-brand">
                      <svg className="signup-brand-icon" viewBox="0 0 40 40" fill="none">
                        <circle cx="14" cy="14" r="8" stroke="white" strokeWidth="2.5" fill="none" />
                        <circle cx="26" cy="14" r="8" stroke="white" strokeWidth="2.5" fill="none" />
                      </svg>
                      <div>
                        <div className="signup-brand-name">BorrowBuddy</div>
                        <div className="signup-brand-sub">Borrow & Return Tracker</div>
                      </div>
                    </div>
                    <p className="signup-tagline">Share items. Build better habits.</p>
                    <div className="signup-categories">
                      <div className="signup-cat-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                        </svg>
                        <span>Books</span>
                      </div>
                      <div className="signup-cat-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 2v4M17 2v4" />
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="M12 10v4" />
                        </svg>
                        <span>Chargers</span>
                      </div>
                      <div className="signup-cat-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                        </svg>
                        <span>Tools</span>
                      </div>
                      <div className="signup-cat-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        <span>Sports</span>
                      </div>
                      <div className="signup-cat-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="6" cy="12" r="1" />
                          <circle cx="18" cy="12" r="1" />
                        </svg>
                        <span>And more...</span>
                      </div>
                    </div>
                  </div>
                </div>
    
                <div className="signup-right">
                  <h2 className="signup-title">Welcome Back</h2>
                  <p className="signup-subtitle-blue">Log in to your account</p>
    
                  <form className="signup-form" id="login-form" onSubmit={handleLogin}>
                    {authMessage.text && (
                      <div className={`auth-message ${authMessage.type}`}>
                        {authMessage.text}
                      </div>
                    )}
                    <div className="signup-field">
                      <label className="signup-label" htmlFor="login-email">Email address</label>
                      <input
                        className="signup-input"
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      />
                    </div>
    
                    <div className="signup-field">
                      <label className="signup-label" htmlFor="login-password">Password</label>
                      <div className="signup-password-wrapper">
                        <svg className="signup-password-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                        <input
                          className="signup-input signup-input-password"
                          id="login-password"
                          type={showLoginPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        />
                        <button
                          type="button"
                          className="signup-password-toggle"
                          id="login-password-toggle"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          aria-label="Toggle password visibility"
                        >
                          {showLoginPassword ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
    
                    <div className="login-options">
                      <label className="login-remember" id="login-remember">
                        <input type="checkbox" />
                        <span>Remember me</span>
                      </label>
                      <a href="#forgot" className="login-forgot" id="login-forgot">Forgot password?</a>
                    </div>
    
                    <button className="signup-register-btn" id="login-submit-btn" type="submit">Login</button>
                  </form>
    
                  <p className="signup-login-link">
                    Don't have an account? <a href="#signup" id="login-signup" onClick={(e) => { e.preventDefault(); setShowLogin(false); setShowSignup(true); }}>Sign up</a>
                  </p>
                </div>
              </div>
            </div>
    )
  )
}
