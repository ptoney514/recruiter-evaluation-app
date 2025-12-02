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
const DEV_USER_EMAIL = import.meta.env.VITE_DEV_USER_EMAIL || 'dev-admin@localhost'
const DEV_USER_PASSWORD = 'devpassword123' // Must match seed.sql

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

        // DEV BYPASS MODE: Auto-login with dev user (real Supabase auth for RLS to work)
        if (DEV_AUTH_BYPASS) {
          console.log('🔓 DEV AUTH BYPASS ENABLED - Signing in as:', DEV_USER_EMAIL)
          console.log('   To disable: Remove VITE_AUTH_BYPASS from .env.local')

          // Actually sign in to get a real JWT token (required for RLS policies)
          const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: DEV_USER_EMAIL,
            password: DEV_USER_PASSWORD,
          })

          if (signInError) {
            console.error('❌ DEV AUTH BYPASS FAILED:', signInError.message)
            console.log('   Make sure you ran: supabase db reset')
            console.log('   This creates the dev user from seed.sql')
            set({ error: signInError, loading: false })
            return
          }

          console.log('✅ DEV AUTH BYPASS: Signed in with user ID:', data.user?.id)
          set({
            user: data.user,
            session: data.session,
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
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          set({
            session,
            user: session?.user ?? null
          })
        })
        unsubscribe = () => subscription.unsubscribe()
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
