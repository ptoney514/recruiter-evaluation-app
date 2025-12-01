import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { ResumeUploadModal } from '../ResumeUploadModal'

// Mock the useBulkCreateCandidates hook
const mockMutateAsync = vi.fn()
vi.mock('../../../hooks/useCandidates', () => ({
  useBulkCreateCandidates: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false
  })
}))

// Mock the PDF parser
vi.mock('../../../utils/pdfParser', () => ({
  extractTextFromFile: vi.fn()
}))

import { extractTextFromFile } from '../../../utils/pdfParser'

// Helper to create QueryClient wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

// Helper to create mock files
function createMockFile(name, content, type = 'application/pdf') {
  const file = new File([content], name, { type })
  return file
}

describe('ResumeUploadModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    jobId: 'job-123',
    onSuccess: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    extractTextFromFile.mockReset()
  })

  describe('rendering', () => {
    it('renders when isOpen is true', () => {
      render(<ResumeUploadModal {...defaultProps} />, { wrapper: createWrapper() })

      expect(screen.getByText('Upload Resumes')).toBeInTheDocument()
      expect(screen.getByText('Drag & drop resume files')).toBeInTheDocument()
      expect(screen.getByText('Choose Files')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(<ResumeUploadModal {...defaultProps} isOpen={false} />, { wrapper: createWrapper() })

      expect(screen.queryByText('Upload Resumes')).not.toBeInTheDocument()
    })

    it('shows file type support information', () => {
      render(<ResumeUploadModal {...defaultProps} />, { wrapper: createWrapper() })

      expect(screen.getByText(/Supports PDF, DOCX, and TXT files/i)).toBeInTheDocument()
    })
  })

  describe('close behavior', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<ResumeUploadModal {...defaultProps} />, { wrapper: createWrapper() })

      const closeButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(closeButton)

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('calls onClose when clicking backdrop', async () => {
      const user = userEvent.setup()
      render(<ResumeUploadModal {...defaultProps} />, { wrapper: createWrapper() })

      // Click the backdrop (the outer fixed div)
      const backdrop = document.querySelector('.fixed.inset-0')
      await user.click(backdrop)

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('does not close when clicking modal content', async () => {
      const user = userEvent.setup()
      render(<ResumeUploadModal {...defaultProps} />, { wrapper: createWrapper() })

      // Click the modal content
      await user.click(screen.getByText('Upload Resumes'))

      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })
  })

  describe('file selection via file picker', () => {
    it('opens file picker when "Choose Files" is clicked', async () => {
      const user = userEvent.setup()
      render(<ResumeUploadModal {...defaultProps} />, { wrapper: createWrapper() })

      const fileInput = document.querySelector('input[type="file"]')
      const clickSpy = vi.spyOn(fileInput, 'click')

      await user.click(screen.getByText('Choose Files'))

      expect(clickSpy).toHaveBeenCalled()
    })

    it('accepts .pdf, .txt, .docx, and .doc files', () => {
      render(<ResumeUploadModal {...defaultProps} />, { wrapper: createWrapper() })

      const fileInput = document.querySelector('input[type="file"]')
      expect(fileInput).toHaveAttribute('accept', '.pdf,.txt,.docx,.doc')
      expect(fileInput).toHaveAttribute('multiple')
    })
  })

  describe('file processing', () => {
    it('processes files and shows progress', async () => {
      extractTextFromFile.mockResolvedValue('Resume text content for John Doe')
      mockMutateAsync.mockResolvedValue({ candidates: [] })

      render(<ResumeUploadModal {...defaultProps} />, { wrapper: createWrapper() })

      const file = createMockFile('John_Doe.pdf', 'resume content')
      const fileInput = document.querySelector('input[type="file"]')

      // Simulate file selection
      await fireEvent.change(fileInput, { target: { files: [file] } })

      // Wait for processing
      await waitFor(() => {
        expect(screen.getByText(/Processing/i)).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('extracts candidate name from filename', async () => {
      extractTextFromFile.mockResolvedValue('Resume text content')
      mockMutateAsync.mockResolvedValue({ candidates: [] })

      render(<ResumeUploadModal {...defaultProps} />, { wrapper: createWrapper() })

      const file = createMockFile('Jane_Smith_12345.pdf', 'resume content')
      const fileInput = document.querySelector('input[type="file"]')

      await fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled()
      }, { timeout: 3000 })

      // Check that the correct name was extracted
      const callArgs = mockMutateAsync.mock.calls[0][0]
      expect(callArgs.candidates[0].name).toBe('Jane Smith')
    })

    it('calls bulkCreateCandidates with processed files', async () => {
      extractTextFromFile.mockResolvedValue('Resume text content')
      mockMutateAsync.mockResolvedValue({ candidates: [] })

      render(<ResumeUploadModal {...defaultProps} />, { wrapper: createWrapper() })

      const file = createMockFile('John_Doe.pdf', 'resume content')
      const fileInput = document.querySelector('input[type="file"]')

      await fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          jobId: 'job-123',
          candidates: expect.arrayContaining([
            expect.objectContaining({
              name: 'John Doe',
              fullName: 'John Doe',
              resumeText: 'Resume text content',
              resumeFileName: 'John_Doe.pdf',
              evaluationStatus: 'pending'
            })
          ])
        })
      })
    })

    it('shows success message after upload completes', async () => {
      extractTextFromFile.mockResolvedValue('Resume text content')
      mockMutateAsync.mockResolvedValue({ candidates: [] })

      render(<ResumeUploadModal {...defaultProps} />, { wrapper: createWrapper() })

      const file = createMockFile('John_Doe.pdf', 'resume content')
      const fileInput = document.querySelector('input[type="file"]')

      await fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/uploaded successfully/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('error handling', () => {
    it('shows error for unsupported file types', async () => {
      render(<ResumeUploadModal {...defaultProps} />, { wrapper: createWrapper() })

      const file = createMockFile('spreadsheet.xlsx', 'content', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      const fileInput = document.querySelector('input[type="file"]')

      await fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/Unsupported file type/i)).toBeInTheDocument()
      })
    })

    it('shows error when text extraction fails', async () => {
      extractTextFromFile.mockRejectedValue(new Error('Failed to parse PDF'))

      render(<ResumeUploadModal {...defaultProps} />, { wrapper: createWrapper() })

      const file = createMockFile('corrupted.pdf', 'bad content')
      const fileInput = document.querySelector('input[type="file"]')

      await fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/Failed to parse PDF/i)).toBeInTheDocument()
      })
    })

    it('shows error when no text is extracted', async () => {
      extractTextFromFile.mockResolvedValue('')

      render(<ResumeUploadModal {...defaultProps} />, { wrapper: createWrapper() })

      const file = createMockFile('empty.pdf', '')
      const fileInput = document.querySelector('input[type="file"]')

      await fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/No text extracted/i)).toBeInTheDocument()
      })
    })

    it('shows error when database save fails', async () => {
      extractTextFromFile.mockResolvedValue('Resume text content')
      mockMutateAsync.mockRejectedValue(new Error('Database error'))

      render(<ResumeUploadModal {...defaultProps} />, { wrapper: createWrapper() })

      const file = createMockFile('John_Doe.pdf', 'resume content')
      const fileInput = document.querySelector('input[type="file"]')

      await fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/Failed to save candidates/i)).toBeInTheDocument()
      })
    })
  })

  describe('drag and drop', () => {
    it('changes style when dragging over', async () => {
      render(<ResumeUploadModal {...defaultProps} />, { wrapper: createWrapper() })

      const dropZone = screen.getByText('Drag & drop resume files').closest('div')

      // Simulate drag over
      fireEvent.dragOver(dropZone)

      await waitFor(() => {
        expect(screen.getByText('Drop files here')).toBeInTheDocument()
      })
    })

    it('reverts style when drag leaves', async () => {
      render(<ResumeUploadModal {...defaultProps} />, { wrapper: createWrapper() })

      const dropZone = screen.getByText('Drag & drop resume files').closest('div')

      fireEvent.dragOver(dropZone)
      fireEvent.dragLeave(dropZone)

      await waitFor(() => {
        expect(screen.getByText('Drag & drop resume files')).toBeInTheDocument()
      })
    })

    it('processes files on drop', async () => {
      extractTextFromFile.mockResolvedValue('Dropped resume content')
      mockMutateAsync.mockResolvedValue({ candidates: [] })

      render(<ResumeUploadModal {...defaultProps} />, { wrapper: createWrapper() })

      const dropZone = screen.getByText('Drag & drop resume files').closest('div')

      const file = createMockFile('Dropped_Resume.pdf', 'content')
      const dataTransfer = {
        files: [file],
        items: [{ kind: 'file', type: file.type, getAsFile: () => file }],
        types: ['Files']
      }

      fireEvent.drop(dropZone, { dataTransfer })

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled()
      }, { timeout: 3000 })
    })
  })

  describe('multiple files', () => {
    it('processes multiple files at once', async () => {
      extractTextFromFile.mockResolvedValue('Resume content')
      mockMutateAsync.mockResolvedValue({ candidates: [] })

      render(<ResumeUploadModal {...defaultProps} />, { wrapper: createWrapper() })

      const files = [
        createMockFile('John_Doe.pdf', 'content 1'),
        createMockFile('Jane_Smith.pdf', 'content 2'),
        createMockFile('Bob_Wilson.pdf', 'content 3')
      ]
      const fileInput = document.querySelector('input[type="file"]')

      await fireEvent.change(fileInput, { target: { files } })

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          jobId: 'job-123',
          candidates: expect.arrayContaining([
            expect.objectContaining({ name: 'John Doe' }),
            expect.objectContaining({ name: 'Jane Smith' }),
            expect.objectContaining({ name: 'Bob Wilson' })
          ])
        })
      })
    })

    it('shows count in success message', async () => {
      extractTextFromFile.mockResolvedValue('Resume content')
      mockMutateAsync.mockResolvedValue({ candidates: [] })

      render(<ResumeUploadModal {...defaultProps} />, { wrapper: createWrapper() })

      const files = [
        createMockFile('John_Doe.pdf', 'content 1'),
        createMockFile('Jane_Smith.pdf', 'content 2')
      ]
      const fileInput = document.querySelector('input[type="file"]')

      await fireEvent.change(fileInput, { target: { files } })

      await waitFor(() => {
        expect(screen.getByText(/2 candidates uploaded successfully/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('callbacks', () => {
    it('calls onSuccess after successful upload', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      extractTextFromFile.mockResolvedValue('Resume content')
      mockMutateAsync.mockResolvedValue({ candidates: [] })

      render(<ResumeUploadModal {...defaultProps} />, { wrapper: createWrapper() })

      const file = createMockFile('John_Doe.pdf', 'content')
      const fileInput = document.querySelector('input[type="file"]')

      await fireEvent.change(fileInput, { target: { files: [file] } })

      // Wait for processing to complete
      await waitFor(() => {
        expect(screen.getByText(/uploaded successfully/i)).toBeInTheDocument()
      }, { timeout: 3000 })

      // Fast forward past the setTimeout
      vi.advanceTimersByTime(2000)

      expect(defaultProps.onSuccess).toHaveBeenCalledWith(1)
      vi.useRealTimers()
    })
  })
})
