import { useState, useEffect } from 'react'
import heroImage from './assets/borrowbuddy-hero-reference.png'
import './App.css'
import ViewGroup from './components/ViewGroup'
import GroupIcon from './components/GroupIcon'
import Inventory from './components/Inventory/Inventory'
import GroupItemCount from './components/Inventory/GroupItemCount'
import { BorrowBuddyProvider } from './context/BorrowBuddyContext'
import { apiRequest, getAssetUrl } from './services/apiClient'

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [showLoginPage, setShowLoginPage] = useState(false)
  const [loginPageMode, setLoginPageMode] = useState('login')
  const [landingAnimationKey, setLandingAnimationKey] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '' })
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [authMessage, setAuthMessage] = useState({ type: '', text: '' })
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('token') && localStorage.getItem('user')))
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [activeGroupSection, setActiveGroupSection] = useState('created')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [groupImage, setGroupImage] = useState(null)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [profileImage, setProfileImage] = useState(null)
  const [groups, setGroups] = useState([])
  const [leftGroupIds, setLeftGroupIds] = useState(() => new Set())
  const [discoverableGroups, setDiscoverableGroups] = useState([])
  const [availableMembers, setAvailableMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [loans, setLoans] = useState([])
  const [notifications, setNotifications] = useState([])
  const [borrowRequestResults, setBorrowRequestResults] = useState({})
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [invitations, setInvitations] = useState([])
  const [ownerRequests, setOwnerRequests] = useState([])
  const [dataError, setDataError] = useState('')
  const [loanActionId, setLoanActionId] = useState('')
  const [currentTime] = useState(() => Date.now())

  const categories = [
    { id: 'books', name: 'Books', icon: '📚' },
    { id: 'electronics', name: 'Electronics', icon: '💻' },
    { id: 'sports', name: 'Sports Equipment', icon: '⚽' },
    { id: 'lab', name: 'Lab Equipment', icon: '🔬' },
    { id: 'tools', name: 'Project Tools', icon: '🔧' },
    { id: 'study', name: 'Study Materials', icon: '📖' },
    { id: 'others', name: 'Others', icon: '📦' },
  ]

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB')
        return
      }

      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        alert('Only PNG and JPG files are allowed')
        return
      }
      setGroupImage(file)
    }
  }

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleMember = (memberId) => {
    setAvailableMembers(prev =>
      prev.map(member =>
        member.id === memberId ? { ...member, selected: !member.selected } : member
      )
    )
  }

  async function fetchGroups() {
    try {
      const token = localStorage.getItem('token')
      const data = await apiRequest('/groups', {}, token)
      setGroups((data.data || []).filter(group => !leftGroupIds.has(String(group._id))))
    } catch (error) {
      console.error('Error fetching groups:', error)
      setGroups([])
    }
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert('Please enter a group name')
      return
    }

    const selectedMemberData = availableMembers.filter(member => member.selected)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('name', groupName.trim())
      formData.append('description', groupDescription.trim())
      formData.append('categories', JSON.stringify(selectedCategories))
      if (groupImage) formData.append('image', groupImage)

      const groupData = await apiRequest('/groups', { method: 'POST', body: formData }, token)

      for (const member of selectedMemberData) {
        await apiRequest('/invitations', {
          method: 'POST',
          body: JSON.stringify({
            groupId: groupData.data._id,
            inviteeId: member.id,
          }),
        }, token)
      }

      setGroupName('')
      setGroupDescription('')
      setGroupImage(null)
      setSelectedCategories([])
      setAvailableMembers(prev => prev.map(member => ({ ...member, selected: false })))
      setMemberSearchQuery('')
      setCurrentPage('my-groups')
    } catch (error) {
      console.error('Error creating group:', error)
      alert(error.message || 'Failed to create group')
    }
  }

  useEffect(() => {
    if (currentPage !== 'create-group' || !isAuthenticated) return

    const fetchUsers = async () => {
      setMembersLoading(true)

      try {
        const token = localStorage.getItem('token')
        const data = await apiRequest('/auth/users', {}, token)

        setAvailableMembers(
          data.data.map(member => ({
            id: member._id,
            name: member.name,
            email: member.email,
            selected: false,
          }))
        )
      } catch (error) {
        console.error('Error fetching users:', error)
        alert(error.message || 'Failed to load users')
      } finally {
        setMembersLoading(false)
      }
    }

    fetchUsers()
  }, [currentPage, isAuthenticated])

  // Fetch groups when on my-groups page
  useEffect(() => {
    if (currentPage === 'my-groups' && isAuthenticated) {
      // Loading the remote group list synchronizes this screen with the API.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchGroups()
      apiRequest('/groups/discover')
        .then(data => setDiscoverableGroups(data.data || []))
        .catch(error => setDataError(error.message || 'Could not load discoverable groups'))
    }
  }, [currentPage, isAuthenticated])

  const handleViewGroup = (groupId) => {
    setSelectedGroupId(groupId)
    setCurrentPage('view-group')
  }

  const handleDeleteGroup = async groupId => {
    await apiRequest(`/groups/${groupId}`, { method: 'DELETE' })
    await fetchGroups()
    setSelectedGroupId(null)
    setCurrentPage('my-groups')
  }

  const handleLeaveGroup = groupId => {
    setLeftGroupIds(current => new Set([...current, String(groupId)]))
    setGroups(current => current.filter(group => String(group._id) !== String(groupId)))
    setSelectedGroupId(null)
    setCurrentPage('my-groups')
  }

  const loadPageData = async (page) => {
    if (!isAuthenticated) return
    setDataError('')
    try {
      if (page === 'dashboard' || page === 'loans' || page === 'history') {
        const data = await apiRequest('/loans')
        setLoans(data.data || [])
      } else if (page === 'invitations') {
        const [data, requests] = await Promise.all([
          apiRequest('/invitations/me'),
          apiRequest('/invitations/owner-requests'),
        ])
        setInvitations(data.data || [])
        setOwnerRequests(requests.data || [])
      } else if (page === 'notifications') {
        setNotificationsLoading(true)
        const data = await apiRequest('/notifications')
        const nextNotifications = data.data || []
        setNotifications(nextNotifications)
        const unreadNotifications = nextNotifications.filter(notification => !notification.read)
        setUnreadCount(unreadNotifications.length)
        if (unreadNotifications.length) {
          try {
            await apiRequest('/notifications/read-all', { method: 'PATCH' })
            setNotifications(current => current.map(notification => ({ ...notification, read: true })))
            setUnreadCount(0)
          } catch (readError) {
            console.error('Could not mark notifications as read:', readError)
          }
        }
      }
    } catch (error) {
      console.error(`Error loading ${page}:`, error)
      setDataError(error.message || 'Could not load data')
    } finally {
      if (page === 'notifications') setNotificationsLoading(false)
    }
  }

  useEffect(() => {
    const pageToLoad = currentPage === 'inventory' ? 'invitations' : currentPage
    const timer = window.setTimeout(() => loadPageData(pageToLoad), 0)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, isAuthenticated])

  const unresolvedLoans = loans.filter(loan => ['requested', 'booked', 'active'].includes(loan.status))
  const overdueLoans = unresolvedLoans.filter(loan => loan.dueDate && new Date(loan.dueDate).getTime() < currentTime)
  const recentLoans = [...loans]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 5)
  const relativeActivityTime = value => {
    const elapsedDays = Math.max(0, Math.floor((currentTime - new Date(value).getTime()) / 86400000))
    return elapsedDays === 0 ? 'Today' : elapsedDays === 1 ? 'Yesterday' : `${elapsedDays} days ago`
  }
  const activityLabel = loan => {
    const itemName = loan.itemId?.name || 'Item'
    const person = loan.borrowerId?._id === user?._id ? loan.lenderId?.name : loan.borrowerId?.name
    const name = person || 'A member'
    if (loan.status === 'returned') return `${itemName} returned by ${name}`
    if (loan.status === 'rejected') return `${itemName} borrow request rejected`
    if (loan.status === 'requested') return `${itemName} borrow requested by ${name}`
    return `${itemName} borrowed by ${name}`
  }

  const handleLoanAction = async (loanId, action) => {
    if (loanActionId) return
    setLoanActionId(loanId)
    try {
      await apiRequest(`/loans/${loanId}/${action}`, { method: 'PATCH' })
      await loadPageData(currentPage)
    } catch (error) {
      setDataError(error.message || 'Could not update loan')
    } finally {
      setLoanActionId('')
    }
  }

  const handleInvitation = async (invitationId, action) => {
    try {
      await apiRequest(`/invitations/${invitationId}/${action}`, { method: 'PATCH' })
      await loadPageData('invitations')
      if (action === 'accept') {
        const invitation = invitations.find(item => String(item._id) === String(invitationId))
        const acceptedGroupId = invitation?.groupId?._id || invitation?.groupId
        if (acceptedGroupId) {
          setLeftGroupIds(current => {
            const next = new Set(current)
            next.delete(String(acceptedGroupId))
            return next
          })
        }
        await Promise.all([
          fetchGroups(),
          apiRequest('/groups/discover')
            .then(data => setDiscoverableGroups(data.data || []))
            .catch(error => setDataError(error.message || 'Could not refresh discoverable groups')),
        ])
      }
      return true
    } catch (error) {
      setDataError(error.message || 'Could not update invitation')
      return false
    }

  }

  const handleJoinRequest = async groupId => {
    try {
      await apiRequest('/invitations/requests', {
        method: 'POST',
        body: JSON.stringify({ groupId }),
      })
      setDiscoverableGroups(current => current.filter(group => group._id !== groupId))
      setDataError('')
    } catch (error) {
      setDataError(error.message || 'Could not send membership request')
    }
  }

  const handleMembershipRequest = async (requestId, action) => {
    try {
      await apiRequest(`/invitations/${requestId}/${action === 'approve' ? 'approve' : 'reject-request'}`, {
        method: 'PATCH',
      })
      await loadPageData('invitations')
    } catch (error) {
      setDataError(error.message || 'Could not update membership request')
    }
  }

  const handleBorrowRequest = async (notification, action) => {
    const loanId = notification.data?.loanId?._id || notification.data?.loanId
    if (!loanId || loanActionId) return
    setLoanActionId(String(loanId))
    try {
      await apiRequest(`/loans/${loanId}/${action}`, { method: 'PATCH' })
      setBorrowRequestResults(current => ({
        ...current,
        [notification._id]: action === 'approve' ? 'Accepted the request' : 'Rejected the request',
      }))
      await apiRequest(`/notifications/${notification._id}/read`, { method: 'PATCH' })
      await Promise.all([loadPageData('notifications'), loadPageData('inventory')])
    } catch (error) {
      setDataError(error.message || 'Could not update borrow request')
    } finally {
      setLoanActionId('')
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    try {
      const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(signupData),
      })
      console.log('Signup response:', data)
      if (data.data) {
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data))
        setAuthMessage({ type: 'success', text: 'Registration successful! Redirecting...' })
        setIsAuthenticated(true)
        setUser(data.data)
        setShowSignup(false)
        setShowLoginPage(false)
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        setAuthMessage({ type: 'error', text: data.message || 'Registration failed' })
      }
    } catch (error) {
      console.error('Signup error:', error)
      setAuthMessage({ type: 'error', text: `Server error: ${error.message}` })
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
      })
      console.log('Login response:', data)
      if (data.data) {
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data))
        setAuthMessage({ type: 'success', text: 'Login successful! Redirecting...' })
        setIsAuthenticated(true)
        setUser(data.data)
        setShowLogin(false)
        setShowLoginPage(false)
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        setAuthMessage({ type: 'error', text: data.message || 'Login failed' })
      }
    } catch (error) {
      console.error('Login error:', error)
      setAuthMessage({ type: 'error', text: `Server error: ${error.message}` })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
    window.location.reload()
  }

  const returnToLanding = () => {
    setShowLoginPage(false)
    setLoginPageMode('login')
    setMobileMenuOpen(false)
    setLandingAnimationKey(key => key + 1)
  }

  return (
    <div className="landing-page">
      {isAuthenticated ? (
        <BorrowBuddyProvider user={user}>
        <div className="dashboard">
          <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-logo">
              <div className="sidebar-logo-icon">
                <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <path d="M12 8.5 25.2 2.7a4.8 4.8 0 0 1 4.2.2l9.2 5.2v23.8c0 1.8-1 3.4-2.6 4.2l-11.9 6.2a4.8 4.8 0 0 1-4.5-.1l-9.3-5.4a4.7 4.7 0 0 1-2.3-4.1V12.8c0-1.8 1-3.5 3-4.3Z" fill="currentColor" />
                  <path d="M30 4.2a8.5 8.5 0 0 0-9.2 8.3c0 4.6 3.7 8.3 8.3 8.3 4.7 0 8.4-3.8 8.4-8.4 0-3.8-2.5-7-6-8.2l-5.1 8.7" fill="#4e9b32" />
                </svg>
              </div>
              <span className="sidebar-logo-text">BorrowBuddy</span>
              <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {sidebarCollapsed ? (
                    <polyline points="9 18 15 12 9 6" />
                  ) : (
                    <polyline points="15 18 9 12 15 6" />
                  )}
                </svg>
              </button>
            </div>

            <nav className="sidebar-nav">
              <a href="#" className={`sidebar-link ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentPage('dashboard') }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                Dashboard
              </a>
              <a href="#" className={`sidebar-link ${currentPage === 'my-groups' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentPage('my-groups') }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                My Groups
              </a>
              <a href="#" className={`sidebar-link ${currentPage === 'inventory' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentPage('inventory') }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
                Inventory
              </a>
              <a href="#" className={`sidebar-link ${currentPage === 'invitations' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentPage('invitations') }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16v16H4z" />
                  <path d="M4 7l8 5 8-5" />
                </svg>
                Invitations
              </a>
              <button type="button" className={`sidebar-link sidebar-action ${currentPage === 'notifications' ? 'active' : ''}`} onClick={() => setCurrentPage('notifications')} aria-label="Notifications">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>
                <span className="sidebar-action-label">Notifications</span>
                {unreadCount > 0 && <span className="sidebar-action-badge">{unreadCount}</span>}
              </button>
            </nav>

            <div className="dashboard-account">
              <button className="dashboard-account-trigger" onClick={() => setProfileMenuOpen(!profileMenuOpen)} aria-expanded={profileMenuOpen} aria-label="Open account menu">
                <span className="dashboard-account-avatar">{user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</span>
                <span className="dashboard-account-name">{user?.name}</span>
                <svg className="dashboard-account-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              {profileMenuOpen && (
                <div className="dashboard-account-menu">
                  <button onClick={() => { setCurrentPage('profile'); setProfileMenuOpen(false) }}>Profile</button>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </aside>

          <main className="dashboard-main">
            {currentPage === 'dashboard' && (
              <>
                <header className="dashboard-header">
                  <div className="header-content">
                    <h1 className="dashboard-greeting">Good Morning, {user?.name?.split(' ')[0]}!</h1>
                    <p className="dashboard-subtitle">Here's what's happening with your shared items.</p>
                  </div>
                </header>

                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon stat-icon-blue">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
                        <path d="m12 12 8-4.5M12 12 4 7.5M12 12v9" />
                      </svg>
                    </div>
                    <div className="stat-content">
                      <div className="stat-value"><GroupItemCount groupName="Friends Group" /></div>
                      <div className="stat-label">Total Items</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon stat-icon-green">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 2 21 6 17 10" />
                        <path d="M3 11V9a3 3 0 0 1 3-3h15" />
                        <path d="m7 22-4-4 4-4" />
                        <path d="M21 13v2a3 3 0 0 1-3 3H3" />
                      </svg>
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{unresolvedLoans.length}</div>
                      <div className="stat-label">Active Loans</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon stat-icon-red">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="16" height="17" rx="2" />
                        <path d="M8 2v4M14 2v4M3 9h16" />
                        <circle cx="18" cy="17" r="4" />
                        <path d="M18 15v2l1.2.8" />
                      </svg>
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{overdueLoans.length}</div>
                      <div className="stat-label">Overdue</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon stat-icon-blue">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="8" r="3.5" />
                        <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
                        <path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M18 14a5.5 5.5 0 0 1 3.5 5.2" />
                      </svg>
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{groups.length}</div>
                      <div className="stat-label">Groups</div>
                    </div>
                  </div>
                </div>

                <div className="recent-activity">
                  <div className="activity-header">
                    <h2 className="activity-title">Recent Activity</h2>
                    <a href="#" className="view-all" onClick={event => { event.preventDefault(); setCurrentPage('loans') }}>View All</a>
                  </div>

                  <div className="activity-list">
                    {recentLoans.length ? recentLoans.map(loan => {
                      const dueText = loan.dueDate && unresolvedLoans.includes(loan)
                        ? new Date(loan.dueDate).getTime() < currentTime
                          ? 'Overdue'
                          : `Due ${new Date(loan.dueDate).toLocaleDateString()}`
                        : loan.returnDate
                          ? `Returned ${new Date(loan.returnDate).toLocaleDateString()}`
                          : new Date(loan.updatedAt || loan.createdAt).toLocaleDateString()
                      return <div className="activity-item" key={loan._id}>
                        <div className="activity-info">
                          <div className="activity-name">{activityLabel(loan)}</div>
                          <div className="activity-date">{dueText}</div>
                        </div>
                        <div className="activity-time">{relativeActivityTime(loan.updatedAt || loan.createdAt)}</div>
                      </div>
                    }) : <div className="activity-item activity-empty-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" />
                        <path d="m3.5 7.5 8.5 5 8.5-5M12 12.5V22" />
                      </svg>
                      <div className="activity-info"><div className="activity-name">No recent activity</div><div className="activity-date">Borrowing activity will appear here.</div></div>
                    </div>}
                  </div>
                </div>
              </>
            )}

            {currentPage === 'my-groups' && (
              <div className="my-groups-page">
                <header className="dashboard-header my-groups-header">
                  <div className="header-content">
                    <div className="my-groups-heading-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div className="my-groups-heading-copy">
                      <h1 className="dashboard-greeting">My Groups</h1>
                    <p className="dashboard-subtitle">Join and manage your groups to share, borrow, and make better use of resources together</p>
                    </div>
                  </div>
                  <div className="groups-stats">
                    <div className="group-stat-card group-stat-blue">
                      <div className="group-stat-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                      </div>
                      <div className="group-stat-content"><div className="group-stat-value">{groups.length}</div><div className="group-stat-label">Total Groups</div></div>
                    </div>
                    <div className="group-stat-card group-stat-green">
                      <div className="group-stat-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6m3-3h-6" /></svg>
                      </div>
                      <div className="group-stat-content"><div className="group-stat-value">{groups.reduce((acc, group) => acc + (group.memberIds?.length || 0), 0)}</div><div className="group-stat-label">Total Members</div></div>
                    </div>
                    <div className="group-stat-card group-stat-orange">
                      <div className="group-stat-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4 4-4-4 4-4" /></svg>
                      </div>
                      <div className="group-stat-content"><div className="group-stat-value">0</div><div className="group-stat-label">Active Loans</div></div>
                    </div>
                  </div>
                  <button className="create-group-btn" onClick={() => setCurrentPage('create-group')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Create Group
                  </button>
                </header>

                <div className="groups-content">
                  <div className="groups-main">
                    <div className="groups-search-bar">
                      <div className="search-input-wrapper">
                        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input type="text" placeholder="Search groups..." className="search-input" />
                      </div>
                      <select className="category-select">
                        <option>All Categories</option>
                        <option>Books</option>
                        <option>Electronics</option>
                        <option>Sports</option>
                        <option>Tools</option>
                      </select>
                    </div>

                    <div className="groups-tabs" aria-label="Group sections">
                      <button type="button" className={`groups-tab ${activeGroupSection === 'created' ? 'active' : ''}`} onClick={() => setActiveGroupSection('created')} aria-pressed={activeGroupSection === 'created'}><span className="groups-tab-dot" />Groups Created</button>
                      <button type="button" className={`groups-tab ${activeGroupSection === 'discover' ? 'active' : ''}`} onClick={() => setActiveGroupSection('discover')} aria-pressed={activeGroupSection === 'discover'}><span className="groups-tab-dot" />Discover Groups</button>
                      <div className="groups-tab"><span className="groups-tab-dot" />Recent Activity</div>
                    </div>

                    {activeGroupSection === 'created' && <div className="groups-list">
                      {groups.length === 0 ? (
                        <div className="no-groups-message">
                          <p>No groups yet. Create your first group to get started!</p>
                        </div>
                      ) : (
                        groups.map((group) => (
                          <div key={group._id} className="group-compact-card">
                            <div className="group-compact-left">
                              {group.image ? (
                                <img src={getAssetUrl(group.image)} alt={group.name} className="group-compact-image" />
                              ) : (
                                <div className="group-compact-icon">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="group-compact-center">
                              <h3 className="group-compact-name">{group.name}</h3>
                              <div className="group-compact-tags">
                                {group.categories && group.categories.map((cat, idx) => (
                                  <span key={idx} className="group-compact-tag">{cat}</span>
                                ))}
                              </div>
                              <p className="group-compact-desc">{group.description || 'No description'}</p>
                            </div>
                            <div className="group-compact-right">
                              <button className="group-compact-view-btn" onClick={() => handleViewGroup(group._id)}>
                                View Group
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="9 18 15 12 9 6" />
                                </svg>
                              </button>
                            </div>
                            <div className="group-compact-bottom">
                              <div className="group-compact-members">
                                {group.memberIds && group.memberIds.slice(0, 4).map((member, idx) => (
                                  <div key={idx} className={`member-avatar-compact ${['charcoal', 'slate', 'purple', 'light'][idx % 4]}`}>
                                    {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                                  </div>
                                ))}
                                {group.memberIds && group.memberIds.length > 4 && (
                                  <div className="member-avatar-more-compact">+{group.memberIds.length - 4}</div>
                                )}
                                <span className="member-count-compact">{group.memberIds?.length || 0} members</span>
                              </div>
                              <div className="group-compact-stats">
                                <div className="stat-with-icon">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                  </svg>
                                  <span><GroupItemCount groupName={group.name} /> items</span>
                                </div>
                                <div className="stat-with-icon">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                                  </svg>
                                  <span><GroupItemCount groupName={group.name} type="loans" /> active loans</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>}

                    {activeGroupSection === 'discover' && <div className="groups-list discover-groups-list">
                      {discoverableGroups.length === 0 ? (
                        <div className="no-groups-message">
                          <p>No groups available to discover right now.</p>
                        </div>
                      ) : <>
                        <h2 className="activity-title">Discover Groups</h2>
                        {discoverableGroups.map(group => <div key={group._id} className="group-compact-card">
                          <div className="group-compact-center">
                            <h3 className="group-compact-name">{group.name}</h3>
                            <p className="group-compact-desc">{group.description || 'No description'}</p>
                            <span className="member-count-compact">{group.memberIds?.length || 0} members</span>
                          </div>
                          <div className="group-compact-right">
                            <button className="group-compact-view-btn" onClick={() => handleJoinRequest(group._id)}>Request to Join</button>
                          </div>
                        </div>)}
                      </>}
                    </div>}
                  </div>

                  <aside className="groups-sidebar">
                    <div className="sidebar-section">
                      <div className="sidebar-section-header">
                        <div className="sidebar-section-header-with-icon">
                          <svg className="recent-activity-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <h3 className="sidebar-section-title">Recent Activity</h3>
                        </div>
                        <a href="#" className="view-all-link">View All</a>
                      </div>
                      <div className="activity-feed">
                        <div className="feed-item">
                          <div className="feed-icon feed-icon-blue">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="8.5" cy="7" r="4" />
                              <line x1="20" y1="8" x2="20" y2="14" />
                              <line x1="23" y1="11" x2="17" y2="11" />
                            </svg>
                          </div>
                          <div className="feed-content">
                            <div className="feed-row-top">
                              <p className="feed-text">New member joined</p>
                              <span className="feed-time">2h ago</span>
                            </div>
                            <p className="feed-description">Rahul joined Friends Group</p>
                          </div>
                        </div>

                        <div className="feed-item">
                          <div className="feed-icon feed-icon-green">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            </svg>
                          </div>
                          <div className="feed-content">
                            <div className="feed-row-top">
                              <p className="feed-text">Item borrowed</p>
                              <span className="feed-time">5h ago</span>
                            </div>
                            <p className="feed-description">Book borrowed by Kiran</p>
                          </div>
                        </div>

                        <div className="feed-item">
                          <div className="feed-icon feed-icon-orange">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </div>
                          <div className="feed-content">
                            <div className="feed-row-top">
                              <p className="feed-text">Item returned</p>
                              <span className="feed-time">1d ago</span>
                            </div>
                            <p className="feed-description">Charger returned by Srikar</p>
                          </div>
                        </div>

                        <div className="feed-item">
                          <div className="feed-icon feed-icon-blue">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="8.5" cy="7" r="4" />
                              <line x1="20" y1="8" x2="20" y2="14" />
                              <line x1="23" y1="11" x2="17" y2="11" />
                            </svg>
                          </div>
                          <div className="feed-content">
                            <div className="feed-row-top">
                              <p className="feed-text">New member joined</p>
                              <span className="feed-time">2d ago</span>
                            </div>
                            <p className="feed-description">Priya joined College Group</p>
                          </div>
                        </div>

                        <div className="feed-item">
                          <div className="feed-icon feed-icon-orange">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </div>
                          <div className="feed-content">
                            <div className="feed-row-top">
                              <p className="feed-text">Group updated</p>
                              <span className="feed-time">3d ago</span>
                            </div>
                            <p className="feed-description">Group settings were updated</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="sidebar-section">
                      <div className="sidebar-section-header-with-icon">
                        <svg className="quick-actions-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                        <h3 className="sidebar-section-title">Quick Actions</h3>
                      </div>
                      <div className="quick-actions">
                        <div className="quick-action-card quick-action-create">
                          <div className="quick-action-icon-container">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          </div>
                          <div className="quick-action-content">
                            <h4 className="quick-action-title">Create New Group</h4>
                            <p className="quick-action-desc">Start a new group with your friends or colleagues</p>
                          </div>
                          <svg className="quick-action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </div>
                        <div className="quick-action-card quick-action-explore" role="button" tabIndex={0} onClick={() => setActiveGroupSection('discover')} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setActiveGroupSection('discover') } }}>
                          <div className="quick-action-icon-container quick-action-icon-blue">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                            </svg>
                          </div>
                          <div className="quick-action-content">
                            <h4 className="quick-action-title">Explore Groups</h4>
                            <p className="quick-action-desc">Find and join public groups</p>
                          </div>
                          <svg className="quick-action-arrow quick-action-arrow-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </div>
                        <div className="quick-action-card quick-action-invite">
                          <div className="quick-action-icon-container">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M19 8v6m3-3h-6" />
                            </svg>
                          </div>
                          <div className="quick-action-content">
                            <h4 className="quick-action-title">Invite Friends</h4>
                            <p className="quick-action-desc">Add friends to your groups</p>
                          </div>
                          <svg className="quick-action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            )}

            {currentPage === 'create-group' && (
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
            )}

            {currentPage === 'inventory' && <Inventory invitations={invitations.filter(invitation => invitation.direction !== 'outgoing')} onInvitation={handleInvitation} />}

            {(currentPage === 'loans' || currentPage === 'history') && (
              <>
                <header className="dashboard-header">
                  <div className="header-content">
                    <h1 className="dashboard-greeting">{currentPage === 'loans' ? 'Loans' : 'Loan History'}</h1>
                    <p className="dashboard-subtitle">Track requests, active loans, and returns.</p>
                  </div>
                </header>
                {dataError && <div className="auth-message error">{dataError}</div>}
                <div className="loans-table-wrapper">
                  <table className="loans-table">
                    <thead><tr><th>Item</th><th>Role</th><th>Other party</th><th>Status</th><th>Due</th><th>Action</th></tr></thead>
                    <tbody>
                      {loans.filter(loan => currentPage === 'history' ? ['returned', 'rejected', 'cancelled'].includes(loan.status) : !['returned', 'rejected', 'cancelled'].includes(loan.status)).map(loan => {
                        const borrower = loan.borrowerId?._id === user?._id
                        const otherParty = borrower ? loan.lenderId?.name : loan.borrowerId?.name
                        const action = loan.status === 'requested' && !borrower ? 'approve' : loan.status === 'booked' ? 'activate' : loan.status === 'active' ? 'return' : null
                        return <tr key={loan._id}><td>{loan.itemId?.name || 'Item'}</td><td>{borrower ? 'Borrower' : 'Owner'}</td><td>{otherParty || '—'}</td><td>{loan.status}</td><td>{loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : '—'}</td><td>{action && <button className="btn-borrow" disabled={loanActionId === loan._id} onClick={() => handleLoanAction(loan._id, action)}>{loanActionId === loan._id ? 'Updating…' : action}</button>}{loan.status === 'requested' && !borrower && <button className="btn-cancel" disabled={loanActionId === loan._id} onClick={() => handleLoanAction(loan._id, 'reject')}>Reject</button>}</td></tr>
                      })}
                    </tbody>
                  </table>
                  {loans.filter(loan => currentPage === 'history' ? ['returned', 'rejected', 'cancelled'].includes(loan.status) : !['returned', 'rejected', 'cancelled'].includes(loan.status)).length === 0 && <div className="no-groups-message"><p>No loans to show.</p></div>}
                </div>
              </>
            )}

            {currentPage === 'invitations' && (
              <div className="invitations-page">
                <header className="dashboard-header invitations-header"><div className="header-content"><h1 className="dashboard-greeting">Invitations</h1><p className="dashboard-subtitle">Accept or decline invitations before joining a group.</p></div></header>
                {dataError && <div className="auth-message error">{dataError}</div>}
                <section className="invitation-section">
                  <h2 className="invitation-section-title"><span><GroupIcon name="people" /></span>Groups You’re Invited To</h2>
                  <div className="invitation-table-scroll"><table className="invitations-table"><thead><tr><th>Group</th><th>Invited by</th><th>Status</th><th>Action</th></tr></thead><tbody>
                    {invitations.length ? invitations.map(invitation => <tr key={invitation._id}>
                      <td><strong>{invitation.groupId?.name || 'Group'}</strong></td>
                      <td>{invitation.requestType === 'member_request' ? 'Your membership request' : invitation.inviterId?.name || 'Member'}</td>
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
                      <td>{request.requestedBy?.name || request.inviteeId?.name || 'Member'}</td>
                      <td><span className={`invitation-status ${request.status}`}>{request.status === 'accepted' && <GroupIcon name="check" />}{request.status}</span></td>
                      <td>{request.status === 'pending' ? <span className="invitation-row-actions"><button className="invitation-accept-button" onClick={() => handleMembershipRequest(request._id, 'approve')}>Approve</button><button className="invitation-decline-button" onClick={() => handleMembershipRequest(request._id, 'reject')}>Reject</button></span> : <span className="invitation-no-action">—</span>}</td>
                    </tr>) : <tr><td colSpan="4"><div className="invitation-empty-state"><GroupIcon name="mail" /><strong>No pending membership requests.</strong><span>You’ll see group join requests here when someone asks to join.</span></div></td></tr>}
                  </tbody></table></div>
                </section>
              </div>
            )}

            {currentPage === 'notifications' && (
              <>
                <header className="dashboard-header notifications-header"><div className="header-content"><h1 className="dashboard-greeting">Notifications</h1><p className="dashboard-subtitle">Stay updated on invitations, borrow requests, and returns.</p></div></header>
                {dataError && <div className="auth-message error">{dataError}</div>}
                <div className="notification-list">
                  {notificationsLoading ? <div className="notification-empty">Loading notifications…</div> : notifications.length === 0 ? <div className="notification-empty"><strong>No notifications yet</strong><span>You're all caught up.</span></div> : notifications.map(notification => {
                    const loanStatus = notification.data?.loanStatus || notification.data?.loanId?.status
                    const resolution = notification.resolution || (loanStatus === 'rejected' ? 'rejected' : ['active', 'booked', 'returned'].includes(loanStatus) ? 'accepted' : '')
                    const requestResult = borrowRequestResults[notification._id] || (resolution === 'accepted' ? 'Accepted the request' : resolution === 'rejected' ? 'Rejected the request' : '')
                    return <article key={notification._id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
                    <div className="notification-icon" aria-hidden="true"><GroupIcon name={notification.type === 'item_returned' ? 'return' : notification.type?.includes('membership') || notification.type?.includes('invitation') ? 'people' : notification.type === 'general' ? 'bell' : 'box'} /></div>
                    <div className="notification-content">
                      <div className="notification-item-title">{notification.title}</div>
                      <div className="notification-item-msg">{notification.message}</div>
                      <div className="notification-item-time">{new Date(notification.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="notification-actions">
                      {requestResult && notification.type === 'borrow_request' && <span className={`notification-action-result${requestResult.startsWith('Rejected') ? ' rejected' : ''}`} role="status">{requestResult}</span>}
                      {!requestResult && notification.type === 'borrow_request' && notification.data?.loanId && (!loanStatus || loanStatus === 'requested') && (
                        <>
                          <button
                            type="button"
                            className="notification-action-reject"
                            disabled={loanActionId === String(notification.data.loanId?._id || notification.data.loanId)}
                            onClick={() => handleBorrowRequest(notification, 'reject')}
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            className="notification-action-approve"
                            disabled={loanActionId === String(notification.data.loanId?._id || notification.data.loanId)}
                            onClick={() => handleBorrowRequest(notification, 'approve')}
                          >
                            Accept
                          </button>
                        </>
                      )}
                    </div>
                    </article>
                  })}
                </div>
              </>
            )}

            {currentPage === 'profile' && (
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
            )}

            {currentPage === 'view-group' && (
              <ViewGroup
                groupId={selectedGroupId}
                group={groups.find(group => group._id === selectedGroupId)}
                onBack={() => setCurrentPage('my-groups')}
                onGroupLeft={handleLeaveGroup}
                onDeleteGroup={handleDeleteGroup}
              />
            )}

          </main>
        </div>
        </BorrowBuddyProvider>
      ) : (
        <div className="landing-page" key={landingAnimationKey}>
      <nav className="navbar">
        <div className={`nav-links${mobileMenuOpen ? ' mobile-open' : ''}`}>
          <a href="#hero" id="nav-home" onClick={() => setMobileMenuOpen(false)}>Home</a>
          <a href="#hero" id="nav-how-it-works" onClick={() => setMobileMenuOpen(false)}>How it works</a>
          <a href="#hero" id="nav-about" onClick={() => setMobileMenuOpen(false)}>About</a>
        </div>

        <a href="#hero" className="nav-mark" id="nav-logo" aria-label="BorrowBuddy home">
          <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path d="M12 8.5 25.2 2.7a4.8 4.8 0 0 1 4.2.2l9.2 5.2v23.8c0 1.8-1 3.4-2.6 4.2l-11.9 6.2a4.8 4.8 0 0 1-4.5-.1l-9.3-5.4a4.7 4.7 0 0 1-2.3-4.1V12.8c0-1.8 1-3.5 3-4.3Z" fill="currentColor" />
            <circle cx="38" cy="12" r="8.5" fill="#4e9b32" stroke="#f8f7f5" strokeWidth="3" />
          </svg>
        </a>

        <button className="nav-signup" id="nav-signup" onClick={() => { setLoginPageMode('login'); setShowLoginPage(true) }}>Get started</button>

        <button
          className="nav-hamburger"
          id="nav-hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </nav>

      <section className="hero-section" id="hero">
        <div className="hero-content">
          <h1 className="hero-heading">Share more. Borrow better.</h1>
          <p className="hero-description">
            Access what you need, share what you have, and build a more connected community.
          </p>
          <div className="hero-buttons">
            <button className="btn-get-started" id="btn-get-started" onClick={() => { setLoginPageMode('login'); setShowLoginPage(true) }}>
              Explore BorrowBuddy
            </button>
          </div>
        </div>

        <div className="hero-image-wrapper">
          <div className="hero-image-frame">
            <img
              src={heroImage}
              alt="A bright shared workspace with a desktop monitor, laptop, keyboard, and an ergonomic chair"
              className="hero-image"
            />
          </div>
        </div>
      </section>

      {showSignup && (
        <div className="signup-overlay" id="signup-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowSignup(false) }}>
          <div className="signup-modal" id="signup-modal">
            <button className="signup-close" id="signup-close" onClick={() => setShowSignup(false)} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="signup-left">
              <div className="signup-left-content">
                <div className="signup-brand">
                  <svg className="signup-brand-icon" viewBox="0 0 40 40" fill="none">
                    <circle cx="14" cy="14" r="8" stroke="white" strokeWidth="2.5" fill="none" />
                    <circle cx="26" cy="14" r="8" stroke="white" strokeWidth="2.5" fill="none" />
                  </svg>
                  <div>
                    <div className="signup-brand-name">BorrowBuddy</div>
                    <div className="signup-brand-sub">Borrow & Return Tracker</div>
                  </div>
                </div>
                <p className="signup-tagline">Share items. Build better habits.</p>
                <div className="signup-categories">
                  <div className="signup-cat-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                    </svg>
                    <span>Books</span>
                  </div>
                  <div className="signup-cat-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 2v4M17 2v4" />
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M12 10v4" />
                    </svg>
                    <span>Chargers</span>
                  </div>
                  <div className="signup-cat-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                    </svg>
                    <span>Tools</span>
                  </div>
                  <div className="signup-cat-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span>Sports</span>
                  </div>
                  <div className="signup-cat-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="6" cy="12" r="1" />
                      <circle cx="18" cy="12" r="1" />
                    </svg>
                    <span>And more...</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="signup-right">
              <h2 className="signup-title">Create Account</h2>
              <p className="signup-subtitle">Join BorrowBuddy today!</p>

              <form className="signup-form" id="signup-form" onSubmit={handleSignup}>
                {authMessage.text && (
                  <div className={`auth-message ${authMessage.type}`}>
                    {authMessage.text}
                  </div>
                )}
                <div className="signup-field">
                  <label className="signup-label" htmlFor="signup-name">Full Name</label>
                  <input
                    className="signup-input"
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  />
                </div>

                <div className="signup-field">
                  <label className="signup-label" htmlFor="signup-email">Email address</label>
                  <input
                    className="signup-input"
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  />
                </div>

                <div className="signup-field">
                  <label className="signup-label" htmlFor="signup-password">Password</label>
                  <div className="signup-password-wrapper">
                    <svg className="signup-password-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <input
                      className="signup-input signup-input-password"
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="signup-password-toggle"
                      id="signup-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button className="signup-register-btn" id="signup-register-btn" type="submit">Register</button>
              </form>

              <p className="signup-login-link">
                Already have an account? <a href="#login" id="signup-login" onClick={(e) => { e.preventDefault(); setShowSignup(false); setShowLogin(true); }}>Login</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {showLogin && (
        <div className="signup-overlay" id="login-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowLogin(false) }}>
          <div className="signup-modal" id="login-modal">
            <button className="signup-close" id="login-close" onClick={() => setShowLogin(false)} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="signup-left">
              <div className="signup-left-content">
                <div className="signup-brand">
                  <svg className="signup-brand-icon" viewBox="0 0 40 40" fill="none">
                    <circle cx="14" cy="14" r="8" stroke="white" strokeWidth="2.5" fill="none" />
                    <circle cx="26" cy="14" r="8" stroke="white" strokeWidth="2.5" fill="none" />
                  </svg>
                  <div>
                    <div className="signup-brand-name">BorrowBuddy</div>
                    <div className="signup-brand-sub">Borrow & Return Tracker</div>
                  </div>
                </div>
                <p className="signup-tagline">Share items. Build better habits.</p>
                <div className="signup-categories">
                  <div className="signup-cat-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                    </svg>
                    <span>Books</span>
                  </div>
                  <div className="signup-cat-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 2v4M17 2v4" />
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M12 10v4" />
                    </svg>
                    <span>Chargers</span>
                  </div>
                  <div className="signup-cat-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                    </svg>
                    <span>Tools</span>
                  </div>
                  <div className="signup-cat-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span>Sports</span>
                  </div>
                  <div className="signup-cat-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="6" cy="12" r="1" />
                      <circle cx="18" cy="12" r="1" />
                    </svg>
                    <span>And more...</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="signup-right">
              <h2 className="signup-title">Welcome Back</h2>
              <p className="signup-subtitle-blue">Log in to your account</p>

              <form className="signup-form" id="login-form" onSubmit={handleLogin}>
                {authMessage.text && (
                  <div className={`auth-message ${authMessage.type}`}>
                    {authMessage.text}
                  </div>
                )}
                <div className="signup-field">
                  <label className="signup-label" htmlFor="login-email">Email address</label>
                  <input
                    className="signup-input"
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  />
                </div>

                <div className="signup-field">
                  <label className="signup-label" htmlFor="login-password">Password</label>
                  <div className="signup-password-wrapper">
                    <svg className="signup-password-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <input
                      className="signup-input signup-input-password"
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="signup-password-toggle"
                      id="login-password-toggle"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showLoginPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="login-options">
                  <label className="login-remember" id="login-remember">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <a href="#forgot" className="login-forgot" id="login-forgot">Forgot password?</a>
                </div>

                <button className="signup-register-btn" id="login-submit-btn" type="submit">Login</button>
              </form>

              <p className="signup-login-link">
                Don't have an account? <a href="#signup" id="login-signup" onClick={(e) => { e.preventDefault(); setShowLogin(false); setShowSignup(true); }}>Sign up</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {showLoginPage && (
        <div className="login-page" id="login-page">
          <nav className="navbar login-page-navbar">
            <div className={`nav-links${mobileMenuOpen ? ' mobile-open' : ''}`}>
              <a href="#hero" onClick={returnToLanding}>Home</a>
              <a href="#hero" onClick={returnToLanding}>How it works</a>
              <a href="#hero" onClick={returnToLanding}>About</a>
            </div>

            <button className="nav-mark login-page-mark" onClick={returnToLanding} aria-label="Return to BorrowBuddy home">
              <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <path d="M12 8.5 25.2 2.7a4.8 4.8 0 0 1 4.2.2l9.2 5.2v23.8c0 1.8-1 3.4-2.6 4.2l-11.9 6.2a4.8 4.8 0 0 1-4.5-.1l-9.3-5.4a4.7 4.7 0 0 1-2.3-4.1V12.8c0-1.8 1-3.5 3-4.3Z" fill="currentColor" />
                <circle cx="38" cy="12" r="8.5" fill="#4e9b32" stroke="#f8f7f5" strokeWidth="3" />
              </svg>
            </button>

            <button className="nav-signup" onClick={() => { setLoginPageMode('login'); setAuthMessage({ type: '', text: '' }) }}>Get started</button>

            <button className="nav-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {mobileMenuOpen ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
              </svg>
            </button>
          </nav>

          <main className="login-page-layout">
            <section className="login-page-story">
              <div className="login-page-copy">
                <h1>Share more.<br />Borrow better.</h1>
                <p>Access what you need, share what you have, and build a more connected community.</p>
                <div className="login-page-create">
                  <span>{loginPageMode === 'login' ? 'Don’t have an account?' : 'Already have an account?'}</span>
                  <button onClick={() => { setLoginPageMode(loginPageMode === 'login' ? 'signup' : 'login'); setAuthMessage({ type: '', text: '' }) }}>
                    {loginPageMode === 'login' ? 'Create account' : 'Log in'} <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
              <div className="login-page-preview">
                <img src={heroImage} alt="A shared workspace with a monitor, laptop, and ergonomic chair" />
              </div>
            </section>

            <section className="login-page-visual" aria-label={loginPageMode === 'login' ? 'Log in to BorrowBuddy' : 'Create a BorrowBuddy account'}>
              <img className="login-page-background" src={heroImage} alt="" />
              <div className="login-page-card" key={loginPageMode}>
                <h2>{loginPageMode === 'login' ? 'Log in to your account' : 'Create your account'}</h2>
                {authMessage.text && <div className={`auth-message ${authMessage.type}`}>{authMessage.text}</div>}
                {loginPageMode === 'login' ? (
                  <form id="login-page-form" onSubmit={handleLogin}>
                  <label className="login-page-field">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
                    </svg>
                    <span className="sr-only">Email address</span>
                    <input type="email" placeholder="Enter your email" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} />
                  </label>

                  <label className="login-page-field">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
                    </svg>
                    <span className="sr-only">Password</span>
                    <input type={showLoginPassword ? 'text' : 'password'} placeholder="Enter your password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
                    <button type="button" className="login-page-password-toggle" onClick={() => setShowLoginPassword(!showLoginPassword)} aria-label="Toggle password visibility">
                      {showLoginPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.5 0 9 7 9 7a15 15 0 0 1-3 3.8M6.2 6.2C4.1 7.5 3 12 3 12s3.5 7 9 7a9.5 9.5 0 0 0 2.1-.2" /></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                      )}
                    </button>
                  </label>

                  <div className="login-page-options">
                    <label><input type="checkbox" /> <span>Remember me</span></label>
                    <a href="#forgot">Forgot your password?</a>
                  </div>

                  <button className="login-page-submit" type="submit">Log in</button>
                  </form>
                ) : (
                  <form id="signup-page-form" onSubmit={handleSignup}>
                    <label className="login-page-field">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
                      </svg>
                      <span className="sr-only">Full name</span>
                      <input type="text" placeholder="Enter your full name" value={signupData.name} onChange={(e) => setSignupData({ ...signupData, name: e.target.value })} />
                    </label>

                    <label className="login-page-field">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
                      </svg>
                      <span className="sr-only">Email address</span>
                      <input type="email" placeholder="Enter your email" value={signupData.email} onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} />
                    </label>

                    <label className="login-page-field">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
                      </svg>
                      <span className="sr-only">Password</span>
                      <input type={showPassword ? 'text' : 'password'} placeholder="Create a password" value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} />
                      <button type="button" className="login-page-password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
                        {showPassword ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.5 0 9 7 9 7a15 15 0 0 1-3 3.8M6.2 6.2C4.1 7.5 3 12 3 12s3.5 7 9 7a9.5 9.5 0 0 0 2.1-.2" /></svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                        )}
                      </button>
                    </label>

                    <button className="login-page-submit" type="submit">Create account</button>
                  </form>
                )}
              </div>
            </section>
          </main>
        </div>
      )}
    </div>
      )}
    </div>
  )
}

export default App
