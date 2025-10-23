import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input, TextArea } from '../components/ui/Input'
import { sessionStore } from '../services/storage/sessionStore'

// Job templates for common roles
const JOB_TEMPLATES = {
  blank: {
    name: 'Start Blank',
    title: '',
    summary: '',
    requirements: [],
    duties: [],
    education: '',
    licenses: ''
  },
  nurse: {
    name: 'Registered Nurse',
    title: 'Registered Nurse (RN)',
    summary: 'Seeking an experienced Registered Nurse to provide high-quality patient care',
    requirements: [
      'Active RN license',
      'BSN or ADN from accredited nursing program',
      '2+ years clinical nursing experience',
      'BLS and ACLS certification',
      'Strong clinical assessment skills'
    ],
    duties: [
      'Provide direct patient care and treatment',
      'Administer medications and treatments as prescribed',
      'Monitor patient vital signs and condition',
      'Collaborate with interdisciplinary healthcare team',
      'Maintain accurate patient records and documentation'
    ],
    education: 'BSN or ADN required, BSN preferred',
    licenses: 'Active RN license, BLS, ACLS'
  },
  professor: {
    name: 'Assistant Professor',
    title: 'Assistant Professor',
    summary: 'Tenure-track faculty position in research and teaching',
    requirements: [
      'PhD in relevant field or ABD with completion expected',
      'Evidence of research potential and scholarly publications',
      'University-level teaching experience',
      'Strong communication and presentation skills',
      'Commitment to inclusive pedagogy'
    ],
    duties: [
      'Teach undergraduate and graduate courses',
      'Conduct original research and publish in peer-reviewed journals',
      'Advise and mentor students',
      'Participate in department and university service',
      'Seek external funding for research'
    ],
    education: 'PhD required',
    licenses: ''
  },
  engineer: {
    name: 'Software Engineer',
    title: 'Senior Software Engineer',
    summary: 'Seeking experienced software engineer to build scalable applications',
    requirements: [
      '5+ years software development experience',
      'Strong proficiency in modern programming languages',
      'Experience with cloud platforms (AWS, Azure, or GCP)',
      'Database design and optimization experience',
      'Excellent problem-solving skills'
    ],
    duties: [
      'Design, develop, and maintain software applications',
      'Write clean, testable, and well-documented code',
      'Collaborate with cross-functional teams',
      'Participate in code reviews and technical discussions',
      'Mentor junior developers'
    ],
    education: "Bachelor's degree in Computer Science or equivalent experience",
    licenses: ''
  }
}

export function JobInputPage() {
  const navigate = useNavigate()
  const [selectedTemplate, setSelectedTemplate] = useState('blank')
  const [jobData, setJobData] = useState(JOB_TEMPLATES.blank)
  const [requirementInput, setRequirementInput] = useState('')
  const [dutyInput, setDutyInput] = useState('')

  // Load existing evaluation if available
  useEffect(() => {
    const existing = sessionStore.getCurrentEvaluation()
    if (existing && existing.job.title) {
      setJobData(existing.job)
    }
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

  const handleNext = () => {
    // Validation
    if (!jobData.title.trim()) {
      alert('Please enter a job title')
      return
    }

    // Save to session storage
    sessionStore.updateEvaluation({ job: jobData })
    navigate('/upload-resumes')
  }

  const handleBack = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-primary-600 font-semibold">Step 1 of 3</span>
            <span className="text-gray-500">Job Description</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary-600 h-2 rounded-full" style={{ width: '33%' }}></div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Description</h1>
        <p className="text-gray-600 mb-8">
          Enter the job details or select a template to get started
        </p>

        {/* Template Selector */}
        <Card className="mb-6">
          <label className="label mb-3">Quick Start Template (Optional)</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(JOB_TEMPLATES).map(([key, template]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleTemplateChange(key)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedTemplate === key
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="font-semibold text-sm">{template.name}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Job Form */}
        <Card>
          <div className="space-y-6">
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
                  <div key={index} className="flex items-center justify-between bg-gray-50 border rounded-lg px-4 py-2">
                    <span className="text-sm text-gray-700">• {req}</span>
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-gray-400 hover:text-red-600 ml-2"
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
                  <div key={index} className="flex items-center justify-between bg-gray-50 border rounded-lg px-4 py-2">
                    <span className="text-sm text-gray-700">• {duty}</span>
                    <button
                      type="button"
                      onClick={() => removeDuty(index)}
                      className="text-gray-400 hover:text-red-600 ml-2"
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
