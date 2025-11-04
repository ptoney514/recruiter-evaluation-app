/**
 * Job Creation Modal Component
 * Two-step process: 1) Import/Manual choice 2) Review & Confirm
 * Matches wireframes W2 and W2b
 */
import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input, TextArea } from '../ui/Input'
import { API_BASE_URL } from '../../constants/config'

export function JobCreationModal({ isOpen, onClose, onJobCreated }) {
  const [step, setStep] = useState(1) // 1 = import choice, 2 = review/confirm
  const [creationMode, setCreationMode] = useState('import') // 'import' or 'manual'
  const [jobDescriptionText, setJobDescriptionText] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState(null)

  // Extracted/manual job data
  const [jobData, setJobData] = useState({
    title: '',
    department: '',
    location: '',
    employmentType: 'full-time',
    mustHaveRequirements: [],
    preferredQualifications: [],
    evaluationTrack: 'ai' // 'regex' or 'ai'
  })

  // Form inputs for adding requirements
  const [mustHaveInput, setMustHaveInput] = useState('')
  const [preferredInput, setPreferredInput] = useState('')

  if (!isOpen) return null

  const handleExtractDetails = async () => {
    if (!jobDescriptionText.trim()) {
      setExtractionError('Please enter or paste a job description')
      return
    }

    setIsExtracting(true)
    setExtractionError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/extract_job_details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_description: jobDescriptionText })
      })

      if (!response.ok) {
        throw new Error('Failed to extract job details')
      }

      const data = await response.json()

      // Update job data with extracted information
      setJobData({
        title: data.title || '',
        department: data.department || '',
        location: data.location || '',
        employmentType: data.employment_type || 'full-time',
        mustHaveRequirements: data.must_have_requirements || [],
        preferredQualifications: data.preferred_qualifications || [],
        evaluationTrack: 'ai'
      })

      // Move to step 2
      setStep(2)
    } catch (error) {
      console.error('Extraction error:', error)
      setExtractionError('Failed to extract job details. Please try again or use manual entry.')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleManualEntry = () => {
    setCreationMode('manual')
    setStep(2)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setJobData(prev => ({ ...prev, [name]: value }))
  }

  const addMustHaveRequirement = () => {
    if (mustHaveInput.trim()) {
      setJobData(prev => ({
        ...prev,
        mustHaveRequirements: [...prev.mustHaveRequirements, mustHaveInput.trim()]
      }))
      setMustHaveInput('')
    }
  }

  const removeMustHaveRequirement = (index) => {
    setJobData(prev => ({
      ...prev,
      mustHaveRequirements: prev.mustHaveRequirements.filter((_, i) => i !== index)
    }))
  }

  const addPreferredQualification = () => {
    if (preferredInput.trim()) {
      setJobData(prev => ({
        ...prev,
        preferredQualifications: [...prev.preferredQualifications, preferredInput.trim()]
      }))
      setPreferredInput('')
    }
  }

  const removePreferredQualification = (index) => {
    setJobData(prev => ({
      ...prev,
      preferredQualifications: prev.preferredQualifications.filter((_, i) => i !== index)
    }))
  }

  const handleCreateJob = async () => {
    // Validation
    if (!jobData.title.trim()) {
      alert('Please enter a job title')
      return
    }

    if (jobData.mustHaveRequirements.length === 0) {
      alert('Please add at least one must-have requirement')
      return
    }

    // Call parent callback with job data
    onJobCreated(jobData)
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
      setJobData({
        title: '',
        department: '',
        location: '',
        employmentType: 'full-time',
        mustHaveRequirements: [],
        preferredQualifications: [],
        evaluationTrack: 'ai'
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal content */}
        <div className="relative inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 text-2xl font-bold"
          >
            ×
          </button>

          {/* Header */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {step === 1 ? 'Create New Job' : 'Create New Job - Review & Confirm'}
          </h2>

          {/* Step 1: Import Choice */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="text-gray-700 mb-4">How would you like to create this job?</p>

                {/* Mode selection */}
                <div className="space-y-3 mb-6">
                  <div
                    onClick={() => setCreationMode('import')}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      creationMode === 'import'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        checked={creationMode === 'import'}
                        onChange={() => setCreationMode('import')}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">
                          Import from Job Description (Recommended)
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Upload or paste your job posting - we'll automatically extract requirements
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setCreationMode('manual')}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      creationMode === 'manual'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        checked={creationMode === 'manual'}
                        onChange={() => setCreationMode('manual')}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">Manual Entry</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Fill out job details manually
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Import mode: job description input */}
                {creationMode === 'import' && (
                  <>
                    <hr className="my-6 border-gray-200" />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📄 Job Description
                      </label>

                      {/* Note: File upload can be added later */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Paste job description text:</p>
                        <TextArea
                          value={jobDescriptionText}
                          onChange={(e) => setJobDescriptionText(e.target.value)}
                          rows={10}
                          placeholder="We're looking for a Senior Software Engineer with 5+ years of Python experience to join our team in San Francisco. Must have React and PostgreSQL experience..."
                          className="w-full"
                        />
                      </div>

                      {extractionError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                          {extractionError}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                {creationMode === 'import' ? (
                  <Button
                    onClick={handleExtractDetails}
                    disabled={isExtracting || !jobDescriptionText.trim()}
                  >
                    {isExtracting ? 'Extracting...' : 'Extract Details with AI →'}
                  </Button>
                ) : (
                  <Button onClick={handleManualEntry}>
                    Continue to Manual Entry →
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Review & Confirm */}
          {step === 2 && (
            <div className="space-y-6">
              {creationMode === 'import' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    ✨ AI extracted the following from your job description. Review and edit as needed.
                  </p>
                </div>
              )}

              {/* Job Title */}
              <Input
                label="Job Title *"
                name="title"
                value={jobData.title}
                onChange={handleChange}
                placeholder="e.g., Senior Software Engineer"
                required
              />

              {/* Department and Location */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Department"
                  name="department"
                  value={jobData.department}
                  onChange={handleChange}
                  placeholder="e.g., Engineering"
                />
                <Input
                  label="Location"
                  name="location"
                  value={jobData.location}
                  onChange={handleChange}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>

              {/* Employment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="employmentType"
                      value="full-time"
                      checked={jobData.employmentType === 'full-time'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm">Full-time</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="employmentType"
                      value="part-time"
                      checked={jobData.employmentType === 'part-time'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm">Part-time</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="employmentType"
                      value="contract"
                      checked={jobData.employmentType === 'contract'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm">Contract</span>
                  </label>
                </div>
              </div>

              {/* Must-Have Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Must-Have Requirements *
                </label>
                <div className="space-y-2 mb-3">
                  {jobData.mustHaveRequirements.map((req, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 border rounded-lg px-4 py-2">
                      <span className="text-sm text-gray-700">• {req}</span>
                      <button
                        type="button"
                        onClick={() => removeMustHaveRequirement(index)}
                        className="text-gray-400 hover:text-red-600 ml-2 text-lg font-bold"
                      >
                        × Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={mustHaveInput}
                    onChange={(e) => setMustHaveInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMustHaveRequirement())}
                    placeholder="Add a requirement (press Enter)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Button type="button" onClick={addMustHaveRequirement} variant="secondary" size="sm">
                    + Add Requirement
                  </Button>
                </div>
              </div>

              {/* Preferred Qualifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Qualifications (Optional)
                </label>
                <div className="space-y-2 mb-3">
                  {jobData.preferredQualifications.map((qual, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 border rounded-lg px-4 py-2">
                      <span className="text-sm text-gray-700">• {qual}</span>
                      <button
                        type="button"
                        onClick={() => removePreferredQualification(index)}
                        className="text-gray-400 hover:text-red-600 ml-2 text-lg font-bold"
                      >
                        × Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={preferredInput}
                    onChange={(e) => setPreferredInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPreferredQualification())}
                    placeholder="Add a preferred qualification (press Enter)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Button type="button" onClick={addPreferredQualification} variant="secondary" size="sm">
                    + Add Preferred
                  </Button>
                </div>
              </div>

              {/* Evaluation Track */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evaluation Track *
                </label>
                <div className="space-y-3">
                  <div
                    onClick={() => setJobData(prev => ({ ...prev, evaluationTrack: 'regex' }))}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      jobData.evaluationTrack === 'regex'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        checked={jobData.evaluationTrack === 'regex'}
                        onChange={() => setJobData(prev => ({ ...prev, evaluationTrack: 'regex' }))}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">Regex-Only (FREE unlimited)</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Fast keyword matching, good for high volume
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setJobData(prev => ({ ...prev, evaluationTrack: 'ai' }))}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      jobData.evaluationTrack === 'ai'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        checked={jobData.evaluationTrack === 'ai'}
                        onChange={() => setJobData(prev => ({ ...prev, evaluationTrack: 'ai' }))}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">AI-Powered</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Contextual evaluation with reasoning
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t">
                <Button variant="secondary" onClick={handleBack}>
                  ← Back
                </Button>
                <Button onClick={handleCreateJob}>
                  Create Job →
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
