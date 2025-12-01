import { useState, useRef, useCallback } from 'react'
import { UploadCloud, X, FileText, AlertCircle, CheckCircle, Loader2, ScanLine } from 'lucide-react'
import { useBulkCreateCandidates } from '../../hooks/useCandidates'
import { extractTextFromFile } from '../../utils/pdfParser'
import { MAX_FILE_SIZE_MB, MAX_RESUMES_BATCH, SUPPORTED_FILE_TYPES } from '../../constants/config'

/**
 * Extract candidate name from filename
 * Handles formats like: "FirstName_LastName_12345.pdf" or "John_Doe.pdf"
 */
function extractCandidateName(filename) {
  const nameWithoutExt = filename.replace(/\.(pdf|docx|doc|txt)$/i, '')
  const parts = nameWithoutExt.split('_').filter(part => !/^\d+$/.test(part))
  return parts.map(part =>
    part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
  ).join(' ')
}

/**
 * ResumeUploadModal Component
 * Allows bulk upload of resume files with drag-drop and file picker
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 * @param {string} props.jobId - Job ID to associate candidates with
 * @param {Function} props.onSuccess - Callback when upload completes successfully
 */
export function ResumeUploadModal({ isOpen, onClose, jobId, onSuccess }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, stage: 'idle' })
  const [ocrProgress, setOcrProgress] = useState(null) // Detailed OCR progress for current file
  const [processedFiles, setProcessedFiles] = useState([])
  const [errors, setErrors] = useState([])
  const fileInputRef = useRef(null)

  const bulkCreateCandidates = useBulkCreateCandidates()

  const resetState = useCallback(() => {
    setIsDragging(false)
    setIsProcessing(false)
    setProgress({ current: 0, total: 0, stage: 'idle' })
    setOcrProgress(null)
    setProcessedFiles([])
    setErrors([])
  }, [])

  const handleClose = useCallback(() => {
    if (!isProcessing) {
      resetState()
      onClose()
    }
  }, [isProcessing, resetState, onClose])

  const processFiles = async (fileList) => {
    const filesArray = Array.from(fileList)

    // Validate batch size
    if (filesArray.length > MAX_RESUMES_BATCH) {
      setErrors([`Maximum ${MAX_RESUMES_BATCH} resumes per upload. You selected ${filesArray.length}.`])
      return
    }

    if (filesArray.length === 0) {
      return
    }

    setIsProcessing(true)
    setErrors([])
    setProcessedFiles([])
    setProgress({ current: 0, total: filesArray.length, stage: 'parsing' })

    const processed = []
    const fileErrors = []

    // Process files one by one
    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i]
      setProgress(prev => ({ ...prev, current: i + 1 }))

      try {
        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024)
        if (fileSizeMB > MAX_FILE_SIZE_MB) {
          fileErrors.push(`${file.name}: File too large (${fileSizeMB.toFixed(1)}MB, max ${MAX_FILE_SIZE_MB}MB)`)
          continue
        }

        // Validate file type
        const extension = '.' + file.name.split('.').pop().toLowerCase()
        if (!SUPPORTED_FILE_TYPES.includes(extension)) {
          fileErrors.push(`${file.name}: Unsupported file type. Supported: PDF, DOCX, TXT`)
          continue
        }

        // Extract text with progress callback for OCR
        setOcrProgress(null)
        const text = await extractTextFromFile(file, (progressInfo) => {
          // Update OCR progress for detailed feedback
          if (progressInfo.stage === 'ocr') {
            setOcrProgress(progressInfo)
          }
        })
        setOcrProgress(null)

        if (!text || text.trim().length === 0) {
          fileErrors.push(`${file.name}: No text extracted (may be scanned/image PDF)`)
          continue
        }

        // Extract candidate name from filename
        const candidateName = extractCandidateName(file.name)

        processed.push({
          name: candidateName,
          fullName: candidateName,
          resumeText: text,
          resumeFileName: file.name,
          evaluationStatus: 'pending'
        })

      } catch (error) {
        fileErrors.push(`${file.name}: ${error.message}`)
      }
    }

    setProcessedFiles(processed)
    setErrors(fileErrors)

    // If we have processed files, save to database
    if (processed.length > 0) {
      setProgress(prev => ({ ...prev, stage: 'saving', current: 0 }))

      try {
        await bulkCreateCandidates.mutateAsync({
          jobId,
          candidates: processed
        })

        setProgress(prev => ({ ...prev, stage: 'complete' }))

        // Call success callback after short delay to show completion
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(processed.length)
          }
          handleClose()
        }, 1500)

      } catch (error) {
        setErrors(prev => [...prev, `Failed to save candidates: ${error.message}`])
        setProgress(prev => ({ ...prev, stage: 'error' }))
        setIsProcessing(false)
      }
    } else {
      setProgress(prev => ({ ...prev, stage: 'error' }))
      setIsProcessing(false)
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    if (!isProcessing) {
      processFiles(e.dataTransfer.files)
    }
  }, [isProcessing])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    if (!isProcessing) {
      setIsDragging(true)
    }
  }, [isProcessing])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback((e) => {
    if (!isProcessing) {
      processFiles(e.target.files)
    }
    // Reset file input so same files can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [isProcessing])

  const handleChooseFiles = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  if (!isOpen) return null

  const progressPercentage = progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0

  const getProgressMessage = () => {
    // If OCR is in progress, show detailed OCR message
    if (ocrProgress) {
      return ocrProgress.message || 'Scanning document with OCR...'
    }

    switch (progress.stage) {
      case 'parsing':
        return `Processing file ${progress.current} of ${progress.total}...`
      case 'saving':
        return 'Saving candidates to database...'
      case 'complete':
        return `Successfully uploaded ${processedFiles.length} candidate${processedFiles.length !== 1 ? 's' : ''}!`
      case 'error':
        return 'Upload completed with errors'
      default:
        return ''
    }
  }

  const isOcrInProgress = ocrProgress !== null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Upload Resumes</h2>
            <p className="text-sm text-slate-500 mt-1">
              Upload up to {MAX_RESUMES_BATCH} PDF, DOCX, or TXT files
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isProcessing && progress.stage !== 'complete'}
            className="text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-all
              ${isDragging
                ? 'border-teal-500 bg-teal-50'
                : 'border-slate-300 hover:border-slate-400'
              }
              ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
            `}
            onClick={!isProcessing ? handleChooseFiles : undefined}
          >
            <div className="flex justify-center mb-4">
              <div className={`p-3 rounded-full ${isDragging ? 'bg-teal-100' : 'bg-slate-100'}`}>
                <UploadCloud
                  size={32}
                  className={isDragging ? 'text-teal-600' : 'text-slate-400'}
                />
              </div>
            </div>

            <p className="text-lg font-semibold text-slate-700 mb-2">
              {isDragging ? 'Drop files here' : 'Drag & drop resume files'}
            </p>
            <p className="text-sm text-slate-500 mb-4">or</p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleChooseFiles()
              }}
              disabled={isProcessing}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Choose Files
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.docx,.doc"
              onChange={handleFileInput}
              className="hidden"
            />

            <p className="text-xs text-slate-400 mt-4">
              Supports PDF, DOCX, and TXT files up to {MAX_FILE_SIZE_MB}MB each
            </p>
          </div>

          {/* Progress Section */}
          {isProcessing && (
            <div className="mt-6">
              {/* OCR Scanning Animation */}
              {isOcrInProgress && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                  <div className="relative">
                    <ScanLine size={24} className="text-amber-600 animate-pulse" />
                    <Loader2 size={16} className="text-amber-500 animate-spin absolute -top-1 -right-1" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800">Scanning Document with OCR</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      This file appears to be scanned. Using optical character recognition...
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  {(progress.stage === 'parsing' || progress.stage === 'saving') && !isOcrInProgress && (
                    <Loader2 size={16} className="text-teal-500 animate-spin" />
                  )}
                  <span className="text-slate-600 font-medium">{getProgressMessage()}</span>
                </div>
                {progress.stage === 'parsing' && !isOcrInProgress && (
                  <span className="text-slate-500">{progressPercentage}%</span>
                )}
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress.stage === 'complete'
                      ? 'bg-emerald-500'
                      : progress.stage === 'error'
                      ? 'bg-rose-500'
                      : isOcrInProgress
                      ? 'bg-amber-500'
                      : 'bg-teal-500'
                  } ${isOcrInProgress ? 'animate-pulse' : ''}`}
                  style={{
                    width: progress.stage === 'saving' || progress.stage === 'complete'
                      ? '100%'
                      : isOcrInProgress
                      ? '50%'
                      : `${progressPercentage}%`
                  }}
                />
              </div>

              {/* Success indicator */}
              {progress.stage === 'complete' && (
                <div className="flex items-center gap-2 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle size={20} className="text-emerald-600" />
                  <span className="text-sm text-emerald-700 font-medium">
                    {processedFiles.length} candidate{processedFiles.length !== 1 ? 's' : ''} uploaded successfully
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Processed Files Preview */}
          {processedFiles.length > 0 && progress.stage !== 'complete' && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Processed ({processedFiles.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {processedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <FileText size={18} className="text-teal-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {file.resumeFileName}
                      </p>
                    </div>
                    <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mt-6">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-rose-800 mb-2">
                      {errors.length} error{errors.length !== 1 ? 's' : ''} occurred
                    </h4>
                    <ul className="text-sm text-rose-700 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index} className="break-words">{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
          <button
            onClick={handleClose}
            disabled={isProcessing && progress.stage !== 'complete' && progress.stage !== 'error'}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {progress.stage === 'complete' || progress.stage === 'error' ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}
