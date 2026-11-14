export default function ProfilePage({ app }) {
  const { profileImage, setProfileImage, user } = app

  return (
    app.currentPage === 'profile' && (
    <>
                    <header className="dashboard-header">
                      <div className="header-content">
                        <h1 className="dashboard-greeting">Profile</h1>
                        <p className="dashboard-subtitle">Manage your account settings and profile information</p>
                      </div>
                    </header>
    
                    <div className="profile-container">
                      <div className="profile-form">
                        <div className="profile-image-section">
                          <div className="profile-image-wrapper">
                            {profileImage ? (
                              <img src={URL.createObjectURL(profileImage)} alt="Profile" className="profile-image-preview" />
                            ) : (
                              <div className="profile-image-placeholder">
                                {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="profile-image-actions">
                            <label className="btn-upload-image">
                              <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={(e) => {
                                  const file = e.target.files[0]
                                  if (file) {
                                    if (file.size > 2 * 1024 * 1024) {
                                      alert('File size must be less than 2MB')
                                      return
                                    }
                                    setProfileImage(file)
                                  }
                                }}
                                className="image-upload-input"
                              />
                              Upload Image
                            </label>
                            {profileImage && (
                              <button className="btn-remove-image" onClick={() => setProfileImage(null)}>
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
    
                        <div className="profile-details-section">
                          <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                              type="text"
                              className="form-input"
                              value={user?.name || ''}
                              disabled
                            />
                          </div>
    
                          <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                              type="email"
                              className="form-input"
                              value={user?.email || ''}
                              disabled
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
    )
  )
}
