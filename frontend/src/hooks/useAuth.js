/**
 * Authentication Hook with Zustand
 * Manages user authentication state and provides auth methods
 *
 * DEV AUTH BYPASS:
 * Set VITE_AUTH_BYPASS=true in .env.local to skip authentication during development.
 * This automatically logs you in as a dev admin user without needing to sign in.
 *
 * IMPORTANT FOR WEEK 2+:
 * All data mutations (jobs, candidates, evaluations, etc.) MUST include user_id
 * from this auth state, or RLS policies will reject the operation.
 *
 * Example:
 *   const user = useAuth((state) => state.user)
 *   await supabase.from('jobs').insert({ ...jobData, user_id: user.id })
 */
import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// Dev bypass configuration from environment variables
const DEV_AUTH_BYPASS = import.meta.env.VITE_AUTH_BYPASS === 'true'
const DEV_USER_ID = import.meta.env.VITE_DEV_USER_ID || '00000000-0000-0000-0000-000000000001'
const DEV_USER_EMAIL = import.meta.env.VITE_DEV_USER_EMAIL || 'dev-admin@localhost'

// Mock dev user for bypass mode
const DEV_USER = {
  id: DEV_USER_ID,
  email: DEV_USER_EMAIL,
  role: 'authenticated',
  app_metadata: { provider: 'dev-bypass', role: 'admin' },
  user_metadata: { name: 'Dev Admin', is_dev: true },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
}

// Mock session for bypass mode
const DEV_SESSION = {
  access_token: 'dev-bypass-token',
  token_type: 'bearer',
  expires_in: 86400,
  expires_at: Math.floor(Date.now() / 1000) + 86400,
  refresh_token: 'dev-bypass-refresh',
  user: DEV_USER,
}

export const useAuth = create((set) => {
  let unsubscribe = null

  return {
    user: null,
    session: null,
    loading: true,
    error: null,
    isDevBypass: DEV_AUTH_BYPASS,

    // Initialize auth state and set up listener
    // NOTE: Should only be called once during app initialization (App.jsx useEffect)
    // Cleans up previous listener if re-initialized
    initialize: async () => {
      try {
        set({ loading: true })

        // DEV BYPASS MODE: Skip real auth, use mock dev user
        if (DEV_AUTH_BYPASS) {
          console.log('🔓 DEV AUTH BYPASS ENABLED - Auto-logged in as:', DEV_USER_EMAIL)
          console.log('   User ID:', DEV_USER_ID)
          console.log('   To disable: Remove VITE_AUTH_BYPASS from .env.local')
          set({
            user: DEV_USER,
            session: DEV_SESSION,
            loading: false,
            isDevBypass: true,
          })
          return
        }

        // Check if Supabase is configured
        if (!supabase) {
          console.warn('⚠️  Supabase not configured. Auth features disabled.')
          set({ loading: false, user: null, session: null })
          return
        }

        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
          set({ error, loading: false })
          return
        }

        set({
          session,
          user: session?.user ?? null,
          loading: false
        })

        // Clean up previous listener if it exists
        if (unsubscribe) {
          unsubscribe()
        }

        // Listen for auth state changes (login, logout, token refresh)
        unsubscribe = supabase.auth.onAuthStateChange((_event, session) => {
          set({
            session,
            user: session?.user ?? null
          })
        })
      } catch (error) {
        console.error('Error initializing auth:', error)
        set({ loading: false })
      }
    },

    // Sign up new user
    signUp: async (email, password) => {
      set({ loading: true, error: null })

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        set({ error, loading: false })
        return { user: null, error }
      }

      set({
        user: data.user,
        session: data.session,
        loading: false
      })

      return { user: data.user, error: null }
    },

    // Log in existing user
    login: async (email, password) => {
      set({ loading: true, error: null })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        set({ error, loading: false })
        return { user: null, error }
      }

      set({
        user: data.user,
        session: data.session,
        loading: false
      })

      return { user: data.user, error: null }
    },

    // Log out current user
    logout: async () => {
      // In dev bypass mode, just clear the mock user (no Supabase call needed)
      if (DEV_AUTH_BYPASS) {
        console.log('🔓 DEV MODE: Logout (mock) - Refreshing will restore dev user')
        set({ user: null, session: null, loading: false })
        return { error: null }
      }

      set({ loading: true, error: null })

      const { error } = await supabase.auth.signOut()

      if (error) {
        set({ error, loading: false })
        return { error }
      }

      set({
        user: null,
        session: null,
        loading: false
      })

      return { error: null }
    },

    // Get current user (useful for checking auth status)
    getCurrentUser: async () => {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) {
        console.error('Error getting current user:', error)
        set({ error })
        return null
      }

      set({ user })
      return user
    },

    // Clear error state
    clearError: () => {
      set({ error: null })
    },
  }
})

// Helper hook to get just the user
export const useUser = () => useAuth((state) => state.user)

// Helper hook to check if user is authenticated
export const useIsAuthenticated = () => useAuth((state) => !!state.user)

// Helper hook to check if dev bypass mode is active
export const useIsDevBypass = () => useAuth((state) => state.isDevBypass)
