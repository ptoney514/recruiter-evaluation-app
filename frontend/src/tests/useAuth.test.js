/**
 * Tests for useAuth hook
 * Tests authentication state management with Zustand
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// We need to import the actual hook, not the mocked one
vi.unmock('../hooks/useAuth')
const { useAuth } = await import('../hooks/useAuth')

describe('useAuth Hook', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { getState, setState } = useAuth
    act(() => {
      setState({
        user: null,
        session: null,
        loading: true,
        error: null,
      })
    })

    // Clear all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('clearError', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useAuth())

      // Set error using setState
      act(() => {
        useAuth.setState({ error: { message: 'Some error' } })
      })

      expect(result.current.error).not.toBeNull()

      // Clear error
      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('store state', () => {
    it('should have initial state', () => {
      const { result } = renderHook(() => useAuth())

      // Initial state after reset in beforeEach
      expect(result.current.user).toBeNull()
      expect(result.current.session).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('should update state via setState', () => {
      const { result } = renderHook(() => useAuth())

      const mockUser = { id: '123', email: 'test@example.com' }

      act(() => {
        useAuth.setState({ user: mockUser, loading: false })
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.loading).toBe(false)
    })
  })

  describe('hook methods exist', () => {
    it('should provide all required methods', () => {
      const { result } = renderHook(() => useAuth())

      expect(typeof result.current.signUp).toBe('function')
      expect(typeof result.current.login).toBe('function')
      expect(typeof result.current.logout).toBe('function')
      expect(typeof result.current.getCurrentUser).toBe('function')
      expect(typeof result.current.initialize).toBe('function')
      expect(typeof result.current.clearError).toBe('function')
    })
  })
})
