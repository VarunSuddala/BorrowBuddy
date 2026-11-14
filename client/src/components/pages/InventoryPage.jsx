import Inventory from '../Inventory/Inventory'
export default function InventoryPage({ app }) {
  const { handleInvitation, invitations } = app

  return (
    app.currentPage === 'inventory' && (
    <Inventory invitations={invitations.filter(invitation => invitation.direction !== 'outgoing')} onInvitation={handleInvitation} />
    )
  )
}
