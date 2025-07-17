import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { blink } from './blink/client'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { DatabaseNotReady } from './components/DatabaseNotReady'
import { Dashboard } from './pages/Dashboard'
import { MigrationPlanning } from './pages/MigrationPlanning'
import { DataCenterMap } from './pages/DataCenterMap'
import { WorkloadAssessment } from './pages/WorkloadAssessment'
import { MigrationTimeline } from './pages/MigrationTimeline'
import { Analytics } from './pages/Analytics'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [databaseReady, setDatabaseReady] = useState<boolean | null>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      // Check database readiness when user is authenticated
      if (state.user && !state.isLoading) {
        checkDatabaseReadiness()
      }
    })
    return unsubscribe
  }, [])

  const checkDatabaseReadiness = async () => {
    try {
      // Try to query a simple workload to test database connectivity
      await blink.db.workloads.list({ limit: 1 })
      setDatabaseReady(true)
    } catch (error) {
      console.error('Database not ready:', error)
      setDatabaseReady(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Workload Migration Support Tool
          </h1>
          <p className="text-muted-foreground mb-6">
            Plan and manage your workload migrations with the 6 migration strategies framework
          </p>
          <button
            onClick={() => blink.auth.login()}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    )
  }

  // Show database setup screen if database is not ready
  if (databaseReady === false) {
    return <DatabaseNotReady onRetry={checkDatabaseReadiness} />
  }

  // Show loading while checking database readiness
  if (databaseReady === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking database status...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header user={user} />
            <main className="flex-1 p-6">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/planning" element={<MigrationPlanning />} />
                <Route path="/datacenter" element={<DataCenterMap />} />
                <Route path="/assessment" element={<WorkloadAssessment />} />
                <Route path="/timeline" element={<MigrationTimeline />} />
                <Route path="/analytics" element={<Analytics />} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App