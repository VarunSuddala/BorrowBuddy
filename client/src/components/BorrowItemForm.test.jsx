import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import BorrowItemForm from './BorrowItemForm'

afterEach(cleanup)

describe('BorrowItemForm', () => {
  const props = {
    item: { name: 'Camera', category: 'Electronics' },
    owner: { name: 'Ravi' },
    borrowerName: 'Asha',
    onCancel: vi.fn(),
    onSubmit: vi.fn(),
  }

  it('renders the selected item and submits the default borrowing request', () => {
    render(<BorrowItemForm {...props} />)
    expect(screen.getByText('Camera')).toBeInTheDocument()
    expect(screen.getByText('Owner: Ravi')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Request Borrow' }))
    expect(props.onSubmit).toHaveBeenCalledWith(expect.objectContaining({ durationDays: 7, purpose: '' }))
  })

  it('prevents invalid custom durations and exposes server errors', () => {
    render(<BorrowItemForm {...props} error="Item is unavailable" />)
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'custom' } })
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0' } })
    expect(screen.getByRole('button', { name: 'Request Borrow' })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent('Item is unavailable')
  })
})
