/**
 * File Type Upload Tests
 * Tests that PDF, DOCX, and TXT files can be uploaded and text extracted correctly
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { extractTextFromFile, extractTextFromPDF, extractTextFromTXT, extractTextFromDOCX } from '../utils/pdfParser'
import { validateFile, extractCandidateName } from '../services/resumeUploadService'
import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZE_MB } from '../constants/config'

// Mock pdfjs-dist
vi.mock('pdfjs-dist', () => ({
  version: '4.0.0',
  GlobalWorkerOptions: { workerSrc: '', verbosity: 0 },
  VerbosityLevel: { ERRORS: 0 },
  getDocument: vi.fn()
}))

// Mock mammoth
vi.mock('mammoth', () => ({
  default: {
    extractRawText: vi.fn()
  }
}))

import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'

// Helper to create mock files with proper methods for Node.js environment
function createMockFile(name, content, type = 'application/pdf', size = null) {
  const blob = new Blob([content], { type })
  const file = {
    name,
    type,
    size: size !== null ? size : blob.size,
    lastModified: Date.now(),
    // Mock the File API methods
    text: async () => content,
    arrayBuffer: async () => {
      const encoder = new TextEncoder()
      return encoder.encode(content).buffer
    },
    slice: (start, end, contentType) => blob.slice(start, end, contentType)
  }
  // Make it pass instanceof File checks (loosely)
  Object.setPrototypeOf(file, File.prototype)
  return file
}

describe('Supported File Types Configuration', () => {
  it('supports PDF files', () => {
    expect(SUPPORTED_FILE_TYPES).toContain('.pdf')
  })

  it('supports DOCX files', () => {
    expect(SUPPORTED_FILE_TYPES).toContain('.docx')
  })

  it('supports DOC files', () => {
    expect(SUPPORTED_FILE_TYPES).toContain('.doc')
  })

  it('supports TXT files', () => {
    expect(SUPPORTED_FILE_TYPES).toContain('.txt')
  })

  it('does not support XLSX files', () => {
    expect(SUPPORTED_FILE_TYPES).not.toContain('.xlsx')
  })

  it('does not support image files', () => {
    expect(SUPPORTED_FILE_TYPES).not.toContain('.png')
    expect(SUPPORTED_FILE_TYPES).not.toContain('.jpg')
    expect(SUPPORTED_FILE_TYPES).not.toContain('.jpeg')
  })
})

describe('File Validation', () => {
  describe('validateFile', () => {
    it('accepts valid PDF file', () => {
      const file = createMockFile('resume.pdf', 'content', 'application/pdf')
      expect(() => validateFile(file)).not.toThrow()
    })

    it('accepts valid DOCX file', () => {
      const file = createMockFile('resume.docx', 'content', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      expect(() => validateFile(file)).not.toThrow()
    })

    it('accepts valid DOC file', () => {
      const file = createMockFile('resume.doc', 'content', 'application/msword')
      expect(() => validateFile(file)).not.toThrow()
    })

    it('accepts valid TXT file', () => {
      const file = createMockFile('resume.txt', 'content', 'text/plain')
      expect(() => validateFile(file)).not.toThrow()
    })

    it('rejects XLSX file', () => {
      const file = createMockFile('spreadsheet.xlsx', 'content', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      expect(() => validateFile(file)).toThrow(/Unsupported file type/)
    })

    it('rejects PNG file', () => {
      const file = createMockFile('image.png', 'content', 'image/png')
      expect(() => validateFile(file)).toThrow(/Unsupported file type/)
    })

    it('rejects files over size limit', () => {
      const oversizedFile = createMockFile('large.pdf', 'x', 'application/pdf', (MAX_FILE_SIZE_MB + 1) * 1024 * 1024)
      expect(() => validateFile(oversizedFile)).toThrow(/File too large/)
    })

    it('accepts files at exactly the size limit', () => {
      const maxSizeFile = createMockFile('exact.pdf', 'x', 'application/pdf', MAX_FILE_SIZE_MB * 1024 * 1024)
      expect(() => validateFile(maxSizeFile)).not.toThrow()
    })
  })
})

describe('Candidate Name Extraction', () => {
  it('extracts name from underscore-separated filename', () => {
    expect(extractCandidateName('John_Doe.pdf')).toBe('John Doe')
  })

  it('extracts name from filename with ID suffix', () => {
    expect(extractCandidateName('Jane_Smith_12345.pdf')).toBe('Jane Smith')
  })

  it('handles DOCX extension', () => {
    expect(extractCandidateName('Bob_Wilson.docx')).toBe('Bob Wilson')
  })

  it('handles DOC extension', () => {
    expect(extractCandidateName('Alice_Johnson.doc')).toBe('Alice Johnson')
  })

  it('handles TXT extension', () => {
    expect(extractCandidateName('Test_Candidate.txt')).toBe('Test Candidate')
  })

  it('capitalizes each part correctly', () => {
    expect(extractCandidateName('mary_jane_watson.pdf')).toBe('Mary Jane Watson')
  })
})

describe('Text Extraction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('extractTextFromTXT', () => {
    it('extracts text from TXT file', async () => {
      const content = 'This is my resume.\nI have 5 years of experience.'
      const file = createMockFile('resume.txt', content, 'text/plain')

      const result = await extractTextFromTXT(file)
      expect(result).toBe(content)
    })

    it('handles empty TXT file', async () => {
      const file = createMockFile('empty.txt', '', 'text/plain')

      const result = await extractTextFromTXT(file)
      expect(result).toBe('')
    })
  })

  describe('extractTextFromDOCX', () => {
    it('extracts text from DOCX file using mammoth', async () => {
      const expectedText = 'DOCX resume content with formatting removed'
      mammoth.extractRawText.mockResolvedValue({ value: expectedText })

      const file = createMockFile('resume.docx', 'binary content', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

      const result = await extractTextFromDOCX(file)

      expect(mammoth.extractRawText).toHaveBeenCalled()
      expect(result).toBe(expectedText)
    })

    it('handles mammoth extraction failure', async () => {
      mammoth.extractRawText.mockRejectedValue(new Error('Invalid DOCX'))

      const file = createMockFile('corrupted.docx', 'bad content', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

      await expect(extractTextFromDOCX(file)).rejects.toThrow(/Failed to parse DOCX/)
    })
  })

  describe('extractTextFromPDF', () => {
    it('extracts text from PDF file using pdfjs', async () => {
      // Note: Text must be >50 chars to avoid OCR fallback
      const mockTextContent = {
        items: [
          { str: 'John Doe - Software Engineer with 5 years of professional experience in web development and cloud architecture' }
        ]
      }

      const mockPage = {
        getTextContent: vi.fn().mockResolvedValue(mockTextContent)
      }

      const mockPdf = {
        numPages: 1,
        getPage: vi.fn().mockResolvedValue(mockPage)
      }

      pdfjsLib.getDocument.mockReturnValue({
        promise: Promise.resolve(mockPdf)
      })

      const file = createMockFile('resume.pdf', 'binary pdf content', 'application/pdf')

      const result = await extractTextFromPDF(file)

      expect(pdfjsLib.getDocument).toHaveBeenCalled()
      expect(result).toContain('John Doe')
      expect(result).toContain('Software Engineer')
    })

    it('handles multi-page PDF', async () => {
      // Note: Text must be >50 chars to avoid OCR fallback
      const page1Content = { items: [{ str: 'Page 1 content with enough text to exceed fifty characters for testing purposes' }] }
      const page2Content = { items: [{ str: 'Page 2 content with additional resume information and work history details' }] }

      const mockPage1 = { getTextContent: vi.fn().mockResolvedValue(page1Content) }
      const mockPage2 = { getTextContent: vi.fn().mockResolvedValue(page2Content) }

      const mockPdf = {
        numPages: 2,
        getPage: vi.fn()
          .mockResolvedValueOnce(mockPage1)
          .mockResolvedValueOnce(mockPage2)
      }

      pdfjsLib.getDocument.mockReturnValue({
        promise: Promise.resolve(mockPdf)
      })

      const file = createMockFile('multipage.pdf', 'binary', 'application/pdf')

      const result = await extractTextFromPDF(file)

      expect(mockPdf.getPage).toHaveBeenCalledTimes(2)
      expect(result).toContain('Page 1 content')
      expect(result).toContain('Page 2 content')
    })

    it('handles PDF parsing failure', async () => {
      pdfjsLib.getDocument.mockReturnValue({
        promise: Promise.reject(new Error('Invalid PDF'))
      })

      const file = createMockFile('corrupted.pdf', 'bad content', 'application/pdf')

      await expect(extractTextFromPDF(file)).rejects.toThrow(/Failed to parse PDF/)
    })
  })

  describe('extractTextFromFile (router)', () => {
    beforeEach(() => {
      // Reset mocks for router tests
      // Note: Text must be >50 chars to avoid OCR fallback
      mammoth.extractRawText.mockResolvedValue({ value: 'This is extracted DOCX content with enough text to pass the validation threshold' })

      const mockPage = {
        getTextContent: vi.fn().mockResolvedValue({ items: [{ str: 'This is extracted PDF content with enough text to avoid triggering the OCR fallback' }] })
      }
      pdfjsLib.getDocument.mockReturnValue({
        promise: Promise.resolve({ numPages: 1, getPage: vi.fn().mockResolvedValue(mockPage) })
      })
    })

    it('routes PDF files to PDF parser', async () => {
      const file = createMockFile('resume.pdf', 'content', 'application/pdf')

      const result = await extractTextFromFile(file)

      expect(pdfjsLib.getDocument).toHaveBeenCalled()
      expect(result).toContain('PDF content')
    })

    it('routes DOCX files to mammoth parser', async () => {
      const file = createMockFile('resume.docx', 'content', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

      const result = await extractTextFromFile(file)

      expect(mammoth.extractRawText).toHaveBeenCalled()
      expect(result).toContain('DOCX content')
    })

    it('routes DOC files to mammoth parser', async () => {
      const file = createMockFile('resume.doc', 'content', 'application/msword')

      const result = await extractTextFromFile(file)

      expect(mammoth.extractRawText).toHaveBeenCalled()
      expect(result).toContain('DOCX content')
    })

    it('routes TXT files to text reader', async () => {
      const content = 'Plain text resume'
      const file = createMockFile('resume.txt', content, 'text/plain')

      const result = await extractTextFromFile(file)

      expect(result).toBe(content)
    })

    it('throws error for unsupported file types', async () => {
      const file = createMockFile('image.png', 'content', 'image/png')

      await expect(extractTextFromFile(file)).rejects.toThrow(/Unsupported file type/)
    })

    it('handles case-insensitive extensions', async () => {
      const file = createMockFile('resume.PDF', 'content', 'application/pdf')

      const result = await extractTextFromFile(file)

      expect(pdfjsLib.getDocument).toHaveBeenCalled()
    })
  })
})

describe('End-to-End File Processing Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Note: Text must be >50 chars to avoid OCR fallback
    mammoth.extractRawText.mockResolvedValue({ value: 'Extracted DOCX content with sufficient text length to pass the fifty character threshold' })

    const mockPage = {
      getTextContent: vi.fn().mockResolvedValue({ items: [{ str: 'Extracted PDF content with sufficient text length to pass the fifty character threshold' }] })
    }
    pdfjsLib.getDocument.mockReturnValue({
      promise: Promise.resolve({ numPages: 1, getPage: vi.fn().mockResolvedValue(mockPage) })
    })
  })

  it('processes a typical PDF resume', async () => {
    const file = createMockFile('John_Doe_Resume.pdf', 'binary', 'application/pdf')

    // Validate file type
    expect(() => validateFile(file)).not.toThrow()

    // Extract candidate name
    const name = extractCandidateName(file.name)
    expect(name).toBe('John Doe Resume')

    // Extract text
    const text = await extractTextFromFile(file)
    expect(text).toBeTruthy()
  })

  it('processes a typical DOCX resume', async () => {
    const file = createMockFile('Jane_Smith.docx', 'binary', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

    // Validate file type
    expect(() => validateFile(file)).not.toThrow()

    // Extract candidate name
    const name = extractCandidateName(file.name)
    expect(name).toBe('Jane Smith')

    // Extract text
    const text = await extractTextFromFile(file)
    expect(text).toContain('Extracted DOCX content')
  })

  it('processes a typical TXT resume', async () => {
    const content = `
      RESUME
      Name: Bob Wilson
      Experience: 10 years in software development
      Skills: JavaScript, Python, React
    `
    const file = createMockFile('Bob_Wilson.txt', content, 'text/plain')

    // Validate file type
    expect(() => validateFile(file)).not.toThrow()

    // Extract candidate name
    const name = extractCandidateName(file.name)
    expect(name).toBe('Bob Wilson')

    // Extract text
    const text = await extractTextFromFile(file)
    expect(text).toContain('Bob Wilson')
    expect(text).toContain('software development')
  })

  it('handles batch of mixed file types', async () => {
    const files = [
      createMockFile('Candidate_1.pdf', 'binary', 'application/pdf'),
      createMockFile('Candidate_2.docx', 'binary', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
      createMockFile('Candidate_3.txt', 'Plain text resume', 'text/plain'),
      createMockFile('Candidate_4.doc', 'binary', 'application/msword')
    ]

    // All files should pass validation
    for (const file of files) {
      expect(() => validateFile(file)).not.toThrow()
    }

    // All files should have text extracted
    for (const file of files) {
      const text = await extractTextFromFile(file)
      expect(text).toBeTruthy()
    }
  })
})
