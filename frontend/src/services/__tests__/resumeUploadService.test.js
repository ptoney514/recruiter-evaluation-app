import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock dependencies BEFORE imports to prevent actual module loading
vi.mock('../../utils/pdfParser', () => ({
  extractTextFromFile: vi.fn(),
  extractTextFromPDF: vi.fn(),
  extractTextFromTXT: vi.fn(),
  extractTextFromDOCX: vi.fn()
}))

vi.mock('../../lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn()
    }
  },
  isSupabaseConfigured: vi.fn()
}))

import {
  extractCandidateName,
  validateFile,
  processResumeFile,
  processResumeFiles,
  uploadResumeToStorage,
  processAndUploadResume,
  deleteResumeFromStorage,
  ResumeValidationError,
  ValidationCodes
} from '../resumeUploadService'
import * as pdfParser from '../../utils/pdfParser'
import * as supabaseLib from '../../lib/supabase'

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

    it('should capitalize first letter of each word', () => {
      const result = extractCandidateName('alice_marie_johnson.pdf')
      expect(result).toBe('Alice Marie Johnson')
    })

    it('should handle different file extensions', () => {
      expect(extractCandidateName('bob_brown.docx')).toBe('Bob Brown')
      expect(extractCandidateName('carol_white.txt')).toBe('Carol White')
      expect(extractCandidateName('david_green.doc')).toBe('David Green')
    })

    it('should remove numeric IDs from filename', () => {
      const result = extractCandidateName('Emma_Wilson_98765_Resume.pdf')
      expect(result).toBe('Emma Wilson Resume')
    })

    it('should handle single word names', () => {
      const result = extractCandidateName('Madonna.pdf')
      expect(result).toBe('Madonna')
    })

    it('should handle mixed case input', () => {
      const result = extractCandidateName('FRANK_MILLER.pdf')
      expect(result).toBe('Frank Miller')
    })
  })

  describe('validateFile', () => {
    it('should pass validation for valid PDF file', () => {
      const mockFile = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 }) // 1MB

      expect(() => validateFile(mockFile)).not.toThrow()
    })

    it('should pass validation for valid TXT file', () => {
      const mockFile = new File(['content'], 'resume.txt', { type: 'text/plain' })
      Object.defineProperty(mockFile, 'size', { value: 1024 * 500 }) // 500KB

      expect(() => validateFile(mockFile)).not.toThrow()
    })

    it('should throw error for file too large', () => {
      const mockFile = new File(['content'], 'large.pdf', { type: 'application/pdf' })
      Object.defineProperty(mockFile, 'size', { value: 15 * 1024 * 1024 }) // 15MB

      expect(() => validateFile(mockFile)).toThrow(ResumeValidationError)
      expect(() => validateFile(mockFile)).toThrow(/File too large/)
    })

    it('should throw error with correct validation code for large file', () => {
      const mockFile = new File(['content'], 'large.pdf', { type: 'application/pdf' })
      Object.defineProperty(mockFile, 'size', { value: 15 * 1024 * 1024 })

      try {
        validateFile(mockFile)
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error.code).toBe(ValidationCodes.FILE_TOO_LARGE)
        expect(error.fileName).toBe('large.pdf')
      }
    })

    it('should throw error for unsupported file type', () => {
      const mockFile = new File(['content'], 'resume.exe', { type: 'application/x-msdownload' })
      Object.defineProperty(mockFile, 'size', { value: 1024 })

      expect(() => validateFile(mockFile)).toThrow(ResumeValidationError)
      expect(() => validateFile(mockFile)).toThrow(/Unsupported file type/)
    })

    it('should throw error with correct validation code for unsupported type', () => {
      const mockFile = new File(['content'], 'resume.docx', { type: 'application/vnd.openxmlformats' })
      Object.defineProperty(mockFile, 'size', { value: 1024 })

      try {
        validateFile(mockFile)
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error.code).toBe(ValidationCodes.UNSUPPORTED_TYPE)
        expect(error.fileName).toBe('resume.docx')
      }
    })

    it('should throw error for null file', () => {
      expect(() => validateFile(null)).toThrow(ResumeValidationError)
      expect(() => validateFile(null)).toThrow(/Invalid file object/)
    })

    it('should throw error for undefined file', () => {
      expect(() => validateFile(undefined)).toThrow(ResumeValidationError)
    })

    it('should throw error for invalid file object', () => {
      const invalidFile = { name: 'test.pdf', size: 1024 }

      expect(() => validateFile(invalidFile)).toThrow(ResumeValidationError)
      expect(() => validateFile(invalidFile)).toThrow(/Invalid file object/)
    })
  })

  describe('processResumeFile', () => {
    it('should successfully process a valid PDF file', async () => {
      const mockFile = new File(['content'], 'john_doe.pdf', { type: 'application/pdf' })
      Object.defineProperty(mockFile, 'size', { value: 2 * 1024 * 1024 }) // 2MB

      const mockText = 'John Doe\nSoftware Engineer\n5 years experience'
      vi.spyOn(pdfParser, 'extractTextFromFile').mockResolvedValue(mockText)

      const result = await processResumeFile(mockFile)

      expect(result).toMatchObject({
        name: 'John Doe',
        filename: 'john_doe.pdf',
        text: mockText,
        fileSizeMB: 2.00
      })
      expect(result.id).toBeDefined()
      expect(result.uploadedAt).toBeDefined()
      expect(result.fileSize).toBe(2 * 1024 * 1024)
    })

    it('should call onProgress callback when provided', async () => {
      const mockFile = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 })

      vi.spyOn(pdfParser, 'extractTextFromFile').mockResolvedValue('Resume text')

      const onProgress = vi.fn()
      await processResumeFile(mockFile, { onProgress })

      expect(onProgress).toHaveBeenCalledWith({
        file: 'resume.pdf',
        status: 'completed'
      })
    })

    it('should throw error if no text extracted', async () => {
      const mockFile = new File(['content'], 'empty.pdf', { type: 'application/pdf' })
      Object.defineProperty(mockFile, 'size', { value: 1024 })

      vi.spyOn(pdfParser, 'extractTextFromFile').mockResolvedValue('')

      await expect(processResumeFile(mockFile)).rejects.toThrow(ResumeValidationError)
      await expect(processResumeFile(mockFile)).rejects.toThrow(/No text extracted/)
    })

    it('should throw validation error with correct code for empty text', async () => {
      const mockFile = new File(['content'], 'empty.pdf', { type: 'application/pdf' })
      Object.defineProperty(mockFile, 'size', { value: 1024 })

      vi.spyOn(pdfParser, 'extractTextFromFile').mockResolvedValue('   ')

      try {
        await processResumeFile(mockFile)
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error.code).toBe(ValidationCodes.NO_TEXT_EXTRACTED)
        expect(error.fileName).toBe('empty.pdf')
      }
    })

    it('should wrap parsing errors as validation errors', async () => {
      const mockFile = new File(['content'], 'corrupt.pdf', { type: 'application/pdf' })
      Object.defineProperty(mockFile, 'size', { value: 1024 })

      vi.spyOn(pdfParser, 'extractTextFromFile').mockRejectedValue(
        new Error('PDF parsing failed')
      )

      await expect(processResumeFile(mockFile)).rejects.toThrow(ResumeValidationError)
      await expect(processResumeFile(mockFile)).rejects.toThrow(/PDF parsing failed/)
    })

    it('should generate unique IDs for each resume', async () => {
      const mockFile1 = new File(['content'], 'resume1.pdf', { type: 'application/pdf' })
      const mockFile2 = new File(['content'], 'resume2.pdf', { type: 'application/pdf' })
      Object.defineProperty(mockFile1, 'size', { value: 1024 })
      Object.defineProperty(mockFile2, 'size', { value: 1024 })

      vi.spyOn(pdfParser, 'extractTextFromFile').mockResolvedValue('Resume text')

      const result1 = await processResumeFile(mockFile1)
      const result2 = await processResumeFile(mockFile2)

      expect(result1.id).not.toBe(result2.id)
    })
  })

  describe('processResumeFiles', () => {
    it('should process multiple files successfully', async () => {
      const mockFiles = [
        new File(['content1'], 'alice_jones.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'bob_smith.pdf', { type: 'application/pdf' }),
        new File(['content3'], 'carol_white.txt', { type: 'text/plain' })
      ]
      mockFiles.forEach(file => {
        Object.defineProperty(file, 'size', { value: 1024 * 1024 })
      })

      vi.spyOn(pdfParser, 'extractTextFromFile')
        .mockResolvedValueOnce('Alice resume')
        .mockResolvedValueOnce('Bob resume')
        .mockResolvedValueOnce('Carol resume')

      const result = await processResumeFiles(mockFiles)

      expect(result.successful).toHaveLength(3)
      expect(result.errors).toHaveLength(0)
      expect(result.successful[0].name).toBe('Alice Jones')
      expect(result.successful[1].name).toBe('Bob Smith')
      expect(result.successful[2].name).toBe('Carol White')
    })

    it('should call onProgress callback with correct counts', async () => {
      const mockFiles = [
        new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'file2.pdf', { type: 'application/pdf' })
      ]
      mockFiles.forEach(file => {
        Object.defineProperty(file, 'size', { value: 1024 })
      })

      vi.spyOn(pdfParser, 'extractTextFromFile').mockResolvedValue('Text')

      const onProgress = vi.fn()
      await processResumeFiles(mockFiles, { onProgress })

      expect(onProgress).toHaveBeenCalledTimes(2)
      expect(onProgress).toHaveBeenNthCalledWith(1, 1, 2)
      expect(onProgress).toHaveBeenNthCalledWith(2, 2, 2)
    })

    it('should handle mix of successful and failed files', async () => {
      const mockFiles = [
        new File(['content1'], 'valid.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'invalid.exe', { type: 'application/exe' }),
        new File(['content3'], 'good.txt', { type: 'text/plain' })
      ]
      mockFiles.forEach(file => {
        Object.defineProperty(file, 'size', { value: 1024 })
      })

      vi.spyOn(pdfParser, 'extractTextFromFile')
        .mockResolvedValueOnce('Valid resume')
        .mockResolvedValueOnce('Good resume')

      const result = await processResumeFiles(mockFiles)

      expect(result.successful).toHaveLength(2)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].filename).toBe('invalid.exe')
      expect(result.errors[0].code).toBe(ValidationCodes.UNSUPPORTED_TYPE)
    })

    it('should collect errors without stopping processing', async () => {
      const mockFiles = [
        new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'file2.pdf', { type: 'application/pdf' }),
        new File(['content3'], 'file3.pdf', { type: 'application/pdf' })
      ]
      mockFiles.forEach(file => {
        Object.defineProperty(file, 'size', { value: 1024 })
      })

      vi.spyOn(pdfParser, 'extractTextFromFile')
        .mockResolvedValueOnce('Good text')
        .mockResolvedValueOnce('') // Empty text - will fail
        .mockResolvedValueOnce('Good text again')

      const result = await processResumeFiles(mockFiles)

      expect(result.successful).toHaveLength(2)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].filename).toBe('file2.pdf')
    })

    it('should throw error if batch size exceeds limit', async () => {
      const mockFiles = Array.from({ length: 60 }, (_, i) =>
        new File(['content'], `file${i}.pdf`, { type: 'application/pdf' })
      )

      await expect(processResumeFiles(mockFiles, { maxFiles: 50 }))
        .rejects.toThrow(ResumeValidationError)
      await expect(processResumeFiles(mockFiles, { maxFiles: 50 }))
        .rejects.toThrow(/Too many files/)
    })

    it('should respect custom maxFiles option', async () => {
      const mockFiles = Array.from({ length: 15 }, (_, i) =>
        new File(['content'], `file${i}.pdf`, { type: 'application/pdf' })
      )

      await expect(processResumeFiles(mockFiles, { maxFiles: 10 }))
        .rejects.toThrow(ResumeValidationError)
    })

    it('should call onFileComplete for each file', async () => {
      const mockFiles = [
        new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'file2.pdf', { type: 'application/pdf' })
      ]
      mockFiles.forEach(file => {
        Object.defineProperty(file, 'size', { value: 1024 })
      })

      vi.spyOn(pdfParser, 'extractTextFromFile').mockResolvedValue('Text')

      const onFileComplete = vi.fn()
      await processResumeFiles(mockFiles, { onFileComplete })

      expect(onFileComplete).toHaveBeenCalledTimes(2)
    })

    it('should handle FileList objects', async () => {
      // Create a mock FileList-like object
      const mockFileList = {
        0: new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
        1: new File(['content2'], 'file2.pdf', { type: 'application/pdf' }),
        length: 2,
        [Symbol.iterator]: function* () {
          yield this[0]
          yield this[1]
        }
      }

      Object.defineProperty(mockFileList[0], 'size', { value: 1024 })
      Object.defineProperty(mockFileList[1], 'size', { value: 1024 })

      vi.spyOn(pdfParser, 'extractTextFromFile').mockResolvedValue('Text')

      const result = await processResumeFiles(mockFileList)

      expect(result.successful).toHaveLength(2)
    })
  })

  describe('uploadResumeToStorage', () => {
    const mockSupabase = {
      storage: {
        from: vi.fn()
      }
    }

    beforeEach(() => {
      vi.spyOn(supabaseLib, 'supabase', 'get').mockReturnValue(mockSupabase)
    })

    it('should upload file to Supabase storage successfully', async () => {
      const mockFile = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      const userId = 'user123'

      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: 'user123/123456_abc.pdf' },
        error: null
      })

      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: 'https://storage.supabase.co/user123/123456_abc.pdf' }
      })

      mockSupabase.storage.from.mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl
      })

      vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true)

      const result = await uploadResumeToStorage(mockFile, userId)

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('resumes')
      expect(mockUpload).toHaveBeenCalled()
      expect(result).toHaveProperty('path')
      expect(result).toHaveProperty('publicUrl')
      expect(result).toHaveProperty('bucket', 'resumes')
    })

    it('should use custom bucket name if provided', async () => {
      const mockFile = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      const userId = 'user123'

      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: 'path/to/file.pdf' },
        error: null
      })

      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/file.pdf' }
      })

      mockSupabase.storage.from.mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl
      })

      vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true)

      await uploadResumeToStorage(mockFile, userId, { bucket: 'custom-bucket' })

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('custom-bucket')
    })

    it('should throw error if Supabase is not configured', async () => {
      const mockFile = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      const userId = 'user123'

      vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(false)

      await expect(uploadResumeToStorage(mockFile, userId))
        .rejects.toThrow(/Supabase is not configured/)
    })

    it('should throw error if upload fails', async () => {
      const mockFile = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      const userId = 'user123'

      const mockUpload = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Storage quota exceeded' }
      })

      mockSupabase.storage.from.mockReturnValue({
        upload: mockUpload
      })

      vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true)

      await expect(uploadResumeToStorage(mockFile, userId))
        .rejects.toThrow(/Failed to upload file/)
    })
  })

  describe('processAndUploadResume', () => {
    it('should process and upload resume when Supabase is configured', async () => {
      const mockFile = new File(['content'], 'john_doe.pdf', { type: 'application/pdf' })
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 })
      const userId = 'user123'

      vi.spyOn(pdfParser, 'extractTextFromFile').mockResolvedValue('Resume text')
      vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true)

      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: 'user123/file.pdf' },
        error: null
      })

      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: 'https://storage.supabase.co/file.pdf' }
      })

      const mockSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            upload: mockUpload,
            getPublicUrl: mockGetPublicUrl
          })
        }
      }

      vi.spyOn(supabaseLib, 'supabase', 'get').mockReturnValue(mockSupabase)

      const result = await processAndUploadResume(mockFile, userId)

      expect(result).toMatchObject({
        name: 'John Doe',
        text: 'Resume text',
        fileUrl: 'https://storage.supabase.co/file.pdf',
        storagePath: 'user123/file.pdf'
      })
    })

    it('should continue if storage upload fails', async () => {
      const mockFile = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      Object.defineProperty(mockFile, 'size', { value: 1024 })
      const userId = 'user123'

      vi.spyOn(pdfParser, 'extractTextFromFile').mockResolvedValue('Resume text')
      vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true)

      const mockUpload = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Upload failed' }
      })

      const mockSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            upload: mockUpload
          })
        }
      }

      vi.spyOn(supabaseLib, 'supabase', 'get').mockReturnValue(mockSupabase)

      // Should not throw - storage upload failure is non-critical
      const result = await processAndUploadResume(mockFile, userId)

      expect(result).toMatchObject({
        text: 'Resume text'
      })
      expect(result.fileUrl).toBeUndefined()
    })

    it('should skip upload if Supabase is not configured', async () => {
      const mockFile = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      Object.defineProperty(mockFile, 'size', { value: 1024 })
      const userId = 'user123'

      vi.spyOn(pdfParser, 'extractTextFromFile').mockResolvedValue('Resume text')
      vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(false)

      const result = await processAndUploadResume(mockFile, userId)

      expect(result).toMatchObject({
        text: 'Resume text'
      })
      expect(result.fileUrl).toBeUndefined()
    })

    it('should skip upload if userId is not provided', async () => {
      const mockFile = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      Object.defineProperty(mockFile, 'size', { value: 1024 })

      vi.spyOn(pdfParser, 'extractTextFromFile').mockResolvedValue('Resume text')
      vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true)

      const result = await processAndUploadResume(mockFile, null)

      expect(result).toMatchObject({
        text: 'Resume text'
      })
      expect(result.fileUrl).toBeUndefined()
    })
  })

  describe('deleteResumeFromStorage', () => {
    const mockSupabase = {
      storage: {
        from: vi.fn()
      }
    }

    beforeEach(() => {
      vi.spyOn(supabaseLib, 'supabase', 'get').mockReturnValue(mockSupabase)
    })

    it('should delete file from storage successfully', async () => {
      const filePath = 'user123/resume.pdf'

      const mockRemove = vi.fn().mockResolvedValue({
        data: {},
        error: null
      })

      mockSupabase.storage.from.mockReturnValue({
        remove: mockRemove
      })

      vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true)

      await deleteResumeFromStorage(filePath)

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('resumes')
      expect(mockRemove).toHaveBeenCalledWith([filePath])
    })

    it('should throw error if Supabase is not configured', async () => {
      vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(false)

      await expect(deleteResumeFromStorage('path/to/file'))
        .rejects.toThrow(/Supabase is not configured/)
    })

    it('should throw error if deletion fails', async () => {
      const filePath = 'user123/resume.pdf'

      const mockRemove = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'File not found' }
      })

      mockSupabase.storage.from.mockReturnValue({
        remove: mockRemove
      })

      vi.spyOn(supabaseLib, 'isSupabaseConfigured').mockReturnValue(true)

      await expect(deleteResumeFromStorage(filePath))
        .rejects.toThrow(/Failed to delete file/)
    })
  })

  describe('ResumeValidationError', () => {
    it('should create error with correct properties', () => {
      const error = new ResumeValidationError(
        'Test error message',
        ValidationCodes.FILE_TOO_LARGE,
        'test.pdf'
      )

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(ResumeValidationError)
      expect(error.message).toBe('Test error message')
      expect(error.code).toBe(ValidationCodes.FILE_TOO_LARGE)
      expect(error.fileName).toBe('test.pdf')
      expect(error.name).toBe('ResumeValidationError')
    })
  })
})
