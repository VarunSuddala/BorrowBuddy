import ViewGroup from '../ViewGroup'
export default function ViewGroupPage({ app }) {
  const { groups, handleDeleteGroup, handleLeaveGroup, selectedGroupId, setCurrentPage } = app

  return (
    app.currentPage === 'view-group' && (
    <ViewGroup
                    groupId={selectedGroupId}
                    group={groups.find(group => group._id === selectedGroupId)}
                    onBack={() => setCurrentPage('my-groups')}
                    onGroupLeft={handleLeaveGroup}
                    onDeleteGroup={handleDeleteGroup}
                  />
    )
  )
}
