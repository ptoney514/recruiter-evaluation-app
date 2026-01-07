/**
 * Settings Hooks
 * React Query hooks for managing user settings
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSettings, updateSettings, getAvailableModels } from '../services/settingsService'

/**
 * React Query hook to fetch user settings
 * Automatically refetches if stale (5 minutes)
 */
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const result = await getSettings()
      if (!result) {
        throw new Error('No settings returned from server')
      }
      return result
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * React Query mutation to update settings
 * Automatically invalidates settings cache after successful update
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settingsToUpdate) => {
      const result = await updateSettings(settingsToUpdate)
      if (!result.success) {
        throw new Error(result.error || 'Failed to update settings')
      }
      return result
    },
    onSuccess: () => {
      // Invalidate the settings cache to force refetch
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}

/**
 * React Query hook to fetch available LLM models
 * Cached for 10 minutes (models rarely change)
 */
export function useAvailableModels() {
  return useQuery({
    queryKey: ['models', 'available'],
    queryFn: async () => {
      const result = await getAvailableModels()
      if (!result) {
        throw new Error('No models returned from server')
      }
      return result
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}
