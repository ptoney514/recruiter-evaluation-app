/**
 * Vitest Setup for Integration Tests
 * Uses real local Supabase instance with shared client for auth session
 */

import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import { getSupabaseClient, setupTestDatabase, cleanupDatabase } from './testDbUtils'

// Mock BroadcastChannel to avoid errors in jsdom
// Supabase auth uses BroadcastChannel which isn't fully supported in jsdom
class MockBroadcastChannel {
  constructor() {
    this.onmessage = null
  }
  postMessage() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
}
global.BroadcastChannel = MockBroadcastChannel

// IMPORTANT: Mock lib/supabase to use the same client as testDbUtils
// This ensures hooks share the same auth session as test utilities
const sharedClient = getSupabaseClient()

vi.mock('../lib/supabase', () => ({
  supabase: sharedClient,
  isSupabaseConfigured: () => true,
  testConnection: () => Promise.resolve(true),
}))

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock sessionStorage for tests
const sessionStorageMock = (() => {
  let store = {}

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString()
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Mock localStorage for Supabase auth session persistence
const localStorageMock = (() => {
  let store = {}

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString()
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index) => Object.keys(store)[index] || null,
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window.alert for tests
window.alert = () => {}

// Mock console.warn to avoid noise in tests
const originalWarn = console.warn
console.warn = (...args) => {
  // Filter out expected warnings
  const msg = args[0]?.toString() || ''
  if (
    msg.includes('glyf') ||
    msg.includes('table is not found') ||
    msg.includes('Multiple GoTrueClient instances') ||
    msg.includes('BroadcastChannel')
  ) {
    return
  }
  originalWarn(...args)
}

// Initialize test database once before all integration tests
let dbInitialized = false

beforeAll(async () => {
  if (dbInitialized) return

  try {
    console.log('Setting up test database for integration tests...')
    await setupTestDatabase()
    console.log('Test database setup complete')
    dbInitialized = true
  } catch (error) {
    console.error('Failed to setup test database:', error)
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
