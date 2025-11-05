/**
 * Supabase Client
 * Initializes and exports the Supabase client for database operations
 */
import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.local')
  console.warn('Marketing page will work without Supabase. Auth features will be disabled.')
}

// Create and export Supabase client (with fallback for missing config)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      db: {
        schema: 'public'
      }
    })
  : null // Return null if not configured

/**
 * Helper to check if Supabase is configured
 * @returns {boolean} True if Supabase is properly configured
 */
export function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseAnonKey)
}

/**
 * Helper to check connection to Supabase
 * @returns {Promise<boolean>} True if connection is successful
 */
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('jobs').select('count', { count: 'exact', head: true })
    if (error) {
      console.error('Supabase connection test failed:', error)
      return false
    }
    console.log('Supabase connection successful')
    return true
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return false
  }
}
