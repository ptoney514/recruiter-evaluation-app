import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './contexts/AuthContext'
import { HomePage } from './pages/HomePage'
import { JobInputPage } from './pages/JobInputPage'
import { ResumeUploadPage } from './pages/ResumeUploadPage'
import { ReviewPage } from './pages/ReviewPage'
import { ResultsPage } from './pages/ResultsPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { ErrorBoundary } from './components/ErrorBoundary'
import { UserMenu } from './components/auth/UserMenu'
import { AuthModal } from './components/auth/AuthModal'
import { useAuth } from './hooks/useAuth'

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const initialize = useAuth((state) => state.initialize)

  // Initialize auth state on mount
  useEffect(() => {
    initialize()
  }, [initialize])

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
            <nav className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 shadow-lg">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                  <Link to="/" className="flex items-center group">
                    <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:to-pink-700 transition-all duration-300">
                      Resume Scanner Pro
                    </span>
                  </Link>
                  <UserMenu onOpenAuth={openAuthModal} />
                </div>
              </div>
            </nav>

            {/* Routes */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
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
