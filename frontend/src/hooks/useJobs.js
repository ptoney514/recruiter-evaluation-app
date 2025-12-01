import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

/**
 * Helper to get the current user ID from Supabase auth
 * Works with both normal auth and dev bypass mode (which now uses real auth)
 */
async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

/**
 * React Query hook to fetch all jobs for the current user
 * Sorted by created_at descending (newest first)
 *
 * @returns {Object} React Query result with jobs data, loading state, and error
 */
export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const userId = await getCurrentUserId()

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          department,
          location,
          employment_type,
          compensation_min,
          compensation_max,
          description,
          must_have_requirements,
          preferred_requirements,
          status,
          created_at,
          updated_at,
          candidates (count),
          evaluations (count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      // Transform the data to include candidate counts
      const jobsWithCounts = data.map(job => ({
        id: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        employment_type: job.employment_type,
        compensation_min: job.compensation_min,
        compensation_max: job.compensation_max,
        description: job.description,
        must_have_requirements: job.must_have_requirements,
        preferred_requirements: job.preferred_requirements,
        status: job.status || 'draft',
        created_at: job.created_at,
        updated_at: job.updated_at,
        candidates_count: job.candidates?.[0]?.count || 0,
        evaluated_count: job.evaluations?.[0]?.count || 0
      }))

      return jobsWithCounts
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * React Query hook to fetch a single job by ID
 *
 * @param {string} jobId - Job ID to fetch
 * @returns {Object} React Query result with job data, loading state, and error
 */
export function useJob(jobId) {
  return useQuery({
    queryKey: ['jobs', jobId],
    queryFn: async () => {
      const userId = await getCurrentUserId()

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          department,
          location,
          employment_type,
          compensation_min,
          compensation_max,
          description,
          must_have_requirements,
          preferred_requirements,
          performance_profile,
          status,
          created_at,
          updated_at
        `)
        .eq('id', jobId)
        .eq('user_id', userId)
        .single()

      if (error) {
        throw error
      }

      return data
    },
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * React Query mutation hook to create a new job
 *
 * @returns {Object} React Query mutation with mutate function and status
 */
export function useCreateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (jobData) => {
      const userId = await getCurrentUserId()

      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Add user_id to job data
      const jobWithUser = {
        ...jobData,
        user_id: userId
      }

      const { data, error } = await supabase
        .from('jobs')
        .insert([jobWithUser])
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: () => {
      // Invalidate jobs query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

/**
 * React Query mutation hook to update an existing job
 *
 * @returns {Object} React Query mutation with mutate function and status
 */
export function useUpdateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ jobId, updates }) => {
      const userId = await getCurrentUserId()

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: (data) => {
      // Invalidate both jobs list and specific job query
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['jobs', data.id] })
    },
  })
}

/**
 * React Query mutation hook to delete a job
 *
 * @returns {Object} React Query mutation with mutate function and status
 */
export function useDeleteJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (jobId) => {
      const userId = await getCurrentUserId()

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      return jobId
    },
    onSuccess: () => {
      // Invalidate jobs query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}
