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
  console.error('Missing Supabase environment variables. Please check frontend/.env.local')
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY')
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
})

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
