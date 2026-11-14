import GroupItemCount from '../Inventory/GroupItemCount'
import { getAssetUrl as getAssetUrl } from '../../services/apiClient'
export default function MyGroupsPage({ app }) {
  const { activeGroupSection, categories, dataError, discoverableGroups, groupSearchQuery, groups, handleJoinRequest, handleViewGroup, setActiveGroupSection, setCurrentPage, setGroupSearchQuery } = app

  return (
    app.currentPage === 'my-groups' && (
    <div className="my-groups-page">
                    <header className="dashboard-header my-groups-header">
                      <div className="header-content">
                        <div className="my-groups-heading-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        </div>
                        <div className="my-groups-heading-copy">
                          <h1 className="dashboard-greeting">My Groups</h1>
                        <p className="dashboard-subtitle">Join and manage your groups to share, borrow, and make better use of resources together</p>
                        </div>
                      </div>
                      <div className="groups-stats">
                        <div className="group-stat-card group-stat-blue">
                          <div className="group-stat-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                          </div>
                          <div className="group-stat-content"><div className="group-stat-value">{groups.length}</div><div className="group-stat-label">Total Groups</div></div>
                        </div>
                        <div className="group-stat-card group-stat-green">
                          <div className="group-stat-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6m3-3h-6" /></svg>
                          </div>
                          <div className="group-stat-content"><div className="group-stat-value">{groups.reduce((acc, group) => acc + (group.memberIds?.length || 0), 0)}</div><div className="group-stat-label">Total Members</div></div>
                        </div>
                        <div className="group-stat-card group-stat-orange">
                          <div className="group-stat-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4 4-4-4 4-4" /></svg>
                          </div>
                          <div className="group-stat-content"><div className="group-stat-value">0</div><div className="group-stat-label">Active Loans</div></div>
                        </div>
                      </div>
                      <button className="create-group-btn" onClick={() => setCurrentPage('create-group')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Create Group
                      </button>
                    </header>
    
                    {dataError && <div className="auth-message error">{dataError}</div>}
                <div className="groups-content">
                      <div className="groups-main">
                        <div className="groups-search-bar">
                          <div className="search-input-wrapper">
                            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="11" cy="11" r="8" />
                              <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                          type="text"
                          placeholder="Search your groups..."
                          className="search-input"
                          value={groupSearchQuery}
                          onChange={(e) => setGroupSearchQuery(e.target.value)}
                        />
                          </div>
                          <select className="category-select" disabled>
                            <option>All Categories</option>
                            <option>Books</option>
                            <option>Electronics</option>
                            <option>Sports</option>
                            <option>Tools</option>
                          </select>
                        </div>
    
                        <div className="groups-tabs" aria-label="Group sections">
                          <button type="button" className={`groups-tab ${activeGroupSection === 'created' ? 'active' : ''}`} onClick={() => setActiveGroupSection('created')} aria-pressed={activeGroupSection === 'created'}><span className="groups-tab-dot" />Groups Created</button>
                          <button type="button" className={`groups-tab ${activeGroupSection === 'discover' ? 'active' : ''}`} onClick={() => setActiveGroupSection('discover')} aria-pressed={activeGroupSection === 'discover'}><span className="groups-tab-dot" />Discover Groups</button>
                          <div className="groups-tab"><span className="groups-tab-dot" />Recent Activity</div>
                        </div>
    
                        {activeGroupSection === 'created' && <div className="groups-list">
                          {groups.length === 0 ? (
                            <div className="no-groups-message">
                              <p>No groups yet. Create your first group to get started!</p>
                            </div>
                          ) : (
                            groups.map((group) => (
                              <div key={group._id} className="group-compact-card">
                                <div className="group-compact-left">
                                  {group.image ? (
                                    <img src={getAssetUrl(group.image)} alt={group.name} className="group-compact-image" />
                                  ) : (
                                    <div className="group-compact-icon">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="group-compact-center">
                                  <h3 className="group-compact-name">{group.name}</h3>
                                  <div className="group-compact-tags">
                                    {group.categories && group.categories.map((cat, idx) => (
                                      <span key={idx} className="group-compact-tag">{cat}</span>
                                    ))}
                                  </div>
                                  <p className="group-compact-desc">{group.description || 'No description'}</p>
                                </div>
                                <div className="group-compact-right">
                                  <button className="group-compact-view-btn" onClick={() => handleViewGroup(group._id)}>
                                    View Group
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                  </button>
                                </div>
                                <div className="group-compact-bottom">
                                  <div className="group-compact-members">
                                    {group.memberIds && group.memberIds.slice(0, 4).map((member, idx) => (
                                      <div key={idx} className={`member-avatar-compact ${['charcoal', 'slate', 'purple', 'light'][idx % 4]}`}>
                                        {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                                      </div>
                                    ))}
                                    {group.memberIds && group.memberIds.length > 4 && (
                                      <div className="member-avatar-more-compact">+{group.memberIds.length - 4}</div>
                                    )}
                                    <span className="member-count-compact">{group.memberIds?.length || 0} members</span>
                                  </div>
                                  <div className="group-compact-stats">
                                    <div className="stat-with-icon">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                      </svg>
                                      <span><GroupItemCount groupName={group.name} /> items</span>
                                    </div>
                                    <div className="stat-with-icon">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                                      </svg>
                                      <span><GroupItemCount groupName={group.name} type="loans" /> active loans</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>}
    
                        {activeGroupSection === 'discover' && <div className="groups-list discover-groups-list">
                          {discoverableGroups.length === 0 ? (
                            <div className="no-groups-message">
                              <p>No groups available to discover right now.</p>
                            </div>
                          ) : <>
                            <h2 className="activity-title">Discover Groups</h2>
                            {discoverableGroups.map(group => <div key={group._id} className="group-compact-card">
                              <div className="group-compact-center">
                                <h3 className="group-compact-name">{group.name}</h3>
                                <p className="group-compact-desc">{group.description || 'No description'}</p>
                                <span className="member-count-compact">{group.memberIds?.length || 0} members</span>
                              </div>
                              <div className="group-compact-right">
                                <button className="group-compact-view-btn" onClick={() => handleJoinRequest(group._id)}>Request to Join</button>
                              </div>
                            </div>)}
                          </>}
                        </div>}
                      </div>
    
                      <aside className="groups-sidebar">
                        <div className="sidebar-section">
                          <div className="sidebar-section-header">
                            <div className="sidebar-section-header-with-icon">
                              <svg className="recent-activity-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              <h3 className="sidebar-section-title">Recent Activity</h3>
                            </div>
                            <a href="#" className="view-all-link">View All</a>
                          </div>
                          <div className="activity-feed">
                            <div className="feed-item">
                              <div className="feed-icon feed-icon-blue">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                  <circle cx="8.5" cy="7" r="4" />
                                  <line x1="20" y1="8" x2="20" y2="14" />
                                  <line x1="23" y1="11" x2="17" y2="11" />
                                </svg>
                              </div>
                              <div className="feed-content">
                                <div className="feed-row-top">
                                  <p className="feed-text">New member joined</p>
                                  <span className="feed-time">2h ago</span>
                                </div>
                                <p className="feed-description">Rahul joined Friends Group</p>
                              </div>
                            </div>
    
                            <div className="feed-item">
                              <div className="feed-icon feed-icon-green">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                </svg>
                              </div>
                              <div className="feed-content">
                                <div className="feed-row-top">
                                  <p className="feed-text">Item borrowed</p>
                                  <span className="feed-time">5h ago</span>
                                </div>
                                <p className="feed-description">Book borrowed by Kiran</p>
                              </div>
                            </div>
    
                            <div className="feed-item">
                              <div className="feed-icon feed-icon-orange">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </div>
                              <div className="feed-content">
                                <div className="feed-row-top">
                                  <p className="feed-text">Item returned</p>
                                  <span className="feed-time">1d ago</span>
                                </div>
                                <p className="feed-description">Charger returned by Srikar</p>
                              </div>
                            </div>
    
                            <div className="feed-item">
                              <div className="feed-icon feed-icon-blue">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                  <circle cx="8.5" cy="7" r="4" />
                                  <line x1="20" y1="8" x2="20" y2="14" />
                                  <line x1="23" y1="11" x2="17" y2="11" />
                                </svg>
                              </div>
                              <div className="feed-content">
                                <div className="feed-row-top">
                                  <p className="feed-text">New member joined</p>
                                  <span className="feed-time">2d ago</span>
                                </div>
                                <p className="feed-description">Priya joined College Group</p>
                              </div>
                            </div>
    
                            <div className="feed-item">
                              <div className="feed-icon feed-icon-orange">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </div>
                              <div className="feed-content">
                                <div className="feed-row-top">
                                  <p className="feed-text">Group updated</p>
                                  <span className="feed-time">3d ago</span>
                                </div>
                                <p className="feed-description">Group settings were updated</p>
                              </div>
                            </div>
                          </div>
                        </div>
    
                        <div className="sidebar-section">
                          <div className="sidebar-section-header-with-icon">
                            <svg className="quick-actions-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                            <h3 className="sidebar-section-title">Quick Actions</h3>
                          </div>
                          <div className="quick-actions">
                            <div className="quick-action-card quick-action-create">
                              <div className="quick-action-icon-container">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="12" y1="5" x2="12" y2="19" />
                                  <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                              </div>
                              <div className="quick-action-content">
                                <h4 className="quick-action-title">Create New Group</h4>
                                <p className="quick-action-desc">Start a new group with your friends or colleagues</p>
                              </div>
                              <svg className="quick-action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </div>
                            <div className="quick-action-card quick-action-explore" role="button" tabIndex={0} onClick={() => setActiveGroupSection('discover')} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setActiveGroupSection('discover') } }}>
                              <div className="quick-action-icon-container quick-action-icon-blue">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10" />
                                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                                </svg>
                              </div>
                              <div className="quick-action-content">
                                <h4 className="quick-action-title">Explore Groups</h4>
                                <p className="quick-action-desc">Find and join public groups</p>
                              </div>
                              <svg className="quick-action-arrow quick-action-arrow-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </div>
                            <div className="quick-action-card quick-action-invite">
                              <div className="quick-action-icon-container">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <path d="M19 8v6m3-3h-6" />
                                </svg>
                              </div>
                              <div className="quick-action-content">
                                <h4 className="quick-action-title">Invite Friends</h4>
                                <p className="quick-action-desc">Add friends to your groups</p>
                              </div>
                              <svg className="quick-action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </aside>
                    </div>
                  </div>
    )
  )
}
