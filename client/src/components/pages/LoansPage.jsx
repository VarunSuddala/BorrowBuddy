export default function LoansPage({ app }) {
  const { currentPage, dataError, handleLoanAction, loanActionId, loans, user } = app

  return (
    (app.currentPage === 'loans' || app.currentPage === 'history') && (
    <>
                    <header className="dashboard-header">
                      <div className="header-content">
                        <h1 className="dashboard-greeting">{currentPage === 'loans' ? 'Loans' : 'Loan History'}</h1>
                        <p className="dashboard-subtitle">Track requests, active loans, and returns.</p>
                      </div>
                    </header>
                    {dataError && <div className="auth-message error">{dataError}</div>}
                    <div className="loans-table-wrapper">
                      <table className="loans-table">
                        <thead><tr><th>Item</th><th>Role</th><th>Other party</th><th>Status</th><th>Due</th><th>Action</th></tr></thead>
                        <tbody>
                          {loans.filter(loan => currentPage === 'history' ? ['returned', 'rejected', 'cancelled'].includes(loan.status) : !['returned', 'rejected', 'cancelled'].includes(loan.status)).map(loan => {
                            const borrower = loan.borrowerId?._id === user?._id
                            const otherParty = borrower ? loan.lenderId?.name : loan.borrowerId?.name
                            const action = loan.status === 'requested' && !borrower ? 'approve' : loan.status === 'booked' ? 'activate' : loan.status === 'active' ? 'return' : null
                            return <tr key={loan._id}><td>{loan.itemId?.name || 'Item'}</td><td>{borrower ? 'Borrower' : 'Owner'}</td><td>{otherParty || '—'}</td><td>{loan.status}</td><td>{loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : '—'}</td><td>{action && <button className="btn-borrow" disabled={loanActionId === loan._id} onClick={() => handleLoanAction(loan._id, action)}>{loanActionId === loan._id ? 'Updating…' : action}</button>}{loan.status === 'requested' && !borrower && <button className="btn-cancel" disabled={loanActionId === loan._id} onClick={() => handleLoanAction(loan._id, 'reject')}>Reject</button>}</td></tr>
                          })}
                        </tbody>
                      </table>
                      {loans.filter(loan => currentPage === 'history' ? ['returned', 'rejected', 'cancelled'].includes(loan.status) : !['returned', 'rejected', 'cancelled'].includes(loan.status)).length === 0 && <div className="no-groups-message"><p>No loans to show.</p></div>}
                    </div>
                  </>
    )
  )
}
