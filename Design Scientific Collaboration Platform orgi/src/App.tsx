import React from 'react'
import { AppProvider, useAppContext } from './contexts/AppContext'
import Auth from './pages/Auth'
import ResearcherShell from './shells/ResearcherShell'
import InstitutionAdminShell from './shells/InstitutionAdminShell'
import ReviewerShell from './shells/ReviewerShell'
import SystemAdminShell from './shells/SystemAdminShell'
import Toast from './components/shared/Toast'

const AppContent: React.FC = () => {
  const { user, darkMode } = useAppContext()

  const renderShell = () => {
    if (!user) return <Auth />
    const role = user.role.toLowerCase()
    if (role === 'researcher') return <ResearcherShell />
    if (role === 'institution admin') return <InstitutionAdminShell />
    if (role === 'reviewer') return <ReviewerShell />
    if (role === 'system admin') return <SystemAdminShell />
    return <ResearcherShell />
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground">
        {renderShell()}
        <Toast />
      </div>
    </div>
  )
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
