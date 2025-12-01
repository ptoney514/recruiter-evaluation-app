import { useJobs } from './useJobs'

// Dev mode bypasses tier limits for testing
const DEV_AUTH_BYPASS = import.meta.env.VITE_AUTH_BYPASS === 'true'

const TIER_LIMITS = {
  free: {
    jobs: DEV_AUTH_BYPASS ? Infinity : 3,
    candidatesPerJob: DEV_AUTH_BYPASS ? Infinity : 5
  },
  pro: {
    jobs: Infinity,
    candidatesPerJob: Infinity
  },
  enterprise: {
    jobs: Infinity,
    candidatesPerJob: Infinity
  }
}

/**
 * Hook to track tier usage and limits
 * Calculates current usage against free/pro/enterprise tier limits
 */
export function useTierLimits(currentTier = 'free') {
  const { data: jobs = [] } = useJobs()

  const limits = TIER_LIMITS[currentTier]

  // Calculate usage
  const jobsUsed = jobs.filter(j => j.status !== 'archived').length
  const jobsAvailable = limits.jobs - jobsUsed

  // Per-job candidate limits
  const candidateCounts = jobs.map(job => ({
    jobId: job.id,
    count: job.candidates_count || 0,
    available: limits.candidatesPerJob - (job.candidates_count || 0)
  }))

  return {
    jobsUsed,
    jobsLimit: limits.jobs,
    jobsAvailable,
    jobsAtLimit: jobsUsed >= limits.jobs,
    candidateCounts,
    getCandidateCountForJob: (jobId) => {
      const job = candidateCounts.find(c => c.jobId === jobId)
      return job?.count || 0
    },
    getCandidateAvailableForJob: (jobId) => {
      const job = candidateCounts.find(c => c.jobId === jobId)
      return job?.available || limits.candidatesPerJob
    },
    isCandidateAtLimitForJob: (jobId) => {
      const job = candidateCounts.find(c => c.jobId === jobId)
      return job && job.count >= limits.candidatesPerJob
    }
  }
}
