/**
 * Settings Service
 * Handles API calls for user settings management
 */
import { API_BASE_URL } from '../constants/config'

/**
 * Fetch user settings from the server
 */
export async function getSettings() {
  const response = await fetch(`${API_BASE_URL}/api/settings`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch settings')
  }

  const data = await response.json()
  return data.settings || {}
}

/**
 * Update user settings (batch update)
 * @param {Object} settings - Dictionary of settings to update
 */
export async function updateSettings(settings) {
  const response = await fetch(`${API_BASE_URL}/api/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update settings')
  }

  const data = await response.json()
  return data
}

/**
 * Get available LLM models from the server
 */
export async function getAvailableModels() {
  const response = await fetch(`${API_BASE_URL}/api/models`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch models')
  }

  const data = await response.json()
  return data.providers || {}
}
