/**
 * React Query hooks for evaluations
 * Manages server state for evaluation data
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { storageManager } from '../services/storage/storageManager'
import { supabaseStore } from '../services/storage/supabaseStore'

/**
 * Hook to get evaluation history
 * @param {Object} options - Query options
 * @returns {Object} React Query result
 */
export function useEvaluations(options = {}) {
  return useQuery({
    queryKey: ['evaluations', options],
    queryFn: () => storageManager.getEvaluationHistory(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  })
}

/**
 * Hook to get current/active evaluation
 * @returns {Object} React Query result
 */
export function useCurrentEvaluation() {
  return useQuery({
    queryKey: ['current-evaluation'],
    queryFn: () => storageManager.getCurrentEvaluation(),
    staleTime: 1 * 60 * 1000 // 1 minute
  })
}

/**
 * Hook to save evaluation (create/update)
 * @returns {Object} Mutation object
 */
export function useSaveEvaluation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (evaluationData) => storageManager.saveEvaluation(evaluationData),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
      queryClient.invalidateQueries({ queryKey: ['current-evaluation'] })
    }
  })
}

/**
 * Hook to clear evaluation
 * @returns {Object} Mutation object
 */
export function useClearEvaluation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => storageManager.clearEvaluation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
      queryClient.invalidateQueries({ queryKey: ['current-evaluation'] })
    }
  })
}

/**
 * Hook to get all jobs
 * @param {Object} options - Query options (status, limit, offset)
 * @returns {Object} React Query result
 */
export function useJobs(options = {}) {
  return useQuery({
    queryKey: ['jobs', options],
    queryFn: () => storageManager.getJobs(options),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

/**
 * Hook to get job with evaluations
 * @param {string} jobId - Job ID
 * @returns {Object} React Query result
 */
export function useJobWithEvaluations(jobId) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: () => storageManager.getJobWithEvaluations(jobId),
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

/**
 * Hook to delete job
 * @returns {Object} Mutation object
 */
export function useDeleteJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId) => supabaseStore.deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
    }
  })
}

/**
 * Hook to get storage info
 * @returns {Object} React Query result
 */
export function useStorageInfo() {
  return useQuery({
    queryKey: ['storage-info'],
    queryFn: () => storageManager.getStorageInfo(),
    staleTime: 30 * 1000 // 30 seconds
  })
}
