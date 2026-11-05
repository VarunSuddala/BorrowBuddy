import { useState } from 'react'
import GroupIcon from './GroupIcon'

const toInputDate = date => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

function ReturnItemForm({ item, owner, onCancel, onSubmit, busy = false, error = '' }) {
  const [returnDate, setReturnDate] = useState(() => toInputDate(new Date()))
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [note, setNote] = useState('')

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

  const handleSubmit = event => {
    event.preventDefault()
    if (!returnDate) return
    onSubmit({ returnDate, note: note.trim() })
  }

  return <section className="return-form-page">
    <header className="borrow-form-page-header">
      <button type="button" onClick={onCancel} aria-label="Back to borrowed items"><GroupIcon name="back" /></button>
      <h1>Return Item</h1>
    </header>
    <form className="return-form-card" onSubmit={handleSubmit}>
      <div className="return-selected-item">
        <span className="return-selected-icon"><GroupIcon name="box" /></span>
        <div><strong>{item.name}</strong><span>{item.category || 'General'}</span>{owner?.name && <small>Owner: {owner.name}</small>}</div>
      </div>
      <label className="return-form-field"><span>Return Date <b>*</b></span>
        <span className="borrow-date-picker return-date-picker">
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
          {calendarOpen && <span className="borrow-calendar return-calendar" role="dialog" aria-label="Choose return date">
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
                  onClick={() => { setReturnDate(value); setCalendarOpen(false) }}
                  aria-pressed={isSelected}
                >{date.getDate()}</button>
              })}
            </span>
            <span className="borrow-calendar-footer"><button type="button" onClick={() => { const today = toInputDate(new Date()); setReturnDate(today); setCalendarMonth(new Date(`${today}T12:00:00`)); setCalendarOpen(false) }}>Today</button></span>
          </span>}
        </span>
      </label>
      <label className="return-form-field"><span>Note (optional)</span>
        <textarea maxLength={500} value={note} onChange={event => setNote(event.target.value)} placeholder="Item returned in good condition." />
      </label>
      {error && <p className="borrow-form-error" role="alert">{error}</p>}
      <footer className="return-form-actions">
        <button type="button" className="borrow-secondary-button" onClick={onCancel}>Cancel</button>
        <button type="submit" className="return-confirm-button" disabled={busy || !returnDate}>{busy ? 'Returning…' : 'Confirm Return'}</button>
      </footer>
    </form>
  </section>
}

export default ReturnItemForm
