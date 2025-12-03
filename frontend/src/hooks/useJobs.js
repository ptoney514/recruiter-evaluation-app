import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as dbService from '../services/databaseService'

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
      const result = await dbService.getJobs()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch jobs')
      }

      // Transform the data to include candidate counts
      const jobsWithCounts = (result.jobs || []).map(job => ({
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
        candidates_count: job.candidates_count || 0,
        evaluated_count: job.evaluated_count || 0
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
      const result = await dbService.getJob(jobId)

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch job')
      }

      return result.job
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
      const result = await dbService.createJob(jobData)

      if (!result.success) {
        throw new Error(result.error || 'Failed to create job')
      }

      return result.job
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
      const result = await dbService.updateJob(jobId, updates)

      if (!result.success) {
        throw new Error(result.error || 'Failed to update job')
      }

      return result.job
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
      const result = await dbService.deleteJob(jobId)

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete job')
      }

      return jobId
    },
    onSuccess: () => {
      // Invalidate jobs query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}
