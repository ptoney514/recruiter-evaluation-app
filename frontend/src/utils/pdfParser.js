/**
 * Client-side PDF text extraction using PDF.js
 * Avoids sending large base64 files to server
 */
import * as pdfjsLib from 'pdfjs-dist'

// Set worker source - use jsdelivr CDN (more reliable than cloudflare)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

// Set PDF.js verbosity to ERRORS only (suppresses warnings like missing glyf tables)
// This is the proper way to configure PDF.js logging without global console override
pdfjsLib.GlobalWorkerOptions.verbosity = pdfjsLib.VerbosityLevel.ERRORS

/**
 * Extract text from a PDF file with parallel page processing
 * @param {File} file - PDF file object
 * @param {Function} onProgress - Optional progress callback (current, total)
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromPDF(file, onProgress = null) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    // Extract text from all pages in parallel for better performance
    const pagePromises = []
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      pagePromises.push(
        pdf.getPage(pageNum).then(async (page) => {
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            .map(item => item.str)
            .join(' ')

          // Report progress if callback provided
          if (onProgress) {
            onProgress(pageNum, pdf.numPages)
          }

          return pageText.trim() || ''
        })
      )
    }

    // Wait for all pages to complete
    const pages = await Promise.all(pagePromises)

    // Filter out empty pages and join
    const textParts = pages.filter(text => text.length > 0)
    return textParts.join('\n\n')

  } catch (error) {
    console.error('Error extracting PDF text:', error)
    throw new Error(`Failed to parse PDF: ${file.name}`)
  }
}

/**
 * Extract text from a TXT file
 * @param {File} file - Text file object
 * @returns {Promise<string>} File contents
 */
export async function extractTextFromTXT(file) {
  try {
    return await file.text()
  } catch (error) {
    console.error('Error reading text file:', error)
    throw new Error(`Failed to read file: ${file.name}`)
  }
}

/**
 * Extract text from DOCX file (placeholder - requires library)
 * For now, we'll show an error message
 */
export async function extractTextFromDOCX(file) {
  throw new Error('DOCX parsing not yet supported. Please convert to PDF or use PDF resumes.')
}

/**
 * Extract text from any supported file type
 * @param {File} file - File object
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromFile(file) {
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.pdf')) {
    return await extractTextFromPDF(file)
  } else if (fileName.endsWith('.txt')) {
    return await extractTextFromTXT(file)
  } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    return await extractTextFromDOCX(file)
  } else {
    throw new Error(`Unsupported file type: ${file.name}`)
  }
}
