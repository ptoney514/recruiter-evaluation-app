/**
 * Auth Service Unit Tests
 * Tests authentication functions with mocked fetch
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as authService from '../authService';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('authService', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      const mockUser = { id: '123', email: 'test@example.com', name: 'Test User' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser }),
      });

      const result = await authService.signUp('test@example.com', 'password123', 'Test User');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/signup'),
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ email: 'test@example.com', password: 'password123', name: 'Test User' }),
        })
      );
      expect(result).toEqual({ success: true, user: mockUser });
    });

    it('should return error for duplicate email', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'Email already registered' }),
      });

      const result = await authService.signUp('existing@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already registered');
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.signUp('test@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error. Please try again.');
    });
  });

  describe('logIn', () => {
    it('should successfully log in a user', async () => {
      const mockUser = { id: '123', email: 'test@example.com', name: 'Test User' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser }),
      });

      const result = await authService.logIn('test@example.com', 'password123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        })
      );
      expect(result).toEqual({ success: true, user: mockUser });
    });

    it('should return error for invalid credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'Invalid email or password' }),
      });

      const result = await authService.logIn('test@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

      const result = await authService.logIn('test@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error. Please try again.');
    });
  });

  describe('logOut', () => {
    it('should successfully log out', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await authService.logOut();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/logout'),
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.logOut();

      expect(result.success).toBe(false);
    });
  });

  describe('getSession', () => {
    it('should return user when session is valid', async () => {
      const mockUser = { id: '123', email: 'test@example.com', name: 'Test User' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser }),
      });

      const result = await authService.getSession();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/session'),
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should return null user when no session', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, user: null }),
      });

      const result = await authService.getSession();

      expect(result.success).toBe(false);
      expect(result.user).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.getSession();

      expect(result.success).toBe(false);
      expect(result.user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: { id: '123' } }),
      });

      const result = await authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when user is not authenticated', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, user: null }),
      });

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });
});
