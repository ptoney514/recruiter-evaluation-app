/**
 * Auth Context
 * Provides authentication state and methods throughout the app
 * B2B signup-first model: All users must be authenticated to use the app
 *
 * Uses session-based authentication with Python backend
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check session on mount
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = useCallback(async () => {
    try {
      setLoading(true)
      const result = await authService.getSession()
      if (result.success && result.user) {
        setUser(result.user)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Session check failed:', err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(async (email, password, name = '') => {
    setError(null)
    try {
      const result = await authService.signUp(email, password, name)
      if (result.success) {
        setUser(result.user)
        return { success: true, user: result.user }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err.message || 'Signup failed'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    setError(null)
    try {
      const result = await authService.logIn(email, password)
      if (result.success) {
        setUser(result.user)
        return { success: true, user: result.user }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMsg = err.message || 'Login failed'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    try {
      await authService.logOut()
      setUser(null)
      return { success: true }
    } catch (err) {
      console.error('Logout error:', err)
      // Still clear local state even if API call fails
      setUser(null)
      return { success: true }
    }
  }, [])

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    checkSession,
    clearError: () => setError(null),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
