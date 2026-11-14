import { useState, useEffect } from 'react'
import heroImage from '../assets/borrowbuddy-hero-reference.png'
import { apiRequest } from '../services/apiClient'

export default function useBorrowBuddyApp() {

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
  const [discoverQuery] = useState('')
  const [, setDiscoverLoading] = useState(false)
  const [, setDiscoverError] = useState('')
  const [groupSearchQuery, setGroupSearchQuery] = useState('')
  const [availableMembers, setAvailableMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [loans, setLoans] = useState([])
  const [loansLoading, setLoansLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [borrowRequestResults, setBorrowRequestResults] = useState({})
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [invitations, setInvitations] = useState([])
  const [ownerRequests, setOwnerRequests] = useState([])
  const [dataError, setDataError] = useState('')
  const [, setDataLoading] = useState(false)
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

  async function fetchDiscoverableGroups(query = '') {
    if (!isAuthenticated) return
    setDiscoverLoading(true)
    setDiscoverError('')
    try {
      const data = await apiRequest(`/groups/discover?search=${encodeURIComponent(query.trim())}`)
      setDiscoverableGroups(data.data || [])
    } catch (error) {
      console.error('Error fetching discoverable groups:', error)
      setDiscoverError(error.message || 'Could not discover groups')
      setDiscoverableGroups([])
    } finally {
      setDiscoverLoading(false)
    }
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setAuthMessage({ type: 'error', text: 'Please enter a group name' })
      return
    }

    setDataLoading(true)
    setDataError('')
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('name', groupName.trim())
      formData.append('description', groupDescription.trim())
      formData.append('categories', JSON.stringify(selectedCategories))
      if (groupImage) formData.append('image', groupImage)

      const groupData = await apiRequest('/groups', { method: 'POST', body: formData }, token)

      const selectedMemberData = availableMembers.filter(member => member.selected)
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
      setAuthMessage({ type: 'success', text: 'Group created successfully!' })
      setCurrentPage('my-groups')
      await fetchGroups()
    } catch (error) {
      console.error('Error creating group:', error)
      setAuthMessage({ type: 'error', text: error.message || 'Failed to create group' })
    } finally {
      setDataLoading(false)
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

  // Fetch searchable discoverable groups when the discovery page is active.
  useEffect(() => {
    if (currentPage === 'discover-groups' && isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchDiscoverableGroups(discoverQuery)
    }
  }, [currentPage, isAuthenticated, discoverQuery])

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
    const loadingLoans = page === 'dashboard' || page === 'loans' || page === 'history'
    if (loadingLoans) setLoansLoading(true)
    try {
      if (loadingLoans) {
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
      if (loadingLoans) setLoansLoading(false)
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

  const pageProps = {
    activeGroupSection,
    activityLabel,
    authMessage,
    availableMembers,
    borrowRequestResults,
    categories,
    currentPage,
    currentTime,
    dataError,
    discoverableGroups,
    groupSearchQuery,
    groupDescription,
    groupImage,
    groupName,
    groups,
    handleBorrowRequest,
    handleCreateGroup,
    handleDeleteGroup,
    handleImageUpload,
    handleInvitation,
    handleJoinRequest,
    handleLeaveGroup,
    handleLoanAction,
    handleLogin,
    handleLogout,
    handleMembershipRequest,
    handleSignup,
    handleViewGroup,
    heroImage,
    invitations,
    loanActionId,
    loans,
    loansLoading,
    loginData,
    loginPageMode,
    memberSearchQuery,
    membersLoading,
    mobileMenuOpen,
    notifications,
    notificationsLoading,
    overdueLoans,
    ownerRequests,
    profileImage,
    profileMenuOpen,
    recentLoans,
    relativeActivityTime,
    returnToLanding,
    selectedCategories,
    selectedGroupId,
    setActiveGroupSection,
    setAuthMessage,
    setCurrentPage,
    setGroupDescription,
    setGroupImage,
    setGroupName,
    setGroupSearchQuery,
    setLoginData,
    setLoginPageMode,
    setMemberSearchQuery,
    setMobileMenuOpen,
    setProfileImage,
    setProfileMenuOpen,
    setShowLogin,
    setShowLoginPage,
    setShowLoginPassword,
    setShowPassword,
    setShowSignup,
    setSidebarCollapsed,
    setSignupData,
    showLogin,
    showLoginPage,
    showLoginPassword,
    showPassword,
    showSignup,
    sidebarCollapsed,
    signupData,
    toggleCategory,
    toggleMember,
    unreadCount,
    unresolvedLoans,
    user,
  }

  return { ...pageProps, isAuthenticated, user, landingAnimationKey }
}
