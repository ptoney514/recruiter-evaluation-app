import { useNavigate } from 'react-router-dom'
import { Plus, Briefcase, AlertCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { RoleCard } from '../components/dashboard/RoleCard'
import { useJobs } from '../hooks/useJobs'
import { useTierLimits } from '../hooks/useTierLimits'
import { useAuth } from '../hooks/useAuth'

/**
 * Dashboard Page - Redesigned
 * Main dashboard showing statistics and job roles
 */
export function DashboardPage() {
  const navigate = useNavigate()
  const { data: jobs, isLoading, isError, error } = useJobs()
  const { user } = useAuth()
  const { jobsUsed, jobsLimit, jobsAtLimit } = useTierLimits()

  // Get user's first name for greeting
  const userName = user?.email?.split('@')[0] || 'there'
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1)

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in overflow-auto h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {displayName}</h1>
          <p className="text-slate-500 mt-1">Manage your job roles and candidate evaluations.</p>
        </div>
        <Button
          onClick={() => navigate('/app/create-role')}
          disabled={jobsAtLimit}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Create New Role ({jobsUsed}/{jobsLimit})
        </Button>
      </div>

      {/* Tier Limit Warning */}
      {jobsAtLimit && (
        <Card className="mb-6 border-l-4 border-l-amber-500 bg-amber-50 p-4 flex items-start gap-3">
          <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-amber-900">Job limit reached</h3>
            <p className="text-amber-700 text-sm mt-1">
              You've reached the limit of {jobsLimit} jobs on the free plan. Delete a job or upgrade to create more.
            </p>
          </div>
        </Card>
      )}

      {/* Active Roles Section */}
      <h2 className="text-xl font-bold text-slate-900 mb-4">Active Roles</h2>

      {/* Loading State */}
      {isLoading && (
        <Card className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4" />
          <p className="text-slate-600">Loading roles...</p>
        </Card>
      )}

      {/* Error State */}
      {isError && (
        <Card className="text-center py-12">
          <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Failed to load roles
          </h3>
          <p className="text-slate-600 mb-4">
            {error?.message || 'An error occurred while loading your roles'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      )}

      {/* Roles Grid */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs && jobs.length > 0 ? (
            jobs.map((job) => (
              <RoleCard key={job.id} role={job} />
            ))
          ) : (
            /* Empty State */
            <Card className="col-span-full text-center py-12">
              <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
                <Briefcase className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No roles yet
              </h3>
              <p className="text-slate-600 mb-4">
                Create your first role to start evaluating candidates
              </p>
              <Button onClick={() => navigate('/app/create-role')}>
                Create Role
              </Button>
            </Card>
          )}
        </div>
      )}

    </div>
  )
}
