import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ProjectCard } from '../components/dashboard/ProjectCard'
import { CreateProjectModal } from '../components/dashboard/CreateProjectModal'
import { useJobs } from '../hooks/useJobs'

/**
 * Dashboard Page
 * Main dashboard showing all job evaluation projects
 * Allows users to view existing projects and create new ones
 */
export function DashboardPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { data: jobs, isLoading, isError, error } = useJobs()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">
              Manage your resume evaluation projects
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" />
            <p className="text-gray-600">Loading projects...</p>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to load projects
            </h3>
            <p className="text-gray-600 mb-4">
              {error?.message || 'An error occurred while loading your projects'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Card>
        )}

        {/* Projects Grid */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <ProjectCard key={job.id} project={job} />
              ))
            ) : (
              /* Empty State */
              <Card className="col-span-full text-center py-12">
                <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No projects yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first project to start evaluating resumes
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  Create Project
                </Button>
              </Card>
            )}
          </div>
        )}

        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    </div>
  )
}
