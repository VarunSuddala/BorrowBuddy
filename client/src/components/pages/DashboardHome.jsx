import GroupItemCount from '../Inventory/GroupItemCount'
export default function DashboardHome({ app }) {
  const { activityLabel, currentTime, groups, overdueLoans, recentLoans, relativeActivityTime, setCurrentPage, unresolvedLoans, user } = app

  return (
    app.currentPage === 'dashboard' && (
    <>
                    <header className="dashboard-header">
                      <div className="header-content">
                        <h1 className="dashboard-greeting">Good Morning, {user?.name?.split(' ')[0]}!</h1>
                        <p className="dashboard-subtitle">Here's what's happening with your shared items.</p>
                      </div>
                    </header>
    
                    <div className="stats-grid">
                      <div className="stat-card">
                        <div className="stat-icon stat-icon-blue">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
                            <path d="m12 12 8-4.5M12 12 4 7.5M12 12v9" />
                          </svg>
                        </div>
                        <div className="stat-content">
                          <div className="stat-value"><GroupItemCount groupName="Friends Group" /></div>
                          <div className="stat-label">Total Items</div>
                        </div>
                      </div>
    
                      <div className="stat-card">
                        <div className="stat-icon stat-icon-green">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 2 21 6 17 10" />
                            <path d="M3 11V9a3 3 0 0 1 3-3h15" />
                            <path d="m7 22-4-4 4-4" />
                            <path d="M21 13v2a3 3 0 0 1-3 3H3" />
                          </svg>
                        </div>
                        <div className="stat-content">
                          <div className="stat-value">{unresolvedLoans.length}</div>
                          <div className="stat-label">Active Loans</div>
                        </div>
                      </div>
    
                      <div className="stat-card">
                        <div className="stat-icon stat-icon-red">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="16" height="17" rx="2" />
                            <path d="M8 2v4M14 2v4M3 9h16" />
                            <circle cx="18" cy="17" r="4" />
                            <path d="M18 15v2l1.2.8" />
                          </svg>
                        </div>
                        <div className="stat-content">
                          <div className="stat-value">{overdueLoans.length}</div>
                          <div className="stat-label">Overdue</div>
                        </div>
                      </div>
    
                      <div className="stat-card">
                        <div className="stat-icon stat-icon-blue">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="8" r="3.5" />
                            <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
                            <path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M18 14a5.5 5.5 0 0 1 3.5 5.2" />
                          </svg>
                        </div>
                        <div className="stat-content">
                          <div className="stat-value">{groups.length}</div>
                          <div className="stat-label">Groups</div>
                        </div>
                      </div>
                    </div>
    
                    <div className="recent-activity">
                      <div className="activity-header">
                        <h2 className="activity-title">Recent Activity</h2>
                        <a href="#" className="view-all" onClick={event => { event.preventDefault(); setCurrentPage('loans') }}>View All</a>
                      </div>
    
                      <div className="activity-list">
                        {recentLoans.length ? recentLoans.map(loan => {
                          const dueText = loan.dueDate && unresolvedLoans.includes(loan)
                            ? new Date(loan.dueDate).getTime() < currentTime
                              ? 'Overdue'
                              : `Due ${new Date(loan.dueDate).toLocaleDateString()}`
                            : loan.returnDate
                              ? `Returned ${new Date(loan.returnDate).toLocaleDateString()}`
                              : new Date(loan.updatedAt || loan.createdAt).toLocaleDateString()
                          return <div className="activity-item" key={loan._id}>
                            <div className="activity-info">
                              <div className="activity-name">{activityLabel(loan)}</div>
                              <div className="activity-date">{dueText}</div>
                            </div>
                            <div className="activity-time">{relativeActivityTime(loan.updatedAt || loan.createdAt)}</div>
                          </div>
                        }) : <div className="activity-item activity-empty-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" />
                            <path d="m3.5 7.5 8.5 5 8.5-5M12 12.5V22" />
                          </svg>
                          <div className="activity-info"><div className="activity-name">No recent activity</div><div className="activity-date">Borrowing activity will appear here.</div></div>
                        </div>}
                      </div>
                    </div>
                  </>
    )
  )
}
