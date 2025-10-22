import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Link } from 'react-router-dom'

export function JobCard({ job }) {
  const statusColors = {
    open: 'success',
    closed: 'danger',
    on_hold: 'warning'
  }

  return (
    <Link to={`/jobs/${job.id}`}>
      <Card className="hover:border-primary-300">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {job.department} {job.location && `• ${job.location}`}
            </p>
          </div>
          <Badge variant={statusColors[job.status] || 'default'}>
            {job.status?.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {job.description && (
          <p className="text-sm text-gray-700 line-clamp-2 mb-3">
            {job.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            {job.employment_type && (
              <span>{job.employment_type}</span>
            )}
            {job.years_experience_min && (
              <span>
                {job.years_experience_min}
                {job.years_experience_max && `-${job.years_experience_max}`} yrs
              </span>
            )}
          </div>
          {job.compensation_min && job.compensation_max && (
            <span className="font-medium">
              ${job.compensation_min.toLocaleString()} - ${job.compensation_max.toLocaleString()}
            </span>
          )}
        </div>
      </Card>
    </Link>
  )
}
