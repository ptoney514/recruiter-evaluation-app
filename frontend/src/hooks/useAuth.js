/**
 * Authentication Hook (Simplified for Personal Use)
 *
 * Returns a constant authenticated state for single-user mode.
 * No actual authentication - the app is for personal/local use only.
 */
import { create } from 'zustand'

// Local user for single-user mode
const LOCAL_USER = {
  id: 'local-user',
  email: 'local@localhost',
  user_metadata: {
    full_name: 'Local User'
  }
}

export const useAuth = create(() => ({
  user: LOCAL_USER,
  session: { user: LOCAL_USER },
  loading: false,
  error: null,
  isDevBypass: false,

  // No-op initialize - always authenticated
  initialize: async () => {},

  // No-op methods for compatibility
  signUp: async () => ({ user: LOCAL_USER, error: null }),
  login: async () => ({ user: LOCAL_USER, error: null }),
  logout: async () => ({ error: null }),
  getCurrentUser: async () => LOCAL_USER,
  clearError: () => {},
}))

// Helper hook to get just the user
export const useUser = () => useAuth((state) => state.user)

// Helper hook to check if user is authenticated (always true)
export const useIsAuthenticated = () => true

// Helper hook to check if dev bypass mode is active
export const useIsDevBypass = () => false
