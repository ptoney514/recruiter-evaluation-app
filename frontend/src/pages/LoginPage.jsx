/**
 * Login Page
 * Allows users to log in with email and password
 */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../hooks/useAuth'
import { validateLoginForm } from '../lib/validators'

// Dev bypass configuration
const DEV_AUTH_BYPASS = import.meta.env.VITE_AUTH_BYPASS === 'true'
const DEV_USER_EMAIL = import.meta.env.VITE_DEV_USER_EMAIL || 'dev-admin@localhost'
const DEV_USER_PASSWORD = 'devpassword123'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuth((state) => state.login)
  const error = useAuth((state) => state.error)
  const loading = useAuth((state) => state.loading)
  const clearError = useAuth((state) => state.clearError)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [localError, setLocalError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear errors when user starts typing
    setLocalError(null)
    clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)

    // Validate form
    const validation = validateLoginForm(formData)
    if (!validation.isValid) {
      setLocalError(validation.error)
      return
    }

    // Attempt login
    const { user, error } = await login(formData.email, formData.password)

    if (error) {
      setLocalError(error.message || 'Failed to log in. Please check your credentials.')
      return
    }

    if (user) {
      // Successful login - redirect to app
      navigate('/app')
    }
  }

  // Dev bypass quick login
  const handleDevLogin = async () => {
    setLocalError(null)
    const { user, error } = await login(DEV_USER_EMAIL, DEV_USER_PASSWORD)

    if (error) {
      setLocalError(error.message || 'Dev login failed. Make sure local Supabase is running with seed data.')
      return
    }

    if (user) {
      navigate('/app')
    }
  }

  const displayError = localError || error?.message

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-primary-600 rounded-full mb-4">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Log in to Resume Scanner Pro</p>
        </div>

        {displayError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{displayError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="you@example.com"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Home
          </Link>
        </div>

        {/* Dev bypass quick login - only shows when VITE_AUTH_BYPASS=true */}
        {DEV_AUTH_BYPASS && (
          <div className="mt-4 pt-4 border-t border-dashed border-yellow-300 bg-yellow-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
            <p className="text-xs text-yellow-700 mb-2 font-medium">🔧 Dev Mode Enabled</p>
            <Button
              type="button"
              onClick={handleDevLogin}
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-yellow-900"
            >
              {loading ? 'Logging in...' : '⚡ Quick Dev Login'}
            </Button>
            <p className="text-xs text-yellow-600 mt-2">
              Logs in as {DEV_USER_EMAIL}
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
