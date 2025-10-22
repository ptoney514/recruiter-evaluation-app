import { useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { JobList } from '../components/jobs/JobList'
import { JobForm } from '../components/jobs/JobForm'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useJobs, useCreateJob } from '../hooks/useJobs'

export function JobsPage() {
  const [showForm, setShowForm] = useState(false)
  const { data: jobs, isLoading, error } = useJobs()
  const createJob = useCreateJob()

  const handleCreateJob = async (jobData) => {
    try {
      await createJob.mutateAsync(jobData)
      setShowForm(false)
    } catch (err) {
      console.error('Error creating job:', err)
      alert('Failed to create job. Please try again.')
    }
  }

  return (
    <Layout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600 mt-1">Manage your open positions and job postings</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>+ Create Job</Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Job</h2>
          <JobForm
            onSubmit={handleCreateJob}
            onCancel={() => setShowForm(false)}
            isLoading={createJob.isPending}
          />
        </Card>
      )}

      <JobList jobs={jobs} isLoading={isLoading} error={error} />
    </Layout>
  )
}
