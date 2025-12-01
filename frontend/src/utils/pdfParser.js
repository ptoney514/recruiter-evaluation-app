/**
 * Client-side document text extraction
 * Supports PDF (via PDF.js), DOCX (via mammoth.js), and OCR for scanned PDFs (via Tesseract.js)
 */
import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'
import Tesseract from 'tesseract.js'

// Set worker source - use jsdelivr CDN (more reliable than cloudflare)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

// Set PDF.js verbosity to ERRORS only (suppresses warnings like missing glyf tables)
pdfjsLib.GlobalWorkerOptions.verbosity = pdfjsLib.VerbosityLevel.ERRORS

/**
 * Render a PDF page to a canvas and return as image data URL
 * @param {Object} page - PDF.js page object
 * @param {number} scale - Scale factor for rendering (higher = better OCR quality)
 * @returns {Promise<string>} Image data URL
 */
async function renderPageToImage(page, scale = 2.0) {
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise

  return canvas.toDataURL('image/png')
}

/**
 * Perform OCR on a PDF page using Tesseract.js
 * @param {Object} page - PDF.js page object
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<string>} Extracted text from OCR
 */
async function ocrPage(page, onProgress = null) {
  const imageDataUrl = await renderPageToImage(page)

  const result = await Tesseract.recognize(
    imageDataUrl,
    'eng',
    {
      logger: (m) => {
        if (onProgress && m.status === 'recognizing text') {
          onProgress(m.progress)
        }
      }
    }
  )

  return result.data.text.trim()
}

/**
 * Extract text from a PDF file with OCR fallback for scanned documents
 * @param {File} file - PDF file object
 * @param {Function} onProgress - Optional progress callback ({ stage, current, total, message })
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromPDF(file, onProgress = null) {
  try {
    console.log('[PDF Parser] Starting PDF extraction for:', file.name)

    if (onProgress) {
      onProgress({ stage: 'loading', current: 0, total: 100, message: 'Loading PDF...' })
    }

    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise

    console.log('[PDF Parser] PDF loaded, pages:', pdf.numPages)

    // First, try standard text extraction
    if (onProgress) {
      onProgress({ stage: 'extracting', current: 0, total: pdf.numPages, message: 'Extracting text...' })
    }

    const pagePromises = []
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      pagePromises.push(
        pdf.getPage(pageNum).then(async (page) => {
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            .map(item => item.str)
            .join(' ')

          if (onProgress) {
            onProgress({ stage: 'extracting', current: pageNum, total: pdf.numPages, message: `Extracting page ${pageNum}/${pdf.numPages}...` })
          }

          return { pageNum, text: pageText.trim(), page }
        })
      )
    }

    const pageResults = await Promise.all(pagePromises)

    // Check if we got any text
    const textParts = pageResults.map(r => r.text).filter(text => text.length > 0)
    const standardText = textParts.join('\n\n')

    console.log('[PDF Parser] Standard extraction text length:', standardText.length)

    // If we got text, return it
    if (standardText.length > 50) {
      console.log('[PDF Parser] Using standard text extraction')
      return standardText
    }

    // Otherwise, fall back to OCR
    console.log('[PDF Parser] No text found, falling back to OCR...')

    if (onProgress) {
      onProgress({ stage: 'ocr', current: 0, total: pdf.numPages, message: 'Scanning document with OCR (this may take a moment)...' })
    }

    const ocrTexts = []
    for (let i = 0; i < pageResults.length; i++) {
      const { pageNum } = pageResults[i]

      if (onProgress) {
        onProgress({
          stage: 'ocr',
          current: i,
          total: pdf.numPages,
          message: `OCR scanning page ${pageNum}/${pdf.numPages}...`
        })
      }

      // Re-fetch the page for OCR (we need fresh reference)
      const freshPage = await pdf.getPage(pageNum)
      const ocrText = await ocrPage(freshPage, (progress) => {
        if (onProgress) {
          onProgress({
            stage: 'ocr',
            current: i + progress,
            total: pdf.numPages,
            message: `OCR scanning page ${pageNum}/${pdf.numPages} (${Math.round(progress * 100)}%)...`
          })
        }
      })

      if (ocrText) {
        ocrTexts.push(ocrText)
      }
    }

    const ocrResult = ocrTexts.join('\n\n')
    console.log('[PDF Parser] OCR extraction text length:', ocrResult.length)
    console.log('[PDF Parser] First 500 chars:', ocrResult.substring(0, 500))

    if (onProgress) {
      onProgress({ stage: 'complete', current: pdf.numPages, total: pdf.numPages, message: 'Complete!' })
    }

    return ocrResult

  } catch (error) {
    console.error('[PDF Parser] Error extracting PDF text:', error)
    throw new Error(`Failed to parse PDF: ${file.name} - ${error.message}`)
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
 * Extract text from DOCX file using mammoth.js
 * @param {File} file - DOCX file object
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromDOCX(file) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
  } catch (error) {
    console.error('Error extracting DOCX text:', error)
    throw new Error(`Failed to parse DOCX: ${file.name}`)
  }
}

/**
 * Extract text from any supported file type
 * @param {File} file - File object
 * @param {Function} onProgress - Optional progress callback for PDFs
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromFile(file, onProgress = null) {
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.pdf')) {
    return await extractTextFromPDF(file, onProgress)
  } else if (fileName.endsWith('.txt')) {
    return await extractTextFromTXT(file)
  } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    return await extractTextFromDOCX(file)
  } else {
    throw new Error(`Unsupported file type: ${file.name}`)
  }
}
