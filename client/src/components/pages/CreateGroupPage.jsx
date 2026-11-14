export default function CreateGroupPage({ app }) {
  const { availableMembers, categories, groupDescription, groupImage, groupName, handleCreateGroup, handleImageUpload, memberSearchQuery, membersLoading, selectedCategories, setCurrentPage, setGroupDescription, setGroupImage, setGroupName, setMemberSearchQuery, toggleCategory, toggleMember } = app

  return (
    app.currentPage === 'create-group' && (
    <div className="create-group-page">
                    <header className="dashboard-header create-group-header">
                      <div className="header-content">
                        <div className="create-group-title-row">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          <h1 className="dashboard-greeting">Create New Group</h1>
                        </div>
                        <p className="dashboard-subtitle">Create a new group to share and borrow items with your friends</p>
                      </div>
                    </header>
    
                    <div className="create-group-container">
                      <div className="create-group-form">
                        {/* Group Details Section */}
                        <div className="form-section">
                          <div className="section-header">
                            <h3 className="section-title">Group Details</h3>
                          </div>
    
                          <div className="group-details-grid">
                            <div className="image-upload-section">
                              <label className="image-upload-label">
                                <input
                                  type="file"
                                  accept="image/png, image/jpeg, image/jpg"
                                  onChange={handleImageUpload}
                                  className="image-upload-input"
                                />
                                <div className="image-upload-placeholder">
                                  {groupImage ? (
                                    <img src={URL.createObjectURL(groupImage)} alt="Group" className="uploaded-image" />
                                  ) : (
                                    <>
                                      <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21 15 16 10 5 21" />
                                      </svg>
                                      <span className="upload-text">Add Group Image</span>
                                      <span className="upload-subtext">PNG/JPG, max 2MB</span>
                                    </>
                                  )}
                                </div>
                              </label>
                              {groupImage && (
                                <button
                                  className="btn-remove-group-image"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setGroupImage(null)
                                  }}
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                  Remove Image
                                </button>
                              )}
                            </div>
    
                            <div className="group-inputs-section">
                              <div className="form-group">
                                <label className="form-label">Group Name *</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  placeholder="Enter group name"
                                  value={groupName}
                                  onChange={(e) => setGroupName(e.target.value)}
                                />
                              </div>
    
                              <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                  className="form-textarea"
                                  placeholder="Tell others what this group is about..."
                                  value={groupDescription}
                                  onChange={(e) => {
                                    if (e.target.value.length <= 150) {
                                      setGroupDescription(e.target.value)
                                    }
                                  }}
                                  maxLength={150}
                                />
                                <div className="char-counter">{groupDescription.length}/150</div>
                              </div>
                            </div>
                          </div>
                        </div>
    
                        <div className="section-divider"></div>
    
                        {/* Choose Categories Section */}
                        <div className="form-section">
                          <div className="section-header">
                            <h3 className="section-title">Choose Categories</h3>
                          </div>
    
                          <div className="categories-grid">
                            {categories.map((category) => (
                              <button
                                key={category.id}
                                className={`category-pill ${selectedCategories.includes(category.id) ? 'selected' : ''}`}
                                onClick={() => toggleCategory(category.id)}
                              >
                                <span className="category-icon">{category.icon}</span>
                                <span className="category-name">{category.name}</span>
                                {selectedCategories.includes(category.id) && (
                                  <svg className="category-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
    
                        <div className="section-divider"></div>
    
                        {/* Add Members Section */}
                        <div className="form-section">
                          <div className="section-header">
                            <h3 className="section-title">Add Members</h3>
                          </div>
    
                          <div className="add-members-content">
                          <div className="form-group">
                            <div className="input-with-icon">
                              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                              </svg>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="Search by name or email..."
                                value={memberSearchQuery}
                                onChange={(e) => setMemberSearchQuery(e.target.value)}
                              />
                            </div>
                          </div>
    
                          {membersLoading ? (
                            <p>Loading users...</p>
                          ) : (
                          <div className="members-list">
                            {availableMembers
                              .filter(member =>
                                member.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                                member.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
                              )
                              .map((member) => (
                                <div key={member.id} className="member-item">
                                  <div className="member-avatar">
                                    {member.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="member-details">
                                    <div className="member-name">{member.name}</div>
                                    <div className="member-email">{member.email}</div>
                                  </div>
                                  <input
                                    type="checkbox"
                                    className="member-checkbox"
                                    checked={member.selected}
                                    onChange={() => toggleMember(member.id)}
                                  />
                                </div>
                              ))}
                          </div>
                          )}
                          </div>
                        </div>
    
                        <div className="form-actions">
                          <button className="btn-cancel" onClick={() => setCurrentPage('my-groups')}>
                            Cancel
                          </button>
                          <button className="btn-create" onClick={handleCreateGroup}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Create Group
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
    )
  )
}
