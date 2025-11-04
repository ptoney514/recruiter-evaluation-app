/**
 * Authentication Hook with Zustand
 * Manages user authentication state and provides auth methods
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

export const useAuth = create((set, get) => ({
  user: null,
  session: null,
  loading: true,
  error: null,

  // Initialize auth state and set up listener
  // NOTE: Should only be called once during app initialization (App.jsx useEffect)
  // The auth listener is not cleaned up since this is a singleton store
  initialize: async () => {
    try {
      set({ loading: true })

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

      // Listen for auth state changes (login, logout, token refresh)
      // This listener persists for the lifetime of the app
      supabase.auth.onAuthStateChange((_event, session) => {
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
}))

// Helper hook to get just the user
export const useUser = () => useAuth((state) => state.user)

// Helper hook to check if user is authenticated
export const useIsAuthenticated = () => useAuth((state) => !!state.user)
