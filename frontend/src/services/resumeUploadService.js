/**
 * Resume Upload Service
 * Handles file validation and text extraction for resume uploads
 */
import { extractTextFromFile } from '../utils/pdfParser'
import { MAX_FILE_SIZE_MB, SUPPORTED_FILE_TYPES } from '../constants/config'

/**
 * Validation error class
 */
export class ResumeValidationError extends Error {
  constructor(message, code, fileName) {
    super(message)
    this.name = 'ResumeValidationError'
    this.code = code
    this.fileName = fileName
  }
}

/**
 * Validation codes for different error types
 */
export const ValidationCodes = {
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_TYPE: 'UNSUPPORTED_TYPE',
  NO_TEXT_EXTRACTED: 'NO_TEXT_EXTRACTED',
  BATCH_LIMIT_EXCEEDED: 'BATCH_LIMIT_EXCEEDED',
  INVALID_FILE: 'INVALID_FILE'
}

/**
 * Extract candidate name from filename
 * Handles formats like: "FirstName_LastName_12345.pdf" or "John_Doe.pdf"
 * @param {string} filename - File name
 * @returns {string} Formatted candidate name
 */
export function extractCandidateName(filename) {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.(pdf|docx|doc|txt)$/i, '')

  // Split by underscore and remove numeric IDs
  const parts = nameWithoutExt.split('_').filter(part => !/^\d+$/.test(part))

  // Join with space and capitalize
  return parts.map(part =>
    part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
  ).join(' ')
}

/**
 * Validate a single file
 * @param {File} file - File object to validate
 * @throws {ResumeValidationError} If validation fails
 */
export function validateFile(file) {
  if (!file || !(file instanceof File)) {
    throw new ResumeValidationError(
      'Invalid file object',
      ValidationCodes.INVALID_FILE,
      file?.name || 'unknown'
    )
  }

  // Validate file size
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    throw new ResumeValidationError(
      `File too large (${fileSizeMB.toFixed(1)}MB, max ${MAX_FILE_SIZE_MB}MB)`,
      ValidationCodes.FILE_TOO_LARGE,
      file.name
    )
  }

  // Validate file type
  const extension = '.' + file.name.split('.').pop().toLowerCase()
  if (!SUPPORTED_FILE_TYPES.includes(extension)) {
    throw new ResumeValidationError(
      `Unsupported file type (${extension})`,
      ValidationCodes.UNSUPPORTED_TYPE,
      file.name
    )
  }
}

/**
 * Process a single resume file
 * @param {File} file - Resume file to process
 * @param {Object} options - Processing options
 * @param {Function} options.onProgress - Progress callback
 * @returns {Promise<Object>} Processed resume data
 * @throws {ResumeValidationError} If validation or processing fails
 */
export async function processResumeFile(file, options = {}) {
  const { onProgress } = options

  // Validate file
  validateFile(file)

  try {
    // Extract text from file
    const text = await extractTextFromFile(file)

    // Validate we got text
    if (!text || text.trim().length === 0) {
      throw new ResumeValidationError(
        'No text extracted (may be scanned/image PDF)',
        ValidationCodes.NO_TEXT_EXTRACTED,
        file.name
      )
    }

    // Extract candidate name from filename
    const candidateName = extractCandidateName(file.name)

    // Calculate file size
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)

    // Report progress
    if (onProgress) {
      onProgress({ file: file.name, status: 'completed' })
    }

    return {
      id: `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: candidateName,
      filename: file.name,
      text: text,
      uploadedAt: Date.now(),
      fileSizeMB: parseFloat(fileSizeMB),
      fileSize: file.size
    }
  } catch (error) {
    // Re-throw validation errors
    if (error instanceof ResumeValidationError) {
      throw error
    }

    // Wrap other errors
    throw new ResumeValidationError(
      error.message || 'Failed to process file',
      ValidationCodes.INVALID_FILE,
      file.name
    )
  }
}

/**
 * Process multiple resume files in parallel
 * @param {FileList|File[]} files - Files to process
 * @param {Object} options - Processing options
 * @param {number} options.maxFiles - Maximum files allowed
 * @param {Function} options.onProgress - Progress callback (current, total)
 * @param {Function} options.onFileComplete - Individual file completion callback
 * @returns {Promise<Object>} Results with successful resumes and errors
 */
export async function processResumeFiles(files, options = {}) {
  const {
    maxFiles = 50,
    onProgress,
    onFileComplete
  } = options

  const filesArray = Array.from(files)

  // Validate batch size
  if (filesArray.length > maxFiles) {
    throw new ResumeValidationError(
      `Too many files (${filesArray.length}, max ${maxFiles})`,
      ValidationCodes.BATCH_LIMIT_EXCEEDED,
      'batch'
    )
  }

  const results = {
    successful: [],
    errors: []
  }

  // Process files in parallel
  const processFile = async (file, index) => {
    try {
      const resume = await processResumeFile(file, {
        onProgress: onFileComplete
      })

      results.successful.push(resume)

      // Update overall progress
      if (onProgress) {
        onProgress(index + 1, filesArray.length)
      }

      return resume
    } catch (error) {
      const errorInfo = {
        filename: file.name,
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      }

      results.errors.push(errorInfo)

      // Update overall progress even for errors
      if (onProgress) {
        onProgress(index + 1, filesArray.length)
      }

      return null
    }
  }

  // Process all files in parallel
  await Promise.all(filesArray.map(processFile))

  return results
}

export const resumeUploadService = {
  extractCandidateName,
  validateFile,
  processResumeFile,
  processResumeFiles
}
