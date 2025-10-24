import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

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
