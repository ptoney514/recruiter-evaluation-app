/**
 * Jobs Hook with React Query
 * Manages job CRUD operations with Supabase and caching
 *
 * IMPORTANT: All mutations automatically inject user_id from auth state
 * to satisfy RLS policies (see useAuth.js for details)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

// Query keys for React Query cache management
export const jobKeys = {
  all: ['jobs'],
  lists: () => [...jobKeys.all, 'list'],
  list: (filters) => [...jobKeys.lists(), filters],
  details: () => [...jobKeys.all, 'detail'],
  detail: (id) => [...jobKeys.details(), id],
}

/**
 * Fetch all jobs for the current user
 * @param {Object} options - Query options (enabled, filters, etc.)
 * @returns {Object} React Query result with jobs data
 */
export function useJobs(options = {}) {
  const user = useAuth((state) => state.user)

  return useQuery({
    queryKey: jobKeys.lists(),
    queryFn: async () => {
      if (!user) {
        throw new Error('User must be authenticated to fetch jobs')
      }

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching jobs:', error)
        throw error
      }

      return data || []
    },
    enabled: !!user && (options.enabled !== false),
    ...options,
  })
}

/**
 * Fetch a single job by ID
 * @param {string} jobId - The job ID to fetch
 * @param {Object} options - Query options
 * @returns {Object} React Query result with job data
 */
export function useJob(jobId, options = {}) {
  const user = useAuth((state) => state.user)

  return useQuery({
    queryKey: jobKeys.detail(jobId),
    queryFn: async () => {
      if (!user) {
        throw new Error('User must be authenticated to fetch job')
      }

      if (!jobId) {
        throw new Error('Job ID is required')
      }

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error(`Error fetching job ${jobId}:`, error)
        throw error
      }

      return data
    },
    enabled: !!user && !!jobId && (options.enabled !== false),
    ...options,
  })
}

/**
 * Create a new job
 * Automatically injects user_id from auth state
 */
export function useCreateJob() {
  const queryClient = useQueryClient()
  const user = useAuth((state) => state.user)

  return useMutation({
    mutationFn: async (jobData) => {
      if (!user) {
        throw new Error('User must be authenticated to create jobs')
      }

      // Inject user_id to satisfy RLS policies
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          ...jobData,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating job:', error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      // Invalidate jobs list to trigger refetch
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
    },
  })
}

/**
 * Update an existing job
 * Ensures user_id match for security
 */
export function useUpdateJob() {
  const queryClient = useQueryClient()
  const user = useAuth((state) => state.user)

  return useMutation({
    mutationFn: async ({ jobId, updates }) => {
      if (!user) {
        throw new Error('User must be authenticated to update jobs')
      }

      if (!jobId) {
        throw new Error('Job ID is required for update')
      }

      // Update job (RLS will ensure user can only update their own jobs)
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error(`Error updating job ${jobId}:`, error)
        throw error
      }

      return data
    },
    onSuccess: (data) => {
      // Invalidate both the specific job and the jobs list
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
    },
  })
}

/**
 * Delete a job
 * CASCADE will automatically delete related candidates, evaluations, etc.
 */
export function useDeleteJob() {
  const queryClient = useQueryClient()
  const user = useAuth((state) => state.user)

  return useMutation({
    mutationFn: async (jobId) => {
      if (!user) {
        throw new Error('User must be authenticated to delete jobs')
      }

      if (!jobId) {
        throw new Error('Job ID is required for deletion')
      }

      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)
        .eq('user_id', user.id)

      if (error) {
        console.error(`Error deleting job ${jobId}:`, error)
        throw error
      }

      return jobId
    },
    onSuccess: (jobId) => {
      // Remove from cache and invalidate list
      queryClient.removeQueries({ queryKey: jobKeys.detail(jobId) })
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
    },
  })
}

/**
 * Clone a job (useful for templates)
 * Creates a new job with copied data minus the ID and timestamps
 */
export function useCloneJob() {
  const queryClient = useQueryClient()
  const user = useAuth((state) => state.user)

  return useMutation({
    mutationFn: async (jobId) => {
      if (!user) {
        throw new Error('User must be authenticated to clone jobs')
      }

      // Fetch the original job
      const { data: original, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        console.error(`Error fetching job to clone ${jobId}:`, fetchError)
        throw fetchError
      }

      // Create new job with copied data
      const { id, created_at, updated_at, ...cloneData } = original

      const { data: cloned, error: createError } = await supabase
        .from('jobs')
        .insert({
          ...cloneData,
          title: `${original.title} (Copy)`,
          user_id: user.id,
        })
        .select()
        .single()

      if (createError) {
        console.error('Error cloning job:', createError)
        throw createError
      }

      return cloned
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
    },
  })
}
