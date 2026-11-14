export default function SignupModal({ app }) {
  const { authMessage, handleSignup, setShowLogin, setShowPassword, setShowSignup, setSignupData, showPassword, signupData } = app

  return (
    app.showSignup && (
    <div className="signup-overlay" id="signup-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowSignup(false) }}>
              <div className="signup-modal" id="signup-modal">
                <button className="signup-close" id="signup-close" onClick={() => setShowSignup(false)} aria-label="Close">
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
                  <h2 className="signup-title">Create Account</h2>
                  <p className="signup-subtitle">Join BorrowBuddy today!</p>
    
                  <form className="signup-form" id="signup-form" onSubmit={handleSignup}>
                    {authMessage.text && (
                      <div className={`auth-message ${authMessage.type}`}>
                        {authMessage.text}
                      </div>
                    )}
                    <div className="signup-field">
                      <label className="signup-label" htmlFor="signup-name">Full Name</label>
                      <input
                        className="signup-input"
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={signupData.name}
                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      />
                    </div>
    
                    <div className="signup-field">
                      <label className="signup-label" htmlFor="signup-email">Email address</label>
                      <input
                        className="signup-input"
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      />
                    </div>
    
                    <div className="signup-field">
                      <label className="signup-label" htmlFor="signup-password">Password</label>
                      <div className="signup-password-wrapper">
                        <svg className="signup-password-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                        <input
                          className="signup-input signup-input-password"
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        />
                        <button
                          type="button"
                          className="signup-password-toggle"
                          id="signup-password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? (
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
    
                    <button className="signup-register-btn" id="signup-register-btn" type="submit">Register</button>
                  </form>
    
                  <p className="signup-login-link">
                    Already have an account? <a href="#login" id="signup-login" onClick={(e) => { e.preventDefault(); setShowSignup(false); setShowLogin(true); }}>Login</a>
                  </p>
                </div>
              </div>
            </div>
    )
  )
}
