import { useMemo, useState } from 'react'
import GroupIcon from './GroupIcon'
import { getAssetUrl } from '../services/apiClient'
import './BorrowingHistory.css'

const filters = [
  { value: 'all', label: 'All' },
  { value: 'borrowed', label: 'Borrowed' },
  { value: 'lent', label: 'Lent' },
  { value: 'active', label: 'Active' },
  { value: 'returned', label: 'Returned' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
]

const terminalStatuses = new Set(['returned', 'rejected', 'cancelled'])

const idOf = value => String(value?._id || value || '')
const dateValue = value => value ? new Date(value).getTime() : 0
const formatDate = value => value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

function BorrowingHistory({ loans, user, loading, error }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const records = useMemo(() => {
    const currentUserId = idOf(user)
    const query = search.trim().toLowerCase()

    return loans
      .map(loan => ({
        ...loan,
        role: idOf(loan.borrowerId) === currentUserId ? 'borrowed' : 'lent',
      }))
      .filter(loan => {
        const matchesFilter = filter === 'all'
          || filter === loan.role
          || (filter === 'active' && !terminalStatuses.has(loan.status))
          || loan.status === filter
        const itemName = loan.itemId?.name || 'Deleted item'
        return matchesFilter && (!query || itemName.toLowerCase().includes(query))
      })
      .sort((a, b) => dateValue(b.checkoutDate || b.createdAt) - dateValue(a.checkoutDate || a.createdAt))
  }, [filter, loans, search, user])

  return (
    <section className="history-page" aria-labelledby="history-title">
      <header className="dashboard-header history-header">
        <div className="header-content">
          <h1 className="dashboard-greeting" id="history-title">Borrowing History</h1>
          <p className="dashboard-subtitle">A complete view of the items you borrow and lend.</p>
        </div>
      </header>

      <div className="history-content">
        <div className="history-controls">
          <label className="history-search">
            <GroupIcon name="search" />
            <span className="sr-only">Search history by item name</span>
            <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by item name..." />
          </label>
          <label className="history-sort">
            <span>Filter</span>
            <select value={filter} onChange={event => setFilter(event.target.value)} aria-label="Filter borrowing history">
              {filters.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        <div className="history-filter-pills" aria-label="History filters">
          {filters.map(option => <button key={option.value} type="button" className={filter === option.value ? 'active' : ''} onClick={() => setFilter(option.value)}>{option.label}</button>)}
        </div>

        {error ? <div className="history-state history-error" role="alert"><strong>Could not load your history.</strong><span>{error}</span></div>
          : loading ? <div className="history-state" role="status">Loading your borrowing history…</div>
            : records.length === 0 ? <div className="history-state"><strong>{loans.length ? 'No matching records' : 'No borrowing history yet'}</strong><span>{loans.length ? 'Try a different filter or search term.' : 'Borrow or lend an item to see it here.'}</span></div>
              : <div className="history-list">
                {records.map(loan => {
                  const item = loan.itemId
                  const itemName = item?.name || 'Deleted item'
                  const borrowerName = loan.borrowerId?.name || 'Deleted user'
                  const lenderName = loan.lenderId?.name || 'Deleted user'
                  const imageUrl = item?.imageUrl ? getAssetUrl(item.imageUrl) : ''
                  return <article className="history-card" key={loan._id}>
                    <div className="history-item-image">
                      {imageUrl ? <img src={imageUrl} alt="" /> : <GroupIcon name="box" />}
                    </div>
                    <div className="history-item-main">
                      <div className="history-item-heading"><h2>{itemName}</h2><span className={`history-status ${loan.status}`}>{loan.status}</span></div>
                      <p className="history-parties"><span>{loan.role === 'borrowed' ? 'Lender' : 'Borrower'}:</span> {loan.role === 'borrowed' ? lenderName : borrowerName}</p>
                      <div className="history-details">
                        <span><b>Checked out</b>{formatDate(loan.checkoutDate)}</span>
                        <span><b>Expected return</b>{formatDate(loan.dueDate)}</span>
                        {loan.returnDate && <span><b>Returned</b>{formatDate(loan.returnDate)}</span>}
                        {loan.groupId?.name && <span><b>Group</b>{loan.groupId.name}</span>}
                      </div>
                    </div>
                    <span className={`history-role ${loan.role}`}>{loan.role === 'borrowed' ? 'Borrowed' : 'Lent'}</span>
                  </article>
                })}
              </div>}
      </div>
    </section>
  )
}

export default BorrowingHistory
