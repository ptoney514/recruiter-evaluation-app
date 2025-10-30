import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { storageManager } from '../services/storage/storageManager'
import { sessionStore } from '../services/storage/sessionStore'
import { extractTextFromFile } from '../utils/pdfParser'
import { MAX_FILE_SIZE_MB, MAX_RESUMES_BATCH, SUPPORTED_FILE_TYPES } from '../constants/config'

export function ResumeUploadPage() {
  const navigate = useNavigate()
  const [resumes, setResumes] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState(null)
  const [expandedResumeId, setExpandedResumeId] = useState(null)

  // Load existing resumes if available
  useEffect(() => {
    async function loadExisting() {
      const existing = await storageManager.getCurrentEvaluation()
      if (existing && existing.resumes) {
        setResumes(existing.resumes)
      }
    }
    loadExisting()
  }, [])

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
    const filesArray = Array.from(fileList)

    // Validate batch size
    if (resumes.length + filesArray.length > MAX_RESUMES_BATCH) {
      setError(`Maximum ${MAX_RESUMES_BATCH} resumes per batch. You currently have ${resumes.length} and tried to add ${filesArray.length}.`)
      return
    }

    setIsProcessing(true)
    setError(null)
    setProcessingProgress({ current: 0, total: filesArray.length })

    const newResumes = []
    const errors = []

    try {
      // Process files in parallel for better performance
      const processFile = async (file, index) => {
        try {
          // Validate file size
          const fileSizeMB = file.size / (1024 * 1024)
          if (fileSizeMB > MAX_FILE_SIZE_MB) {
            errors.push(`${file.name}: File too large (${fileSizeMB.toFixed(1)}MB, max ${MAX_FILE_SIZE_MB}MB)`)
            return null
          }

          // Validate file type
          const extension = '.' + file.name.split('.').pop().toLowerCase()
          if (!SUPPORTED_FILE_TYPES.includes(extension)) {
            errors.push(`${file.name}: Unsupported file type (PDF and TXT only)`)
            return null
          }

          // Extract text from file using client-side parser
          const text = await extractTextFromFile(file)

          // Validate we got text
          if (!text || text.trim().length === 0) {
            errors.push(`${file.name}: No text extracted (may be scanned/image PDF)`)
            return null
          }

          // Check storage capacity before adding
          const textSizeKB = text.length / 1024
          if (!sessionStore.canAddMoreData(textSizeKB)) {
            errors.push(`${file.name}: Storage limit reached. Try evaluating current batch first.`)
            return null
          }

          // Extract candidate name from filename
          const candidateName = extractCandidateName(file.name)

          // Update progress
          setProcessingProgress(prev => ({ ...prev, current: prev.current + 1 }))

          return {
            id: `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: candidateName,
            filename: file.name,
            text: text,
            uploadedAt: Date.now(),
            fileSizeMB: fileSizeMB.toFixed(2)
          }
        } catch (fileError) {
          errors.push(`${file.name}: ${fileError.message}`)
          setProcessingProgress(prev => ({ ...prev, current: prev.current + 1 }))
          return null
        }
      }

      // Process all files in parallel
      const results = await Promise.all(filesArray.map(processFile))

      // Filter out nulls (failed files)
      const successfulResumes = results.filter(r => r !== null)
      newResumes.push(...successfulResumes)

      // Add to existing resumes
      const updated = [...resumes, ...newResumes]
      setResumes(updated)

      // Save to storage (auto-routes to session or database)
      await storageManager.updateEvaluation({ resumes: updated })

      // Show errors if any
      if (errors.length > 0) {
        setError(`${newResumes.length} of ${filesArray.length} files uploaded successfully. Errors:\n${errors.join('\n')}`)
      }

    } catch (err) {
      console.error('Error processing files:', err)
      setError('Failed to process files. Please try again.')
    } finally {
      setIsProcessing(false)
      setProcessingProgress({ current: 0, total: 0 })
    }
  }

  const clearAllResumes = async () => {
    if (window.confirm('Remove all uploaded resumes?')) {
      setResumes([])
      await storageManager.updateEvaluation({ resumes: [] })
    }
  }

  const togglePreview = (resumeId) => {
    setExpandedResumeId(expandedResumeId === resumeId ? null : resumeId)
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

  const removeResume = async (id) => {
    const updated = resumes.filter(r => r.id !== id)
    setResumes(updated)
    await storageManager.updateEvaluation({ resumes: updated })
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
          Upload 1-50 candidate resumes (PDF or TXT)
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
                {isProcessing ? `Processing ${processingProgress.current}/${processingProgress.total}...` : 'Choose Files'}
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".pdf,.txt"
              onChange={handleFileInput}
              className="hidden"
            />
            <p className="text-xs text-gray-400 mt-4">
              Supports PDF and TXT • Max 50 files • DOCX coming soon
            </p>
          </div>

          {isProcessing && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Processing files...</span>
                <span>{processingProgress.current} of {processingProgress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${(processingProgress.current / processingProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 whitespace-pre-line">
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
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">
                  {(resumes.reduce((sum, r) => sum + r.text.length, 0) / 1024).toFixed(1)} KB total
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={clearAllResumes}
                >
                  Clear All
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {resumes.map((resume) => (
                <div key={resume.id}>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => togglePreview(resume.id)}
                        className="text-gray-400 hover:text-primary-600 transition-colors"
                        title="Preview text"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeResume(resume.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove resume"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Text Preview (expandable) */}
                  {expandedResumeId === resume.id && (
                    <div className="mt-2 p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Resume Text Preview</span>
                        <span className="text-xs text-gray-500">{resume.text.length} characters</span>
                      </div>
                      <div className="text-sm text-gray-600 max-h-64 overflow-y-auto whitespace-pre-wrap font-mono text-xs bg-gray-50 p-3 rounded">
                        {resume.text.substring(0, 1000)}{resume.text.length > 1000 && '...\n\n[Truncated - showing first 1000 characters]'}
                      </div>
                    </div>
                  )}
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
