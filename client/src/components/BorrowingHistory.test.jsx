import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import BorrowingHistory from './BorrowingHistory'

afterEach(cleanup)

const user = { _id: 'borrower-1' }
const loans = [
  {
    _id: 'loan-1',
    borrowerId: { _id: 'borrower-1', name: 'Asha' },
    lenderId: { _id: 'lender-1', name: 'Ravi' },
    itemId: { _id: 'item-1', name: 'Camera' },
    checkoutDate: '2026-11-04T00:00:00.000Z',
    dueDate: '2026-11-10T00:00:00.000Z',
    status: 'active',
  },
  {
    _id: 'loan-2',
    borrowerId: { _id: 'borrower-2', name: 'Mina' },
    lenderId: { _id: 'borrower-1', name: 'Asha' },
    itemId: { _id: 'item-2', name: 'Projector' },
    checkoutDate: '2026-11-05T00:00:00.000Z',
    dueDate: '2026-11-08T00:00:00.000Z',
    returnDate: '2026-11-07T00:00:00.000Z',
    status: 'returned',
  },
]

describe('BorrowingHistory', () => {
  it('renders borrowed and lent records and filters by role and item name', () => {
    render(<BorrowingHistory loans={loans} user={user} loading={false} error="" />)

    expect(screen.getByText('Camera')).toBeInTheDocument()
    expect(screen.getByText('Projector')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Borrowed' }))
    expect(screen.getByText('Camera')).toBeInTheDocument()
    expect(screen.queryByText('Projector')).not.toBeInTheDocument()

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'camera' } })
    expect(screen.getByText('Camera')).toBeInTheDocument()
  })

  it('filters returned records by lifecycle status', () => {
    render(<BorrowingHistory loans={loans} user={user} loading={false} error="" />)

    fireEvent.click(screen.getByRole('button', { name: 'Returned' }))
    expect(screen.getByText('Projector')).toBeInTheDocument()
    expect(screen.queryByText('Camera')).not.toBeInTheDocument()
  })

  it('renders loading, error, and empty states', () => {
    const { rerender } = render(<BorrowingHistory loans={[]} user={user} loading error="" />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading')

    rerender(<BorrowingHistory loans={[]} user={user} loading={false} error="Network failed" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Network failed')

    rerender(<BorrowingHistory loans={[]} user={user} loading={false} error="" />)
    expect(screen.getByText('No borrowing history yet')).toBeInTheDocument()
  })
})
