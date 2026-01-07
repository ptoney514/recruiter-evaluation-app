import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { HomePage } from './pages/HomePage'
import { DashboardPage } from './pages/DashboardPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { CreateRolePage } from './pages/CreateRolePage'
import { WorkbenchPage } from './pages/WorkbenchPage'
import { JobInputPage } from './pages/JobInputPage'
import { ResumeUploadPage } from './pages/ResumeUploadPage'
import { ReviewPage } from './pages/ReviewPage'
import { ResultsPage } from './pages/ResultsPage'
import { SettingsPage } from './pages/SettingsPage'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AppLayout } from './components/layout/AppLayout'

// AppContent component to handle routing
function AppContent() {
  const location = useLocation()
  const isAppRoute = location.pathname.startsWith('/app')

  // Show legacy header only for legacy routes (non /app routes)
  const showLegacyHeader = !isAppRoute && location.pathname !== '/'

  return (
    <>
      {/* Legacy Navigation Header - Only show for legacy routes */}
      {showLegacyHeader && (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/app" className="flex items-center">
                <span className="text-xl font-bold text-primary-600">Eval</span>
              </Link>
            </div>
          </div>
        </nav>
      )}

      {/* Routes */}
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/app" replace />} />

        {/* Main App Routes - Use sidebar layout */}
        <Route path="/app" element={<AppLayout><DashboardPage /></AppLayout>} />
        <Route path="/app/project/:projectId" element={<AppLayout><ProjectDetailPage /></AppLayout>} />
        <Route path="/app/legacy" element={<AppLayout><HomePage /></AppLayout>} />
        <Route path="/app/create-role" element={<AppLayout><CreateRolePage /></AppLayout>} />
        <Route path="/app/role/:roleId/workbench" element={<AppLayout><WorkbenchPage /></AppLayout>} />
        <Route path="/app/role/:roleId/results" element={<AppLayout><ResultsPage /></AppLayout>} />
        <Route path="/app/settings" element={<AppLayout><SettingsPage /></AppLayout>} />

        {/* Legacy Routes - Keep for backwards compatibility */}
        <Route path="/job-input" element={<JobInputPage />} />
        <Route path="/upload-resumes" element={<ResumeUploadPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/results" element={<ResultsPage />} />

        {/* Catch-all redirect to dashboard */}
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <AppContent />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
