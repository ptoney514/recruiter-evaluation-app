import { useState } from 'react'
import { Input, TextArea } from '../ui/Input'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

/**
 * Rating Input Component - Visual 1-10 scale with clickable buttons
 */
function RatingInput({ label, value, onChange, name, required = false }) {
  return (
    <div className="mb-4">
      <label className="label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex gap-1 mt-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange({ target: { name, value: rating } })}
            className={`
              w-10 h-10 rounded-lg font-semibold transition-all
              ${
                value === rating
                  ? 'bg-primary-600 text-white scale-110 shadow-md'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }
            `}
          >
            {rating}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
        <span>Poor</span>
        <span>Excellent</span>
      </div>
    </div>
  )
}

/**
 * Interview Rating Form Component
 * For entering interview evaluation data that feeds into Stage 2 evaluations (50% weight)
 */
export function InterviewRatingForm({ candidateId, initialData, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(
    initialData || {
      candidate_id: candidateId,
      interviewer_name: '',
      interview_date: '',
      interview_type: 'in_person',
      technical_skills_rating: null,
      communication_rating: null,
      problem_solving_rating: null,
      cultural_fit_rating: null,
      overall_rating: null,
      recommendation: 'HIRE',
      red_flags: [],
      strengths: '',
      concerns: '',
      notes: '',
      vs_resume_expectations: 'matched'
    }
  )

  const [redFlagInput, setRedFlagInput] = useState('')
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleRatingChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const addRedFlag = () => {
    if (redFlagInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        red_flags: [...prev.red_flags, redFlagInput.trim()]
      }))
      setRedFlagInput('')
    }
  }

  const removeRedFlag = (index) => {
    setFormData((prev) => ({
      ...prev,
      red_flags: prev.red_flags.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.interviewer_name.trim()) {
      newErrors.interviewer_name = 'Interviewer name is required'
    }

    if (!formData.interview_date) {
      newErrors.interview_date = 'Interview date is required'
    }

    // Validate all ratings are between 1-10
    const ratings = [
      'technical_skills_rating',
      'communication_rating',
      'problem_solving_rating',
      'cultural_fit_rating',
      'overall_rating'
    ]

    ratings.forEach((rating) => {
      if (!formData[rating] || formData[rating] < 1 || formData[rating] > 10) {
        newErrors[rating] = 'Rating must be between 1 and 10'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Ensure candidate_id is set
    const submitData = {
      ...formData,
      candidate_id: candidateId || formData.candidate_id
    }

    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Interview Metadata Section */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Interview Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Interviewer Name"
            name="interviewer_name"
            value={formData.interviewer_name}
            onChange={handleChange}
            placeholder="Your name"
            required
            error={errors.interviewer_name}
          />

          <Input
            label="Interview Date"
            name="interview_date"
            type="date"
            value={formData.interview_date}
            onChange={handleChange}
            required
            error={errors.interview_date}
          />

          <div>
            <label className="label">
              Interview Type <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              name="interview_type"
              value={formData.interview_type}
              onChange={handleChange}
              className="input"
            >
              <option value="phone_screen">Phone Screen</option>
              <option value="in_person">In-Person</option>
              <option value="panel">Panel Interview</option>
              <option value="video">Video Call</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Core Competency Ratings Section */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Core Competencies</h3>
        <p className="text-sm text-gray-600 mb-6">Rate each competency on a scale of 1-10</p>

        <div className="space-y-6">
          <RatingInput
            label="Technical Skills"
            name="technical_skills_rating"
            value={formData.technical_skills_rating}
            onChange={handleRatingChange}
            required
          />
          {errors.technical_skills_rating && (
            <p className="text-red-500 text-sm -mt-4">{errors.technical_skills_rating}</p>
          )}

          <RatingInput
            label="Communication"
            name="communication_rating"
            value={formData.communication_rating}
            onChange={handleRatingChange}
            required
          />
          {errors.communication_rating && (
            <p className="text-red-500 text-sm -mt-4">{errors.communication_rating}</p>
          )}

          <RatingInput
            label="Problem Solving"
            name="problem_solving_rating"
            value={formData.problem_solving_rating}
            onChange={handleRatingChange}
            required
          />
          {errors.problem_solving_rating && (
            <p className="text-red-500 text-sm -mt-4">{errors.problem_solving_rating}</p>
          )}

          <RatingInput
            label="Cultural Fit"
            name="cultural_fit_rating"
            value={formData.cultural_fit_rating}
            onChange={handleRatingChange}
            required
          />
          {errors.cultural_fit_rating && (
            <p className="text-red-500 text-sm -mt-4">{errors.cultural_fit_rating}</p>
          )}
        </div>
      </Card>

      {/* Overall Assessment Section */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Overall Assessment</h3>

        <RatingInput
          label="Overall Rating"
          name="overall_rating"
          value={formData.overall_rating}
          onChange={handleRatingChange}
          required
        />
        {errors.overall_rating && (
          <p className="text-red-500 text-sm -mt-2 mb-4">{errors.overall_rating}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="label">
              Recommendation <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              name="recommendation"
              value={formData.recommendation}
              onChange={handleChange}
              className="input"
            >
              <option value="STRONG_HIRE">Strong Hire</option>
              <option value="HIRE">Hire</option>
              <option value="MARGINAL">Marginal</option>
              <option value="DO_NOT_HIRE">Do Not Hire</option>
            </select>
          </div>

          <div>
            <label className="label">
              vs Resume Expectations <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              name="vs_resume_expectations"
              value={formData.vs_resume_expectations}
              onChange={handleChange}
              className="input"
            >
              <option value="exceeded">Exceeded Expectations</option>
              <option value="matched">Matched Expectations</option>
              <option value="below">Below Expectations</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Red Flags Section */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Red Flags</h3>
        <p className="text-sm text-gray-600 mb-4">
          Note any concerns or warning signs observed during the interview
        </p>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={redFlagInput}
            onChange={(e) => setRedFlagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRedFlag())}
            placeholder="Add a red flag (press Enter)"
            className="input flex-1"
          />
          <Button type="button" onClick={addRedFlag} variant="secondary" size="sm">
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {formData.red_flags.map((flag, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-2"
            >
              <span className="text-red-800 text-sm">{flag}</span>
              <button
                type="button"
                onClick={() => removeRedFlag(index)}
                className="text-red-600 hover:text-red-800 font-bold text-lg"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {formData.red_flags.length === 0 && (
          <p className="text-gray-400 text-sm italic">No red flags noted</p>
        )}
      </Card>

      {/* Detailed Notes Section */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Detailed Feedback</h3>

        <TextArea
          label="Strengths"
          name="strengths"
          value={formData.strengths}
          onChange={handleChange}
          rows={4}
          placeholder="What did the candidate do particularly well? Specific examples..."
        />

        <TextArea
          label="Concerns"
          name="concerns"
          value={formData.concerns}
          onChange={handleChange}
          rows={4}
          placeholder="What areas need improvement or raised concerns?"
        />

        <TextArea
          label="Additional Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={6}
          placeholder="Any additional observations, context, or details about the interview..."
        />
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Interview Rating' : 'Save Interview Rating'}
        </Button>
      </div>
    </form>
  )
}
