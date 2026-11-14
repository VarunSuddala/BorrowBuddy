export default function DashboardSidebar({ app }) {
  const { currentPage, handleLogout, profileMenuOpen, setCurrentPage, setProfileMenuOpen, setSidebarCollapsed, sidebarCollapsed, unreadCount, user } = app

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-logo">
                  <div className="sidebar-logo-icon">
                    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                      <path d="M12 8.5 25.2 2.7a4.8 4.8 0 0 1 4.2.2l9.2 5.2v23.8c0 1.8-1 3.4-2.6 4.2l-11.9 6.2a4.8 4.8 0 0 1-4.5-.1l-9.3-5.4a4.7 4.7 0 0 1-2.3-4.1V12.8c0-1.8 1-3.5 3-4.3Z" fill="currentColor" />
                      <path d="M30 4.2a8.5 8.5 0 0 0-9.2 8.3c0 4.6 3.7 8.3 8.3 8.3 4.7 0 8.4-3.8 8.4-8.4 0-3.8-2.5-7-6-8.2l-5.1 8.7" fill="#4e9b32" />
                    </svg>
                  </div>
                  <span className="sidebar-logo-text">BorrowBuddy</span>
                  <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {sidebarCollapsed ? (
                        <polyline points="9 18 15 12 9 6" />
                      ) : (
                        <polyline points="15 18 9 12 15 6" />
                      )}
                    </svg>
                  </button>
                </div>
    
                <nav className="sidebar-nav">
                  <a href="#" className={`sidebar-link ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentPage('dashboard') }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    Dashboard
                  </a>
                  <a href="#" className={`sidebar-link ${currentPage === 'my-groups' || currentPage === 'discover-groups' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentPage('my-groups') }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    My Groups
                  </a>
                  <a href="#" className={`sidebar-link ${currentPage === 'inventory' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentPage('inventory') }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                    Inventory
                  </a>
                  <a href="#" className={`sidebar-link ${currentPage === 'invitations' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentPage('invitations') }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16v16H4z" />
                      <path d="M4 7l8 5 8-5" />
                    </svg>
                    Invitations
                  </a>
                  <a href="#" className={`sidebar-link ${currentPage === 'history' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentPage('history') }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m7 16 4-5 3 3 5-7" /></svg>
                  Borrowing History
                </a>
                <button type="button" className={`sidebar-link sidebar-action ${currentPage === 'notifications' ? 'active' : ''}`} onClick={() => setCurrentPage('notifications')} aria-label="Notifications">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                      <path d="M10 21h4" />
                    </svg>
                    <span className="sidebar-action-label">Notifications</span>
                    {unreadCount > 0 && <span className="sidebar-action-badge">{unreadCount}</span>}
                  </button>
                </nav>
    
                <div className="dashboard-account">
                  <button className="dashboard-account-trigger" onClick={() => setProfileMenuOpen(!profileMenuOpen)} aria-expanded={profileMenuOpen} aria-label="Open account menu">
                    <span className="dashboard-account-avatar">{user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</span>
                    <span className="dashboard-account-name">{user?.name}</span>
                    <svg className="dashboard-account-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                  </button>
                  {profileMenuOpen && (
                    <div className="dashboard-account-menu">
                      <button onClick={() => { setCurrentPage('profile'); setProfileMenuOpen(false) }}>Profile</button>
                      <button onClick={handleLogout}>Logout</button>
                    </div>
                  )}
                </div>
              </aside>
  )
}
