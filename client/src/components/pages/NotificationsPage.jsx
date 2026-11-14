import GroupIcon from '../GroupIcon'
export default function NotificationsPage({ app }) {
  const { borrowRequestResults, dataError, handleBorrowRequest, loanActionId, notifications, notificationsLoading } = app

  return (
    app.currentPage === 'notifications' && (
    <>
                    <header className="dashboard-header notifications-header"><div className="header-content"><h1 className="dashboard-greeting">Notifications</h1><p className="dashboard-subtitle">Stay updated on invitations, borrow requests, and returns.</p></div></header>
                    {dataError && <div className="auth-message error">{dataError}</div>}
                    <div className="notification-list">
                      {notificationsLoading ? <div className="notification-empty">Loading notifications…</div> : notifications.length === 0 ? <div className="notification-empty"><strong>No notifications yet</strong><span>You're all caught up.</span></div> : notifications.map(notification => {
                        const loanStatus = notification.data?.loanStatus || notification.data?.loanId?.status
                        const resolution = notification.resolution || (loanStatus === 'rejected' ? 'rejected' : ['active', 'booked', 'returned'].includes(loanStatus) ? 'accepted' : '')
                        const requestResult = borrowRequestResults[notification._id] || (resolution === 'accepted' ? 'Accepted the request' : resolution === 'rejected' ? 'Rejected the request' : '')
                        return <article key={notification._id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
                        <div className="notification-icon" aria-hidden="true"><GroupIcon name={notification.type === 'item_returned' ? 'return' : notification.type?.includes('membership') || notification.type?.includes('invitation') ? 'people' : notification.type === 'general' ? 'bell' : 'box'} /></div>
                        <div className="notification-content">
                          <div className="notification-item-title">{notification.title}</div>
                          <div className="notification-item-msg">{notification.message}</div>
                          <div className="notification-item-time">{new Date(notification.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="notification-actions">
                          {requestResult && notification.type === 'borrow_request' && <span className={`notification-action-result${requestResult.startsWith('Rejected') ? ' rejected' : ''}`} role="status">{requestResult}</span>}
                          {!requestResult && notification.type === 'borrow_request' && notification.data?.loanId && (!loanStatus || loanStatus === 'requested') && (
                            <>
                              <button
                                type="button"
                                className="notification-action-reject"
                                disabled={loanActionId === String(notification.data.loanId?._id || notification.data.loanId)}
                                onClick={() => handleBorrowRequest(notification, 'reject')}
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                className="notification-action-approve"
                                disabled={loanActionId === String(notification.data.loanId?._id || notification.data.loanId)}
                                onClick={() => handleBorrowRequest(notification, 'approve')}
                              >
                                Accept
                              </button>
                            </>
                          )}
                        </div>
                        </article>
                      })}
                    </div>
                  </>
    )
  )
}
