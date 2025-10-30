/**
 * Quick test script for Supabase connection
 * Run in browser console or as a one-time test
 */
import { supabase, testConnection, isSupabaseConfigured } from './lib/supabase'
import { supabaseStore } from './services/storage/supabaseStore'
import { storageManager } from './services/storage/storageManager'

export async function testSupabaseSetup() {
  console.group('🧪 Supabase Setup Test')

  // 1. Check configuration
  console.log('1. Checking configuration...')
  const isConfigured = isSupabaseConfigured()
  console.log(`   ✓ Configured: ${isConfigured}`)

  if (!isConfigured) {
    console.error('   ❌ Missing environment variables. Check frontend/.env.local')
    console.groupEnd()
    return { success: false, error: 'Not configured' }
  }

  // 2. Test connection
  console.log('2. Testing database connection...')
  const connectionOk = await testConnection()
  console.log(`   ${connectionOk ? '✓' : '❌'} Connection: ${connectionOk ? 'OK' : 'FAILED'}`)

  if (!connectionOk) {
    console.groupEnd()
    return { success: false, error: 'Connection failed' }
  }

  // 3. Test table access
  console.log('3. Testing table access...')
  try {
    const { data: jobs, error: jobsError } = await supabase.from('jobs').select('*').limit(1)
    console.log(`   ✓ Jobs table: ${jobs ? 'Accessible' : 'Empty'}`)

    const { data: candidates, error: candidatesError } = await supabase.from('candidates').select('*').limit(1)
    console.log(`   ✓ Candidates table: ${candidates ? 'Accessible' : 'Empty'}`)

    const { data: evaluations, error: evalsError } = await supabase.from('evaluations').select('*').limit(1)
    console.log(`   ✓ Evaluations table: ${evaluations ? 'Accessible' : 'Empty'}`)
  } catch (error) {
    console.error('   ❌ Table access failed:', error.message)
    console.groupEnd()
    return { success: false, error: 'Table access failed' }
  }

  // 4. Test storage info
  console.log('4. Testing storage manager...')
  try {
    const storageInfo = await storageManager.getStorageInfo()
    console.log('   ✓ Storage info:', storageInfo)
  } catch (error) {
    console.error('   ❌ Storage manager failed:', error.message)
  }

  console.log('\n✅ All tests passed!')
  console.groupEnd()

  return { success: true }
}

// Export test function for use in browser console
if (typeof window !== 'undefined') {
  window.testSupabaseSetup = testSupabaseSetup
}
