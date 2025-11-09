import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'

/**
 * ProjectCard Component
 * Displays a single job evaluation project with key information
 *
 * @param {Object} props
 * @param {Object} props.project - Job project data from Supabase
 * @param {string} props.project.id - Project ID
 * @param {string} props.project.title - Job title
 * @param {string} props.project.department - Department/team
 * @param {number} props.project.candidates_count - Number of candidates
 * @param {number} props.project.evaluated_count - Number evaluated
 * @param {string} props.project.created_at - Creation timestamp
 * @param {string} props.project.status - Project status (draft/active/completed)
 */
export function ProjectCard({ project }) {
  const {
    id,
    title,
    department,
    location,
    candidates_count = 0,
    evaluated_count = 0,
    created_at,
    status = 'draft'
  } = project

  // Calculate completion percentage
  const completionPercentage = candidates_count > 0
    ? Math.round((evaluated_count / candidates_count) * 100)
    : 0

  // Format date
  const formattedDate = new Date(created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  // Status badge variant
  const statusVariant = {
    draft: 'secondary',
    active: 'primary',
    completed: 'success'
  }[status] || 'secondary'

  return (
    <Link to={`/app/project/${id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                {title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {department && (
                  <span className="truncate">{department}</span>
                )}
                {location && department && (
                  <span className="text-gray-400">•</span>
                )}
                {location && (
                  <span className="truncate">{location}</span>
                )}
              </div>
            </div>
            <Badge variant={statusVariant} className="ml-2 flex-shrink-0">
              {status}
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-2xl font-bold text-primary-600">
                {candidates_count}
              </div>
              <div className="text-xs text-gray-600">Candidates</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {evaluated_count}
              </div>
              <div className="text-xs text-gray-600">Evaluated</div>
            </div>
          </div>

          {/* Progress Bar */}
          {candidates_count > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Created {formattedDate}
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Card>
    </Link>
  )
}
