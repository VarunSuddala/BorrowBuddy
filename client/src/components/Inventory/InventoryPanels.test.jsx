import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { InvitationsPanel, NotificationsPanel } from './InventoryPanels'

afterEach(cleanup)

describe('Inventory panels', () => {
  it('renders an empty invitations state', () => {
    render(<InvitationsPanel invitations={[]} onRespond={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('No invitations yet')).toBeInTheDocument()
  })

  it('responds to invitations and borrowing requests', () => {
    const onInvitation = vi.fn()
    const onRequest = vi.fn()
    render(<>
      <InvitationsPanel invitations={[{ _id: 'inv-1', groupName: 'Friends', inviterName: 'Ravi', status: 'pending' }]} onRespond={onInvitation} onClose={vi.fn()} />
      <NotificationsPanel requests={[{ _id: 'loan-1', borrowerId: { name: 'Asha' }, itemId: { name: 'Camera' }, status: 'requested' }]} onRespond={onRequest} respondingRequestId="" onClose={vi.fn()} />
    </>)
    const acceptButtons = screen.getAllByRole('button', { name: 'Accept' })
    fireEvent.click(acceptButtons[0])
    fireEvent.click(acceptButtons[1])
    expect(onInvitation).toHaveBeenCalledWith('inv-1', 'accepted')
    expect(onRequest).toHaveBeenCalledWith('loan-1', 'approved')
  })
})
