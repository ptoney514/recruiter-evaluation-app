import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// DEV MODE: Set to true to bypass authentication for testing
const BYPASS_AUTH = true

/**
 * ProtectedRoute Component
 * Requires authentication to access wrapped routes
 * Redirects to signup page if user is not authenticated
 *
 * B2B signup-first model: All app routes require authentication
 */
export function ProtectedRoute({ children }) {
  const location = useLocation()
  const { user, isLoading } = useAuth()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  // DEV MODE: Bypass auth check
  if (BYPASS_AUTH) {
    return children
  }

  useEffect(() => {
    // Wait for auth to initialize before redirecting
    if (!isLoading && !user) {
      setShouldRedirect(true)
    }
  }, [isLoading, user])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to signup if not authenticated
  if (shouldRedirect) {
    return <Navigate to="/signup" state={{ from: location }} replace />
  }

  // User is authenticated, render the protected content
  return children
}
