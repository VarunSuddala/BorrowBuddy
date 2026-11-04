import { useState } from 'react'
import GroupIcon from './GroupIcon'

const toInputDate = date => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}
const itemIcon = item => {
  const name = `${item.category || ''} ${item.name || ''}`.toLowerCase()
  if (name.includes('headphone')) return 'headphones'
  if (name.includes('book')) return 'book'
  if (name.includes('laptop') || name.includes('computer')) return 'laptop'
  if (name.includes('usb') || name.includes('cable')) return 'usb'
  return 'box'
}

function BorrowItemForm({ item, owner, borrowerName, onCancel, onSubmit, busy = false, error = '' }) {
  const checkoutDate = toInputDate(new Date())
  const [duration, setDuration] = useState('7')
  const [customDuration, setCustomDuration] = useState('')
  const [returnDate, setReturnDate] = useState(() => {
    const due = new Date()
    due.setDate(due.getDate() + 7)
    return toInputDate(due)
  })
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const selected = new Date(`${returnDate}T12:00:00`)
    return new Date(selected.getFullYear(), selected.getMonth(), 1)
  })
  const [purpose, setPurpose] = useState('')

  const selectedReturnDate = new Date(`${returnDate}T12:00:00`)
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(calendarMonth)
  const dateLabel = new Intl.DateTimeFormat(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' }).format(selectedReturnDate)
  const calendarStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
  calendarStart.setDate(calendarStart.getDate() - calendarStart.getDay())
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart)
    date.setDate(calendarStart.getDate() + index)
    return date
  })

  const changeDuration = value => {
    setDuration(value)
    if (value !== 'custom') setCustomDuration('')
    const due = new Date()
    if (value !== 'custom') {
      due.setDate(due.getDate() + Number(value))
      setReturnDate(toInputDate(due))
    }
  }
  const durationDays = duration === 'custom' ? Number(customDuration) : Number(duration)
  const handleSubmit = event => {
    event.preventDefault()
    if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 365 || !returnDate || returnDate < checkoutDate) return
    onSubmit({ checkoutDate, returnDate, durationDays, purpose: purpose.trim() })
  }

  return (
    <section className="borrow-form-page">
      <header className="borrow-form-page-header">
        <button type="button" onClick={onCancel} aria-label="Back to View Group"><GroupIcon name="back" /></button>
        <h1>Borrow Item</h1>
      </header>
      <form className="borrow-form-card" onSubmit={handleSubmit}>
        <div className="borrow-selected-item">
          <span className="borrow-selected-icon"><GroupIcon name={itemIcon(item)} /></span>
          <div><strong>{item.name}</strong><span className="borrow-available-badge">Available</span><small>Owner: {owner.name}</small></div>
        </div>
        <div className="borrow-form-fields">
          <label className="borrow-form-field"><span>Borrow Duration <b>*</b></span>
            <select value={duration} onChange={event => changeDuration(event.target.value)}>
              <option value="7">7 days</option><option value="14">14 days</option><option value="30">30 days</option><option value="custom">Custom days</option>
            </select>
          </label>
          {duration === 'custom' && <label className="borrow-form-field"><span>Custom Duration (days) <b>*</b></span>
            <input
              type="number"
              min="1"
              max="365"
              step="1"
              value={customDuration}
              onChange={event => {
                const value = event.target.value
                setCustomDuration(value)
                if (Number.isInteger(Number(value)) && Number(value) >= 1) {
                  const due = new Date()
                  due.setDate(due.getDate() + Number(value))
                  setReturnDate(toInputDate(due))
                }
              }}
              required
            />
          </label>}
          <label className="borrow-form-field"><span>Return Date</span>
            <span className="borrow-date-picker">
              <span className="borrow-date-input">
                <GroupIcon name="calendar" />
                <input type="text" value={dateLabel} readOnly onClick={() => {
                  const selected = new Date(`${returnDate}T12:00:00`)
                  setCalendarMonth(new Date(selected.getFullYear(), selected.getMonth(), 1))
                  setCalendarOpen(open => !open)
                }} aria-label="Return date" aria-expanded={calendarOpen} aria-haspopup="dialog" />
                <button type="button" onClick={() => {
                  const selected = new Date(`${returnDate}T12:00:00`)
                  setCalendarMonth(new Date(selected.getFullYear(), selected.getMonth(), 1))
                  setCalendarOpen(open => !open)
                }} aria-label={calendarOpen ? 'Close calendar' : 'Open calendar'}><GroupIcon name="calendar" /></button>
              </span>
              {calendarOpen && <span className="borrow-calendar" role="dialog" aria-label="Choose return date">
                <span className="borrow-calendar-header">
                  <strong>{monthLabel}</strong>
                  <span>
                    <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} aria-label="Previous month">‹</button>
                    <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} aria-label="Next month">›</button>
                  </span>
                </span>
                <span className="borrow-calendar-grid borrow-calendar-weekdays" aria-hidden="true">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
                </span>
                <span className="borrow-calendar-grid">
                  {calendarDays.map((date, index) => {
                    const value = toInputDate(date)
                    const isCurrentMonth = date.getMonth() === calendarMonth.getMonth()
                    const isSelected = value === returnDate
                    return <button
                      type="button"
                      key={`${value}-${index}`}
                      className={`${isCurrentMonth ? '' : 'outside-month'} ${isSelected ? 'selected' : ''}`}
                      disabled={value < checkoutDate}
                      onClick={() => { setReturnDate(value); setCalendarOpen(false) }}
                      aria-pressed={isSelected}
                    >{date.getDate()}</button>
                  })}
                </span>
                <span className="borrow-calendar-footer"><button type="button" onClick={() => { setReturnDate(checkoutDate); setCalendarMonth(new Date(`${checkoutDate}T12:00:00`)); setCalendarOpen(false) }}>Today</button></span>
              </span>}
            </span>
          </label>
          <label className="borrow-form-field borrow-purpose-field"><span>Purpose (optional)</span>
            <textarea maxLength={200} value={purpose} onChange={event => setPurpose(event.target.value)} placeholder="e.g., Project work, Exam preparation..." />
            <small>{purpose.length}/200</small>
          </label>
        </div>
        {error && <p className="borrow-form-error" role="alert">{error}</p>}
        <footer className="borrow-form-actions">
          <span className="borrow-form-borrower">Requesting as {borrowerName}</span>
          <div><button type="button" className="borrow-secondary-button" onClick={onCancel}>Cancel</button><button type="submit" className="borrow-primary-button" disabled={busy || !Number.isInteger(durationDays) || durationDays < 1 || durationDays > 365 || !returnDate || returnDate < checkoutDate}>{busy ? 'Requesting…' : 'Request Borrow'}</button></div>
        </footer>
      </form>
    </section>
  )
}

export default BorrowItemForm
