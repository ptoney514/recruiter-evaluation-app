/**
 * Authentication Service
 * Handles user authentication with session-based auth
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Sign up a new user
 * @param {string} email
 * @param {string} password
 * @param {string} name
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function signUp(email, password, name = '') {
  try {
    const response = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

/**
 * Log in a user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function logIn(email, password) {
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

/**
 * Log out the current user
 * @returns {Promise<{success: boolean}>}
 */
export async function logOut() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false };
  }
}

/**
 * Get the current session/user
 * @returns {Promise<{success: boolean, user?: object}>}
 */
export async function getSession() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/session`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Session check error:', error);
    return { success: false, user: null };
  }
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  const session = await getSession();
  return session.success && session.user !== null;
}
