/**
 * Service for parsing job description files via API
 * Supports PDF, DOCX, and TXT files
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Parse a job description file and extract structured data
 * @param {File} file - The job description file (PDF, DOCX, or TXT)
 * @returns {Promise<Object>} Parsed job data
 */
export async function parseJobFile(file) {
  // Validate file type
  const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain']
  const validExtensions = ['.pdf', '.docx', '.doc', '.txt']

  const fileExtension = '.' + file.name.split('.').pop().toLowerCase()

  if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
    throw new Error('Invalid file type. Please upload a PDF, DOCX, or TXT file.')
  }

  // Read file as base64
  const fileData = await fileToBase64(file)

  // Determine file type
  let fileType = 'pdf'
  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword' ||
      fileExtension === '.docx' || fileExtension === '.doc') {
    fileType = 'docx'
  } else if (file.type === 'text/plain' || fileExtension === '.txt') {
    fileType = 'txt'
  }

  // Call API
  const response = await fetch(`${API_BASE_URL}/api/parse_job`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_data: fileData,
      file_type: fileType
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to parse job file')
  }

  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'Failed to parse job file')
  }

  return result.job_data
}

/**
 * Convert File to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} Base64 encoded file data (without data URL prefix)
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

export const jobParserService = {
  parseJobFile
}
