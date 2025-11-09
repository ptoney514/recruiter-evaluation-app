import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useJob, useUpdateJob } from '../hooks/useJobs'
import { PerformanceProfileWizard } from '../components/performanceProfile/PerformanceProfileWizard'
import { EditProjectModal } from '../components/dashboard/EditProjectModal'

/**
 * ProjectDetailPage
 * Detailed view of a single job evaluation project
 * Shows project info, candidates, and allows resume uploads and evaluations
 */
export function ProjectDetailPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { data: project, isLoading, isError, error } = useJob(projectId)
  const updateJob = useUpdateJob()
  const [showProfileWizard, setShowProfileWizard] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" />
            <p className="text-gray-600">Loading project...</p>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
              <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to load project
            </h3>
            <p className="text-gray-600 mb-4">
              {error?.message || 'An error occurred while loading the project'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => navigate('/app')}>
                Back to Dashboard
              </Button>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Format compensation
  const formatCompensation = () => {
    if (!project.compensation_min && !project.compensation_max) return 'Not specified'
    if (project.compensation_min && project.compensation_max) {
      return `$${(project.compensation_min / 1000).toFixed(0)}k - $${(project.compensation_max / 1000).toFixed(0)}k`
    }
    if (project.compensation_min) return `$${(project.compensation_min / 1000).toFixed(0)}k+`
    return `Up to $${(project.compensation_max / 1000).toFixed(0)}k`
  }

  const statusVariant = {
    draft: 'secondary',
    open: 'primary',
    closed: 'default'
  }[project.status] || 'secondary'

  // Helper to count completed profile questions
  const getProfileCompletion = (profile) => {
    if (!profile) return 0
    let count = 0
    if (profile.year_1_outcomes?.length > 0) count++
    if (profile.biggest_challenge) count++
    if (profile.comparable_experience?.length > 0) count++
    if (profile.dealbreakers?.length > 0) count++
    if (profile.motivation_drivers?.length > 0) count++
    if (profile.must_have_requirements?.length > 0) count++
    if (profile.nice_to_have_requirements?.length > 0) count++
    if (profile.trajectory_patterns?.length > 0) count++
    if (profile.context_notes) count++
    return count
  }

  const profileCompletion = getProfileCompletion(project.performance_profile)

  const handleProfileUpdate = async (updatedProfile) => {
    try {
      await updateJob.mutateAsync({
        jobId: projectId,
        updates: {
          performance_profile: updatedProfile
        }
      })
      setShowProfileWizard(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      // Error will be shown in wizard
    }
  }

  const handleProjectUpdate = async (updatedData) => {
    await updateJob.mutateAsync({
      jobId: projectId,
      updates: updatedData
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/app')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Projects
          </button>

          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                <Badge variant={statusVariant}>{project.status}</Badge>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                {project.department && (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {project.department}
                  </span>
                )}
                {project.location && (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {project.location}
                  </span>
                )}
                {project.employment_type && (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {project.employment_type}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button>
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Resumes
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="text-sm text-gray-600 mb-1">Total Candidates</div>
            <div className="text-3xl font-bold text-primary-600">0</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-600 mb-1">Evaluated</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-600 mb-1">To Interview</div>
            <div className="text-3xl font-bold text-green-600">0</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-600 mb-1">Compensation</div>
            <div className="text-xl font-bold text-gray-900">{formatCompensation()}</div>
          </Card>
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Description */}
          <Card className="lg:col-span-2">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Job Description</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowEditModal(true)}
              >
                Edit
              </Button>
            </div>
            {project.description ? (
              <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
            ) : (
              <p className="text-gray-500 italic">No description provided</p>
            )}
          </Card>

          {/* Performance Profile Summary */}
          <Card>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Performance Profile</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowProfileWizard(true)}
              >
                Edit
              </Button>
            </div>

            {project.performance_profile && Object.keys(project.performance_profile).length > 0 ? (
              <div className="space-y-3">
                {project.performance_profile.year_1_outcomes?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">Year 1 Outcomes</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {project.performance_profile.year_1_outcomes.map((outcome, idx) => (
                        <li key={idx} className="flex items-start">
                          <svg className="w-4 h-4 mr-1 mt-0.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {project.performance_profile.biggest_challenge && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">Biggest Challenge</p>
                    <p className="text-sm text-gray-600">{project.performance_profile.biggest_challenge}</p>
                  </div>
                )}

                {project.performance_profile.comparable_experience?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">Comparable Experience</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {project.performance_profile.comparable_experience.map((exp, idx) => (
                        <li key={idx}>• {exp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {project.performance_profile.motivation_drivers?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">Motivation Drivers</p>
                    <div className="flex flex-wrap gap-1">
                      {project.performance_profile.motivation_drivers.map((driver, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {driver}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 mb-3">No Performance Profile created</p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowProfileWizard(true)}
                >
                  Create Profile
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Edit Project Modal */}
        {showEditModal && (
          <EditProjectModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSave={handleProjectUpdate}
            project={project}
          />
        )}

        {/* Performance Profile Wizard */}
        {showProfileWizard && (
          <PerformanceProfileWizard
            isOpen={showProfileWizard}
            onClose={() => setShowProfileWizard(false)}
            onComplete={handleProfileUpdate}
            initialData={project.performance_profile || {}}
          />
        )}

        {/* Old Requirements Section (Keep for backward compatibility) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-3">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>

            {project.must_have_requirements && project.must_have_requirements.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Must Have</h3>
                <ul className="space-y-1">
                  {project.must_have_requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 mt-0.5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {project.preferred_requirements && project.preferred_requirements.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Preferred</h3>
                <ul className="space-y-1">
                  {project.preferred_requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(!project.must_have_requirements || project.must_have_requirements.length === 0) &&
             (!project.preferred_requirements || project.preferred_requirements.length === 0) && (
              <p className="text-gray-500 italic text-sm">No requirements specified</p>
            )}
          </Card>
        </div>

        {/* Candidates Section */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Candidates</h2>
            <Button>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Candidate
            </Button>
          </div>

          {/* Empty State */}
          <div className="text-center py-12">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No candidates yet
            </h3>
            <p className="text-gray-600 mb-4">
              Upload resumes to start evaluating candidates for this position
            </p>
            <Button>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Resumes
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
