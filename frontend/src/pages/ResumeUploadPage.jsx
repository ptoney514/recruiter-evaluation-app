import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { sessionStore } from '../services/storage/sessionStore'

export function ResumeUploadPage() {
  const navigate = useNavigate()
  const [resumes, setResumes] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  // Load existing resumes if available
  useEffect(() => {
    const existing = sessionStore.getCurrentEvaluation()
    if (existing && existing.resumes) {
      setResumes(existing.resumes)
    }
  }, [])

  // Extract text from PDF using our API
  const extractTextFromPDF = async (file) => {
    const reader = new FileReader()

    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64Data = reader.result.split(',')[1]

          // Determine file type
          let fileType = 'pdf'
          if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
            fileType = 'docx'
          } else if (file.name.endsWith('.txt')) {
            fileType = 'txt'
          }

          const response = await fetch('http://localhost:8000/api/parse_resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file_data: base64Data,
              file_type: fileType
            })
          })

          if (!response.ok) {
            throw new Error('Failed to parse resume')
          }

          const result = await response.json()
          resolve(result.text)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  // Extract candidate name from filename
  // Oracle format: "FirstName_LastName_12345.pdf" or just "John_Doe.pdf"
  const extractCandidateName = (filename) => {
    // Remove extension
    const nameWithoutExt = filename.replace(/\.(pdf|docx|doc|txt)$/i, '')

    // Split by underscore and remove numeric IDs
    const parts = nameWithoutExt.split('_').filter(part => !/^\d+$/.test(part))

    // Join with space and capitalize
    return parts.map(part =>
      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    ).join(' ')
  }

  const handleFiles = async (fileList) => {
    setIsProcessing(true)
    setError(null)

    const newResumes = []

    try {
      for (const file of Array.from(fileList)) {
        // Validate file type
        const validTypes = ['.pdf', '.docx', '.doc', '.txt']
        const extension = '.' + file.name.split('.').pop().toLowerCase()

        if (!validTypes.includes(extension)) {
          console.warn(`Skipping ${file.name} - unsupported file type`)
          continue
        }

        // Extract text from file
        const text = await extractTextFromPDF(file)

        // Extract candidate name from filename
        const candidateName = extractCandidateName(file.name)

        newResumes.push({
          id: `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: candidateName,
          filename: file.name,
          text: text,
          uploadedAt: Date.now()
        })
      }

      // Add to existing resumes
      const updated = [...resumes, ...newResumes]
      setResumes(updated)

      // Save to session storage
      sessionStore.updateEvaluation({ resumes: updated })

    } catch (err) {
      console.error('Error processing files:', err)
      setError('Failed to process some files. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInput = (e) => {
    handleFiles(e.target.files)
  }

  const removeResume = (id) => {
    const updated = resumes.filter(r => r.id !== id)
    setResumes(updated)
    sessionStore.updateEvaluation({ resumes: updated })
  }

  const handleNext = () => {
    if (resumes.length === 0) {
      alert('Please upload at least one resume')
      return
    }
    navigate('/review')
  }

  const handleBack = () => {
    navigate('/job-input')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-primary-600 font-semibold">Step 2 of 3</span>
            <span className="text-gray-500">Upload Resumes</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary-600 h-2 rounded-full" style={{ width: '66%' }}></div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Resumes</h1>
        <p className="text-gray-600 mb-8">
          Upload 1-50 candidate resumes (PDF, DOCX, or TXT)
        </p>

        {/* Upload Area */}
        <Card className="mb-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-2">
              {isDragging ? 'Drop files here' : 'Drag & drop resume files here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <label htmlFor="file-upload">
              <Button
                type="button"
                variant="secondary"
                disabled={isProcessing}
                onClick={() => document.getElementById('file-upload').click()}
              >
                {isProcessing ? 'Processing...' : 'Choose Files'}
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileInput}
              className="hidden"
            />
            <p className="text-xs text-gray-400 mt-4">
              Supports PDF, DOCX, and TXT • Max 50 files
            </p>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}
        </Card>

        {/* Uploaded Resumes List */}
        {resumes.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Uploaded Resumes ({resumes.length})
              </h3>
              <div className="text-sm text-gray-500">
                {(resumes.reduce((sum, r) => sum + r.text.length, 0) / 1024).toFixed(1)} KB total
              </div>
            </div>

            <div className="space-y-2">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">{resume.name}</div>
                      <div className="text-sm text-gray-500 truncate">{resume.filename}</div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {(resume.text.length / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <button
                    onClick={() => removeResume(resume.id)}
                    className="ml-4 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="secondary" onClick={handleBack}>
            Back
          </Button>
          <Button onClick={handleNext} disabled={resumes.length === 0}>
            Next: Review & Evaluate
          </Button>
        </div>
      </div>
    </div>
  )
}
