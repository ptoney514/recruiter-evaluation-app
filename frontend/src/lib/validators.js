/**
 * Shared validation utilities for auth forms
 * Used by LoginPage and SignupPage to avoid code duplication
 */

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates password meets minimum requirements
 * @param {string} password - Password to validate
 * @returns {boolean} - True if password is at least 8 characters
 */
export const isValidPassword = (password) => {
  return password && password.length >= 8
}

/**
 * Checks if two passwords match
 * @param {string} password - First password
 * @param {string} confirmPassword - Password to confirm
 * @returns {boolean} - True if passwords match
 */
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword
}

/**
 * Validates login form data
 * @param {Object} formData - Form data object with email and password
 * @returns {Object} - { isValid: boolean, error: string | null }
 */
export const validateLoginForm = (formData) => {
  if (!formData.email || !formData.password) {
    return { isValid: false, error: 'Please fill in all fields' }
  }

  if (!isValidEmail(formData.email)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }

  return { isValid: true, error: null }
}

/**
 * Validates signup form data
 * @param {Object} formData - Form data object with email, password, confirmPassword, and agreeToTerms
 * @returns {Object} - { isValid: boolean, error: string | null }
 */
export const validateSignupForm = (formData) => {
  if (!formData.email || !formData.password || !formData.confirmPassword) {
    return { isValid: false, error: 'Please fill in all fields' }
  }

  if (!isValidEmail(formData.email)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }

  if (!isValidPassword(formData.password)) {
    return { isValid: false, error: 'Password must be at least 8 characters long' }
  }

  if (!passwordsMatch(formData.password, formData.confirmPassword)) {
    return { isValid: false, error: 'Passwords do not match' }
  }

  if (!formData.agreeToTerms) {
    return { isValid: false, error: 'Please agree to the Terms of Service and Privacy Policy' }
  }

  return { isValid: true, error: null }
}
