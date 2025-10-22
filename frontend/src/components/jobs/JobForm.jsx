import { useState } from 'react'
import { Input, TextArea } from '../ui/Input'
import { Button } from '../ui/Button'

export function JobForm({ initialData, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(
    initialData || {
      title: '',
      department: '',
      location: '',
      employment_type: 'Full-time',
      description: '',
      must_have_requirements: [],
      preferred_requirements: [],
      years_experience_min: '',
      years_experience_max: '',
      compensation_min: '',
      compensation_max: '',
      status: 'open'
    }
  )

  const [mustHaveInput, setMustHaveInput] = useState('')
  const [preferredInput, setPreferredInput] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const addMustHave = () => {
    if (mustHaveInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        must_have_requirements: [...(prev.must_have_requirements || []), mustHaveInput.trim()]
      }))
      setMustHaveInput('')
    }
  }

  const removeMustHave = (index) => {
    setFormData((prev) => ({
      ...prev,
      must_have_requirements: prev.must_have_requirements.filter((_, i) => i !== index)
    }))
  }

  const addPreferred = () => {
    if (preferredInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        preferred_requirements: [...(prev.preferred_requirements || []), preferredInput.trim()]
      }))
      setPreferredInput('')
    }
  }

  const removePreferred = (index) => {
    setFormData((prev) => ({
      ...prev,
      preferred_requirements: prev.preferred_requirements.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Convert string numbers to actual numbers
    const submitData = {
      ...formData,
      years_experience_min: formData.years_experience_min ? parseInt(formData.years_experience_min) : null,
      years_experience_max: formData.years_experience_max ? parseInt(formData.years_experience_max) : null,
      compensation_min: formData.compensation_min ? parseFloat(formData.compensation_min) : null,
      compensation_max: formData.compensation_max ? parseFloat(formData.compensation_max) : null
    }

    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Job Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Senior Software Engineer"
          required
        />

        <Input
          label="Department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          placeholder="e.g., Engineering"
        />

        <Input
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g., Remote, New York, NY"
        />

        <div>
          <label className="label">Employment Type</label>
          <select
            name="employment_type"
            value={formData.employment_type}
            onChange={handleChange}
            className="input"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Temporary">Temporary</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        <Input
          label="Min Years Experience"
          name="years_experience_min"
          type="number"
          value={formData.years_experience_min}
          onChange={handleChange}
          placeholder="e.g., 3"
        />

        <Input
          label="Max Years Experience"
          name="years_experience_max"
          type="number"
          value={formData.years_experience_max}
          onChange={handleChange}
          placeholder="e.g., 7"
        />

        <Input
          label="Min Compensation"
          name="compensation_min"
          type="number"
          value={formData.compensation_min}
          onChange={handleChange}
          placeholder="e.g., 80000"
        />

        <Input
          label="Max Compensation"
          name="compensation_max"
          type="number"
          value={formData.compensation_max}
          onChange={handleChange}
          placeholder="e.g., 120000"
        />
      </div>

      <TextArea
        label="Job Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        rows={4}
        placeholder="Describe the role, responsibilities, and what makes it unique..."
      />

      {/* Must-have requirements */}
      <div>
        <label className="label">Must-Have Requirements</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={mustHaveInput}
            onChange={(e) => setMustHaveInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMustHave())}
            placeholder="Add a requirement (press Enter)"
            className="input flex-1"
          />
          <Button type="button" onClick={addMustHave} variant="secondary">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.must_have_requirements?.map((req, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
            >
              {req}
              <button
                type="button"
                onClick={() => removeMustHave(index)}
                className="text-primary-600 hover:text-primary-800 ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Preferred requirements */}
      <div>
        <label className="label">Preferred Requirements</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={preferredInput}
            onChange={(e) => setPreferredInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPreferred())}
            placeholder="Add a nice-to-have (press Enter)"
            className="input flex-1"
          />
          <Button type="button" onClick={addPreferred} variant="secondary">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.preferred_requirements?.map((req, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
            >
              {req}
              <button
                type="button"
                onClick={() => removePreferred(index)}
                className="text-gray-600 hover:text-gray-800 ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="input"
        >
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="on_hold">On Hold</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Job' : 'Create Job'}
        </Button>
      </div>
    </form>
  )
}
