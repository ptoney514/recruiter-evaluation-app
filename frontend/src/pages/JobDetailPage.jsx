import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { JobForm } from '../components/jobs/JobForm'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useJob, useUpdateJob, useDeleteJob } from '../hooks/useJobs'

export function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)

  const { data: job, isLoading, error } = useJob(id)
  const updateJob = useUpdateJob()
  const deleteJob = useDeleteJob()

  const handleUpdate = async (jobData) => {
    try {
      await updateJob.mutateAsync({ id, data: jobData })
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating job:', err)
      alert('Failed to update job. Please try again.')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return
    }

    try {
      await deleteJob.mutateAsync(id)
      navigate('/jobs')
    } catch (err) {
      console.error('Error deleting job:', err)
      alert('Failed to delete job. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading job details...</p>
        </div>
      </Layout>
    )
  }

  if (error || !job) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600">Error loading job details</p>
          <Button onClick={() => navigate('/jobs')} className="mt-4">
            Back to Jobs
          </Button>
        </div>
      </Layout>
    )
  }

  const statusColors = {
    open: 'success',
    closed: 'danger',
    on_hold: 'warning'
  }

  return (
    <Layout>
      <div className="mb-6">
        <Button variant="secondary" onClick={() => navigate('/jobs')}>
          ← Back to Jobs
        </Button>
      </div>

      {isEditing ? (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Edit Job</h2>
          <JobForm
            initialData={job}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isLoading={updateJob.isPending}
          />
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                  <Badge variant={statusColors[job.status]}>
                    {job.status?.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                  {job.department && <span>{job.department}</span>}
                  {job.location && <span>• {job.location}</span>}
                  {job.employment_type && <span>• {job.employment_type}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>

            {job.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {job.must_have_requirements && job.must_have_requirements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Must-Have Requirements</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {job.must_have_requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {job.preferred_requirements && job.preferred_requirements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Preferred Requirements</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {job.preferred_requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              {job.years_experience_min !== null && (
                <div>
                  <p className="text-sm text-gray-600">Experience</p>
                  <p className="font-semibold">
                    {job.years_experience_min}
                    {job.years_experience_max && `-${job.years_experience_max}`} years
                  </p>
                </div>
              )}
              {job.compensation_min && job.compensation_max && (
                <div>
                  <p className="text-sm text-gray-600">Compensation</p>
                  <p className="font-semibold">
                    ${job.compensation_min.toLocaleString()} - ${job.compensation_max.toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-semibold">
                  {new Date(job.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Updated</p>
                <p className="font-semibold">
                  {new Date(job.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Candidates</h2>
              <Button>+ Add Candidate</Button>
            </div>
            <div className="text-center py-12 text-gray-600">
              <p>No candidates yet. Add your first candidate to get started!</p>
              <p className="text-sm mt-2">Candidate management coming in Phase 2</p>
            </div>
          </Card>
        </>
      )}
    </Layout>
  )
}
