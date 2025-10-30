import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './contexts/AuthContext'
import { HomePage } from './pages/HomePage'
import { JobInputPage } from './pages/JobInputPage'
import { ResumeUploadPage } from './pages/ResumeUploadPage'
import { ReviewPage } from './pages/ReviewPage'
import { ResultsPage } from './pages/ResultsPage'
import { ErrorBoundary } from './components/ErrorBoundary'
import { UserMenu } from './components/auth/UserMenu'
import { AuthModal } from './components/auth/AuthModal'

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            {/* Navigation Header */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <Link to="/" className="flex items-center">
                    <span className="text-xl font-bold text-primary-600">Resume Scanner Pro</span>
                  </Link>
                  <UserMenu onOpenAuth={openAuthModal} />
                </div>
              </div>
            </nav>

            {/* Routes */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/job-input" element={<JobInputPage />} />
              <Route path="/upload-resumes" element={<ResumeUploadPage />} />
              <Route path="/review" element={<ReviewPage />} />
              <Route path="/results" element={<ResultsPage />} />
            </Routes>

            {/* Auth Modal */}
            <AuthModal
              isOpen={authModalOpen}
              onClose={() => setAuthModalOpen(false)}
              defaultMode={authMode}
            />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
