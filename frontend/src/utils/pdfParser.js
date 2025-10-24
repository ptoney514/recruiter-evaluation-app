/**
 * Client-side PDF text extraction using PDF.js
 * Avoids sending large base64 files to server
 */
import * as pdfjsLib from 'pdfjs-dist'

// Set worker source - use jsdelivr CDN (more reliable than cloudflare)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

// Suppress non-critical PDF.js warnings (like missing glyf tables)
const originalConsoleWarn = console.warn
console.warn = function(...args) {
  // Filter out PDF.js font table warnings
  if (args[0]?.includes?.('glyf') || args[0]?.includes?.('table is not found')) {
    return
  }
  originalConsoleWarn.apply(console, args)
}

/**
 * Extract text from a PDF file
 * @param {File} file - PDF file object
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    const textParts = []

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()

      const pageText = textContent.items
        .map(item => item.str)
        .join(' ')

      if (pageText.trim()) {
        textParts.push(pageText)
      }
    }

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
