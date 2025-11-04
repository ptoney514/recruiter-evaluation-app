import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input, TextArea } from '../components/ui/Input'
import { storageManager } from '../services/storage/storageManager'
import { sessionStore } from '../services/storage/sessionStore'
import { JOB_TEMPLATES } from '../constants/jobTemplates'

export function JobInputPage() {
  const navigate = useNavigate()
  const [selectedTemplate, setSelectedTemplate] = useState('blank')
  const [jobData, setJobData] = useState(JOB_TEMPLATES.blank)
  const [requirementInput, setRequirementInput] = useState('')
  const [dutyInput, setDutyInput] = useState('')

  // Load existing evaluation if available
  useEffect(() => {
    async function loadExisting() {
      const existing = await storageManager.getCurrentEvaluation()
      if (existing && existing.job?.title) {
        setJobData(existing.job)
      }
    }
    loadExisting()
  }, [])

  const handleTemplateChange = (templateKey) => {
    setSelectedTemplate(templateKey)
    setJobData(JOB_TEMPLATES[templateKey])
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setJobData(prev => ({ ...prev, [name]: value }))
  }

  const addRequirement = () => {
    if (requirementInput.trim()) {
      setJobData(prev => ({
        ...prev,
        requirements: [...prev.requirements, requirementInput.trim()]
      }))
      setRequirementInput('')
    }
  }

  const removeRequirement = (index) => {
    setJobData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }))
  }

  const addDuty = () => {
    if (dutyInput.trim()) {
      setJobData(prev => ({
        ...prev,
        duties: [...prev.duties, dutyInput.trim()]
      }))
      setDutyInput('')
    }
  }

  const removeDuty = (index) => {
    setJobData(prev => ({
      ...prev,
      duties: prev.duties.filter((_, i) => i !== index)
    }))
  }

  const handleNext = async () => {
    // Validation
    if (!jobData.title.trim()) {
      alert('Please enter a job title')
      return
    }

    // Save to storage (auto-routes to session or database)
    await storageManager.updateEvaluation({ job: jobData })
    navigate('/upload-resumes')
  }

  const handleBack = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-teal-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-gradient font-bold text-base">Step 1 of 3</span>
            <span className="text-gray-700 font-medium">Job Description</span>
          </div>
          <div className="w-full bg-white/50 backdrop-blur-sm rounded-full h-3 shadow-inner">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full shadow-lg transition-all duration-500" style={{ width: '33%' }}></div>
          </div>
        </div>

        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-extrabold mb-3">
            <span className="text-gradient">Job Description</span>
          </h1>
          <p className="text-gray-700 text-lg font-medium">
            Enter the job details or select a template to get started quickly
          </p>
        </div>

        {/* Template Selector */}
        <Card glass className="mb-6 animate-slide-up">
          <label className="label mb-4 text-base">🚀 Quick Start Template (Optional)</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(JOB_TEMPLATES).map(([key, template]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleTemplateChange(key)}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 font-semibold text-sm ${
                  selectedTemplate === key
                    ? 'border-purple-600 bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 shadow-lg scale-105'
                    : 'border-white/40 bg-white/30 hover:border-purple-300 hover:bg-white/50 text-gray-700 hover:scale-105'
                }`}
              >
                {template.name}
              </button>
            ))}
          </div>
        </Card>

        {/* Job Form */}
        <Card glass className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="space-y-7">
            <Input
              label="Job Title"
              name="title"
              value={jobData.title}
              onChange={handleChange}
              placeholder="e.g., Senior Software Engineer"
              required
            />

            <TextArea
              label="Job Summary (Optional)"
              name="summary"
              value={jobData.summary}
              onChange={handleChange}
              rows={3}
              placeholder="Brief overview of the role..."
            />

            {/* Requirements */}
            <div>
              <label className="label mb-2">Requirements</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  placeholder="Add a requirement (press Enter)"
                  className="input flex-1"
                />
                <Button type="button" onClick={addRequirement} variant="secondary" size="sm">
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {jobData.requirements.map((req, index) => (
                  <div key={index} className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl px-4 py-3 hover:shadow-md transition-all duration-300">
                    <span className="text-sm text-gray-800 font-medium">• {req}</span>
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-gray-400 hover:text-red-600 ml-2 text-xl font-bold transition-colors duration-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Duties */}
            <div>
              <label className="label mb-2">Key Duties (Optional)</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={dutyInput}
                  onChange={(e) => setDutyInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDuty())}
                  placeholder="Add a duty (press Enter)"
                  className="input flex-1"
                />
                <Button type="button" onClick={addDuty} variant="secondary" size="sm">
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {jobData.duties.map((duty, index) => (
                  <div key={index} className="flex items-center justify-between bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-200 rounded-xl px-4 py-3 hover:shadow-md transition-all duration-300">
                    <span className="text-sm text-gray-800 font-medium">• {duty}</span>
                    <button
                      type="button"
                      onClick={() => removeDuty(index)}
                      className="text-gray-400 hover:text-red-600 ml-2 text-xl font-bold transition-colors duration-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Education Requirements (Optional)"
                name="education"
                value={jobData.education}
                onChange={handleChange}
                placeholder="e.g., Bachelor's degree required"
              />

              <Input
                label="Licenses/Certifications (Optional)"
                name="licenses"
                value={jobData.licenses}
                onChange={handleChange}
                placeholder="e.g., RN license, BLS, ACLS"
              />
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="secondary" onClick={handleBack}>
            Back
          </Button>
          <Button onClick={handleNext}>
            Next: Upload Resumes
          </Button>
        </div>
      </div>
    </div>
  )
}
