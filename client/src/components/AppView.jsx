import { BorrowBuddyProvider } from '../context/BorrowBuddyContext'
import DashboardSidebar from './pages/DashboardSidebar'
import LandingContent from './pages/LandingContent'
import LoginPage from './pages/LoginPage'
import DashboardHome from './pages/DashboardHome'
import MyGroupsPage from './pages/MyGroupsPage'
import CreateGroupPage from './pages/CreateGroupPage'
import InventoryPage from './pages/InventoryPage'
import LoansPage from './pages/LoansPage'
import InvitationsPage from './pages/InvitationsPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import ViewGroupPage from './pages/ViewGroupPage'
import SignupModal from './pages/SignupModal'
import LoginModal from './pages/LoginModal'

export default function AppView({ app }) {
  const { isAuthenticated, user, landingAnimationKey } = app
  return (
    <div className="landing-page">
      {isAuthenticated ? (
        <BorrowBuddyProvider user={user}>
        <div className="dashboard">
          <DashboardSidebar app={app} />

          <main className="dashboard-main">
            <DashboardHome app={app} />

            <MyGroupsPage app={app} />

            <CreateGroupPage app={app} />

            <InventoryPage app={app} />

            <LoansPage app={app} />

            <InvitationsPage app={app} />

            <NotificationsPage app={app} />

            <ProfilePage app={app} />

            <ViewGroupPage app={app} />

          </main>
        </div>
        </BorrowBuddyProvider>
      ) : (
        <div className="landing-page" key={landingAnimationKey}>
      <LandingContent app={app} />

      <SignupModal app={app} />

      <LoginModal app={app} />

      <LoginPage app={app} />
    </div>
      )}
    </div>
  )
}
