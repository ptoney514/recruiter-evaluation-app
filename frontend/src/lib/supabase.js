/**
 * Supabase Client Stub
 *
 * This is a temporary stub file that provides mock exports for files
 * that still import from lib/supabase during the SQLite migration.
 *
 * TODO: Remove this file in Phase 4 when all Supabase dependencies are removed.
 */

// Mock supabase client - returns null for all operations
export const supabase = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signUp: async () => ({ data: null, error: { message: 'Supabase not configured - use authService' } }),
    signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured - use authService' } }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: { message: 'Supabase not configured - use databaseService' } }),
    update: () => ({ data: null, error: { message: 'Supabase not configured - use databaseService' } }),
    delete: () => ({ data: null, error: { message: 'Supabase not configured - use databaseService' } }),
  }),
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: { message: 'Supabase storage not configured' } }),
      download: async () => ({ data: null, error: { message: 'Supabase storage not configured' } }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
};

// Helper to check if Supabase is configured (always false during migration)
export function isSupabaseConfigured() {
  return false;
}

export default supabase;
