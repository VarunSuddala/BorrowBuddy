import GroupIcon from '../GroupIcon'
export default function InvitationsPage({ app }) {
  const { dataError, handleInvitation, handleMembershipRequest, invitations, ownerRequests } = app

  return (
    app.currentPage === 'invitations' && (
    <div className="invitations-page">
                    <header className="dashboard-header invitations-header"><div className="header-content"><h1 className="dashboard-greeting">Invitations</h1><p className="dashboard-subtitle">Accept or decline invitations before joining a group.</p></div></header>
                    {dataError && <div className="auth-message error">{dataError}</div>}
                    <section className="invitation-section">
                      <h2 className="invitation-section-title"><span><GroupIcon name="people" /></span>Groups You’re Invited To</h2>
                      <div className="invitation-table-scroll"><table className="invitations-table"><thead><tr><th>Group</th><th>Invited by</th><th>Status</th><th>Action</th></tr></thead><tbody>
                        {invitations.length ? invitations.map(invitation => <tr key={invitation._id}>
                          <td><strong>{invitation.groupId?.name || 'Group'}</strong></td>
                          <td>{invitation.requestType === 'member_request' ? 'Your membership request' : invitation.invitedBy?.name || invitation.inviterId?.name || 'Member'}</td>
                          <td><span className={`invitation-status ${invitation.status}`}>{invitation.status === 'accepted' && <GroupIcon name="check" />}{invitation.status}</span></td>
                          <td>{invitation.direction === 'incoming' && invitation.requestType !== 'member_request' && invitation.status === 'pending' ? <span className="invitation-row-actions"><button className="invitation-accept-button" onClick={() => handleInvitation(invitation._id, 'accept')}>Accept</button><button className="invitation-decline-button" onClick={() => handleInvitation(invitation._id, 'reject')}>Decline</button></span> : <span className="invitation-no-action">—</span>}</td>
                        </tr>) : <tr><td colSpan="4"><div className="invitation-empty-state"><GroupIcon name="mail" /><strong>No invitations.</strong><span>Group invitations will appear here when someone invites you.</span></div></td></tr>}
                      </tbody></table></div>
                    </section>
                    <section className="invitation-section">
                      <h2 className="invitation-section-title"><span><GroupIcon name="mail" /></span>Membership Requests</h2>
                      <div className="invitation-table-scroll"><table className="invitations-table"><thead><tr><th>Group</th><th>Requested by</th><th>Status</th><th>Action</th></tr></thead><tbody>
                        {ownerRequests.length ? ownerRequests.map(request => <tr key={request._id}>
                          <td><strong>{request.groupId?.name || 'Group'}</strong></td>
                          <td>{request.requestedBy?.name || request.invitedUserId?.name || request.inviteeId?.name || 'Member'}</td>
                          <td><span className={`invitation-status ${request.status}`}>{request.status === 'accepted' && <GroupIcon name="check" />}{request.status}</span></td>
                          <td>{request.status === 'pending' ? <span className="invitation-row-actions"><button className="invitation-accept-button" onClick={() => handleMembershipRequest(request._id, 'approve')}>Approve</button><button className="invitation-decline-button" onClick={() => handleMembershipRequest(request._id, 'reject')}>Reject</button></span> : <span className="invitation-no-action">—</span>}</td>
                        </tr>) : <tr><td colSpan="4"><div className="invitation-empty-state"><GroupIcon name="mail" /><strong>No pending membership requests.</strong><span>You’ll see group join requests here when someone asks to join.</span></div></td></tr>}
                      </tbody></table></div>
                    </section>
                  </div>
    )
  )
}
