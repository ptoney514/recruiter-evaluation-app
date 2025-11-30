/**
 * Vitest Setup for Database
 * Initializes test database and test user before tests run
 */

import { beforeAll, afterAll } from 'vitest'
import { setupTestDatabase, cleanupDatabase, signInTestUser } from './testDbUtils'

// Set environment variables for Supabase if running locally
if (!process.env.VITE_SUPABASE_URL) {
  process.env.VITE_SUPABASE_URL = 'http://127.0.0.1:54321'
}

let dbInitialized = false

// Initialize test database once before all tests
beforeAll(async () => {
  if (dbInitialized) return

  try {
    console.log('Setting up test database...')
    await setupTestDatabase()
    console.log('Test database setup complete')
    dbInitialized = true
  } catch (error) {
    console.error('Failed to setup test database:', error)
    // Don't throw - tests should handle missing auth gracefully
  }
})

// Clean up all test data after all tests complete
afterAll(async () => {
  try {
    console.log('Cleaning up test database...')
    await cleanupDatabase()
    console.log('Test database cleanup complete')
  } catch (error) {
    console.error('Error during cleanup:', error)
  }
})
