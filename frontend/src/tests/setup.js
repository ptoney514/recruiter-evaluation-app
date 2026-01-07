import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock localStorage and sessionStorage for tests
const storageFactory = () => {
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
    key: (index) => {
      const keys = Object.keys(store)
      return keys[index] || null
    },
  }
}

const sessionStorageMock = storageFactory()
const localStorageMock = storageFactory()

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window.alert for tests
window.alert = () => {}

// Mock console.warn to avoid noise in tests (PDF.js warnings)
const originalWarn = console.warn
console.warn = (...args) => {
  if (args[0]?.includes?.('glyf') || args[0]?.includes?.('table is not found')) {
    return
  }
  originalWarn(...args)
}

// Mock imports
import { vi } from 'vitest'

// Mock useAuth hook (always authenticated in single-user mode)
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'local-user', email: 'local@localhost' },
    session: { user: { id: 'local-user' } },
    loading: false,
    error: null,
    signUp: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    initialize: vi.fn(),
    clearError: vi.fn(),
  })),
  useUser: vi.fn(() => ({ id: 'local-user', email: 'local@localhost' })),
  useIsAuthenticated: vi.fn(() => true),
}))
