import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * ProtectedRoute Component
 * Requires authentication to access wrapped routes
 * Redirects to login page if user is not authenticated
 *
 * B2B signup-first model: All app routes require authentication
 */
export function ProtectedRoute({ children }) {
  const location = useLocation()
  const user = useAuth((state) => state.user)
  const loading = useAuth((state) => state.loading)

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // User is authenticated, render the protected content
  return children
}
