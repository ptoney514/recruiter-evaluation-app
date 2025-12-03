import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock dependencies BEFORE imports to prevent actual module loading
vi.mock('../../utils/pdfParser', () => ({
  extractTextFromFile: vi.fn(),
  extractTextFromPDF: vi.fn(),
  extractTextFromTXT: vi.fn(),
  extractTextFromDOCX: vi.fn()
}))

import {
  extractCandidateName,
  validateFile,
  processResumeFile,
  processResumeFiles,
  ResumeValidationError,
  ValidationCodes
} from '../resumeUploadService'
import * as pdfParser from '../../utils/pdfParser'

describe('Resume Upload Service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('extractCandidateName', () => {
    it('should extract name from filename with underscores', () => {
      const result = extractCandidateName('john_doe.pdf')
      expect(result).toBe('John Doe')
    })

    it('should handle Oracle format with ID', () => {
      const result = extractCandidateName('Jane_Smith_12345.pdf')
      expect(result).toBe('Jane Smith')
    })

    it('should handle multiple underscores', () => {
      const result = extractCandidateName('john_middle_doe.pdf')
      expect(result).toBe('John Middle Doe')
    })

    it('should handle single name', () => {
      const result = extractCandidateName('johndoe.pdf')
      expect(result).toBe('Johndoe')
    })

    it('should handle docx extension', () => {
      const result = extractCandidateName('john_doe.docx')
      expect(result).toBe('John Doe')
    })

    it('should handle txt extension', () => {
      const result = extractCandidateName('john_doe.txt')
      expect(result).toBe('John Doe')
    })
  })

  describe('validateFile', () => {
    it('should pass validation for valid PDF', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      expect(() => validateFile(file)).not.toThrow()
    })

    it('should pass validation for valid DOCX', () => {
      const file = new File(['content'], 'test.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })
      expect(() => validateFile(file)).not.toThrow()
    })

    it('should throw for unsupported file type', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      expect(() => validateFile(file)).toThrow(ResumeValidationError)
      expect(() => validateFile(file)).toThrow(/unsupported file type/i)
    })

    it('should throw for file too large', () => {
      // Create a file larger than MAX_FILE_SIZE_MB (10MB)
      const largeContent = new Uint8Array(11 * 1024 * 1024)
      const file = new File([largeContent], 'large.pdf', { type: 'application/pdf' })
      expect(() => validateFile(file)).toThrow(ResumeValidationError)
      expect(() => validateFile(file)).toThrow(/file too large/i)
    })

    it('should throw for null file', () => {
      expect(() => validateFile(null)).toThrow(ResumeValidationError)
      expect(() => validateFile(null)).toThrow(/invalid file object/i)
    })
  })

  describe('processResumeFile', () => {
    it('should process valid PDF file', async () => {
      const file = new File(['content'], 'john_doe.pdf', { type: 'application/pdf' })
      pdfParser.extractTextFromFile.mockResolvedValue('Resume text content')

      const result = await processResumeFile(file)

      expect(result).toMatchObject({
        name: 'John Doe',
        filename: 'john_doe.pdf',
        text: 'Resume text content'
      })
      expect(result.id).toMatch(/^resume_/)
    })

    it('should throw when no text extracted', async () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      pdfParser.extractTextFromFile.mockResolvedValue('')

      await expect(processResumeFile(file)).rejects.toThrow(ResumeValidationError)
      await expect(processResumeFile(file)).rejects.toThrow(/no text extracted/i)
    })

    it('should call progress callback on success', async () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      pdfParser.extractTextFromFile.mockResolvedValue('Resume text')
      const onProgress = vi.fn()

      await processResumeFile(file, { onProgress })

      expect(onProgress).toHaveBeenCalledWith({ file: 'test.pdf', status: 'completed' })
    })
  })

  describe('processResumeFiles', () => {
    it('should process multiple files', async () => {
      const files = [
        new File(['content'], 'john_doe.pdf', { type: 'application/pdf' }),
        new File(['content'], 'jane_smith.pdf', { type: 'application/pdf' })
      ]
      pdfParser.extractTextFromFile.mockResolvedValue('Resume text')

      const results = await processResumeFiles(files)

      expect(results.successful).toHaveLength(2)
      expect(results.errors).toHaveLength(0)
    })

    it('should throw for too many files', async () => {
      const files = Array(51).fill(null).map((_, i) =>
        new File(['content'], `file${i}.pdf`, { type: 'application/pdf' })
      )

      await expect(processResumeFiles(files)).rejects.toThrow(ResumeValidationError)
      await expect(processResumeFiles(files)).rejects.toThrow(/too many files/i)
    })

    it('should collect errors for failed files', async () => {
      const files = [
        new File(['content'], 'good.pdf', { type: 'application/pdf' }),
        new File(['content'], 'bad.pdf', { type: 'application/pdf' })
      ]
      pdfParser.extractTextFromFile
        .mockResolvedValueOnce('Resume text')
        .mockResolvedValueOnce('')

      const results = await processResumeFiles(files)

      expect(results.successful).toHaveLength(1)
      expect(results.errors).toHaveLength(1)
      expect(results.errors[0].filename).toBe('bad.pdf')
    })

    it('should call progress callback during processing', async () => {
      const files = [
        new File(['content'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['content'], 'file2.pdf', { type: 'application/pdf' })
      ]
      pdfParser.extractTextFromFile.mockResolvedValue('Resume text')
      const onProgress = vi.fn()

      await processResumeFiles(files, { onProgress })

      expect(onProgress).toHaveBeenCalledTimes(2)
    })
  })

  describe('ValidationCodes', () => {
    it('should export correct validation codes', () => {
      expect(ValidationCodes.FILE_TOO_LARGE).toBe('FILE_TOO_LARGE')
      expect(ValidationCodes.UNSUPPORTED_TYPE).toBe('UNSUPPORTED_TYPE')
      expect(ValidationCodes.NO_TEXT_EXTRACTED).toBe('NO_TEXT_EXTRACTED')
      expect(ValidationCodes.BATCH_LIMIT_EXCEEDED).toBe('BATCH_LIMIT_EXCEEDED')
      expect(ValidationCodes.INVALID_FILE).toBe('INVALID_FILE')
    })
  })
})
