import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsService } from '../services/jobsService'

// Get all jobs
export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: jobsService.getAll
  })
}

// Get single job
export function useJob(id) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobsService.getById(id),
    enabled: !!id
  })
}

// Get job with candidates
export function useJobWithCandidates(id) {
  return useQuery({
    queryKey: ['jobs', id, 'candidates'],
    queryFn: () => jobsService.getWithCandidates(id),
    enabled: !!id
  })
}

// Create job mutation
export function useCreateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: jobsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    }
  })
}

// Update job mutation
export function useUpdateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => jobsService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['jobs', data.id] })
    }
  })
}

// Delete job mutation
export function useDeleteJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: jobsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    }
  })
}
