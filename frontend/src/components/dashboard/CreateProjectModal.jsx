import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useCreateJob } from '../../hooks/useJobs'

/**
 * CreateProjectModal Component
 * Modal for creating a new job evaluation project
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 */
export function CreateProjectModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const createJob = useCreateJob()

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    employment_type: 'Full-time',
    compensation_min: '',
    compensation_max: '',
    description: '',
    must_have_requirements: [],
    preferred_requirements: []
  })

  const [errors, setErrors] = useState({})

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title?.trim()) {
      newErrors.title = 'Job title is required'
    }

    if (!formData.department?.trim()) {
      newErrors.department = 'Department is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const newJob = await createJob.mutateAsync(formData)

      // Navigate to job input page with the new job
      navigate(`/job-input?jobId=${newJob.id}`)

      // Close modal
      onClose()
    } catch (error) {
      console.error('Failed to create job:', error)
      setErrors({
        submit: error.message || 'Failed to create project. Please try again.'
      })
    }
  }

  const handleCancel = () => {
    setFormData({
      title: '',
      department: '',
      location: '',
      employment_type: 'Full-time',
      compensation_min: '',
      compensation_max: '',
      description: '',
      must_have_requirements: [],
      preferred_requirements: []
    })
    setErrors({})
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
            <p className="text-gray-600 mt-1">
              Start a new resume evaluation project
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Job Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Senior Software Engineer"
              error={errors.title}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Department & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g., Engineering"
                error={errors.department}
              />
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department}</p>
              )}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., San Francisco, CA"
              />
            </div>
          </div>

          {/* Employment Type */}
          <div>
            <label htmlFor="employment_type" className="block text-sm font-medium text-gray-700 mb-2">
              Employment Type
            </label>
            <select
              id="employment_type"
              name="employment_type"
              value={formData.employment_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          {/* Compensation Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="compensation_min" className="block text-sm font-medium text-gray-700 mb-2">
                Min Compensation
              </label>
              <Input
                id="compensation_min"
                name="compensation_min"
                type="number"
                value={formData.compensation_min}
                onChange={handleChange}
                placeholder="e.g., 120000"
              />
            </div>

            <div>
              <label htmlFor="compensation_max" className="block text-sm font-medium text-gray-700 mb-2">
                Max Compensation
              </label>
              <Input
                id="compensation_max"
                name="compensation_max"
                type="number"
                value={formData.compensation_max}
                onChange={handleChange}
                placeholder="e.g., 180000"
              />
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Job Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Paste the full job description here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
            <p className="mt-1 text-xs text-gray-500">
              You can add detailed requirements in the next step
            </p>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              className="flex-1"
              disabled={createJob.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createJob.isPending}
            >
              {createJob.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
