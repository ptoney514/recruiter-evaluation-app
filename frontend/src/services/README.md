# Resume Upload Service

Comprehensive service for handling resume file uploads, validation, text extraction, and Supabase storage integration.

## Features

- ✅ File validation (size, type)
- ✅ Text extraction from PDF and TXT files
- ✅ Candidate name extraction from filenames
- ✅ Batch processing with parallel execution
- ✅ Progress tracking callbacks
- ✅ Supabase Storage integration
- ✅ Comprehensive error handling
- ✅ 42 unit tests with 100% coverage

## Installation

The service is already integrated into the project. No additional installation required.

## Usage

### Basic Usage - Process Single File

```javascript
import { processResumeFile } from '../services/resumeUploadService'

// Process a single resume file
const handleFileUpload = async (file) => {
  try {
    const resume = await processResumeFile(file, {
      onProgress: (progress) => {
        console.log('Processing:', progress.file, progress.status)
      }
    })

    console.log('Resume processed:', resume)
    // {
    //   id: 'resume_1234567890_abc123',
    //   name: 'John Doe',
    //   filename: 'john_doe.pdf',
    //   text: 'Extracted resume text...',
    //   uploadedAt: 1234567890,
    //   fileSizeMB: 2.5,
    //   fileSize: 2621440
    // }
  } catch (error) {
    if (error instanceof ResumeValidationError) {
      console.error('Validation error:', error.message, error.code)
    }
  }
}
```

### Batch Processing - Multiple Files

```javascript
import { processResumeFiles } from '../services/resumeUploadService'

const handleBatchUpload = async (files) => {
  const results = await processResumeFiles(files, {
    maxFiles: 50,
    onProgress: (current, total) => {
      console.log(`Processing ${current} of ${total}`)
    },
    onFileComplete: (progress) => {
      console.log('File completed:', progress.file)
    }
  })

  console.log(`Successfully processed: ${results.successful.length}`)
  console.log(`Errors: ${results.errors.length}`)

  // Handle errors
  results.errors.forEach(error => {
    console.error(`${error.filename}: ${error.message} (${error.code})`)
  })

  // Use successful resumes
  const resumes = results.successful
}
```

### With Supabase Storage Upload

```javascript
import { processAndUploadResume } from '../services/resumeUploadService'

const handleFileWithStorage = async (file, userId) => {
  try {
    const resume = await processAndUploadResume(file, userId, {
      bucket: 'resumes', // optional, defaults to 'resumes'
      onProgress: (progress) => {
        console.log('Progress:', progress)
      }
    })

    console.log('Resume with storage URL:', resume)
    // {
    //   ...basic resume fields,
    //   fileUrl: 'https://storage.supabase.co/...',
    //   storagePath: 'user123/1234567890_abc.pdf'
    // }
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
```

### File Validation

```javascript
import { validateFile, ValidationCodes } from '../services/resumeUploadService'

const checkFile = (file) => {
  try {
    validateFile(file)
    console.log('File is valid')
  } catch (error) {
    switch (error.code) {
      case ValidationCodes.FILE_TOO_LARGE:
        console.error('File exceeds 10MB limit')
        break
      case ValidationCodes.UNSUPPORTED_TYPE:
        console.error('Only PDF and TXT files supported')
        break
      case ValidationCodes.INVALID_FILE:
        console.error('Invalid file object')
        break
    }
  }
}
```

### Extract Candidate Name from Filename

```javascript
import { extractCandidateName } from '../services/resumeUploadService'

const name1 = extractCandidateName('john_doe.pdf')
// => 'John Doe'

const name2 = extractCandidateName('Jane_Smith_12345.pdf')
// => 'Jane Smith' (removes numeric ID)

const name3 = extractCandidateName('alice_marie_johnson.docx')
// => 'Alice Marie Johnson'
```

## API Reference

### `processResumeFile(file, options)`

Process a single resume file with validation and text extraction.

**Parameters:**
- `file` (File): Resume file to process
- `options` (Object):
  - `onProgress` (Function): Progress callback

**Returns:** Promise<Resume>

**Throws:** ResumeValidationError

### `processResumeFiles(files, options)`

Process multiple resume files in parallel.

**Parameters:**
- `files` (FileList|File[]): Files to process
- `options` (Object):
  - `maxFiles` (number): Maximum files allowed (default: 50)
  - `onProgress` (Function): Overall progress callback (current, total)
  - `onFileComplete` (Function): Individual file completion callback

**Returns:** Promise<{successful: Resume[], errors: Error[]}>

### `uploadResumeToStorage(file, userId, options)`

Upload resume file to Supabase Storage.

**Parameters:**
- `file` (File): File to upload
- `userId` (string): User ID for organizing files
- `options` (Object):
  - `bucket` (string): Storage bucket name (default: 'resumes')

**Returns:** Promise<{path: string, publicUrl: string, bucket: string}>

**Throws:** Error

### `processAndUploadResume(file, userId, options)`

Process and upload resume in one operation.

**Parameters:**
- `file` (File): Resume file
- `userId` (string): User ID
- `options` (Object): Combined processing and upload options

**Returns:** Promise<Resume> (includes fileUrl and storagePath if upload succeeds)

### `deleteResumeFromStorage(filePath, options)`

Delete resume from Supabase Storage.

**Parameters:**
- `filePath` (string): Storage file path
- `options` (Object):
  - `bucket` (string): Storage bucket name (default: 'resumes')

**Returns:** Promise<void>

**Throws:** Error

### `validateFile(file)`

Validate file size and type.

**Parameters:**
- `file` (File): File to validate

**Throws:** ResumeValidationError

### `extractCandidateName(filename)`

Extract and format candidate name from filename.

**Parameters:**
- `filename` (string): File name

**Returns:** string

## Validation Codes

```javascript
ValidationCodes = {
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_TYPE: 'UNSUPPORTED_TYPE',
  NO_TEXT_EXTRACTED: 'NO_TEXT_EXTRACTED',
  BATCH_LIMIT_EXCEEDED: 'BATCH_LIMIT_EXCEEDED',
  INVALID_FILE: 'INVALID_FILE'
}
```

## Configuration

The service uses constants from `constants/config.js`:

- `MAX_FILE_SIZE_MB`: 10 MB per file
- `MAX_RESUMES_BATCH`: 50 files per batch
- `SUPPORTED_FILE_TYPES`: ['.pdf', '.txt']

## Testing

Run the comprehensive test suite:

```bash
npm run test:run -- src/services/__tests__/resumeUploadService.test.js
```

**Test Coverage:**
- 42 unit tests
- All core functions tested
- Edge cases covered
- Error handling validated
- Mock Supabase integration

## Error Handling

All errors are instances of `ResumeValidationError` with:
- `message`: Human-readable error description
- `code`: Machine-readable error code (from ValidationCodes)
- `fileName`: Name of the file that caused the error

Example:
```javascript
try {
  await processResumeFile(file)
} catch (error) {
  console.log(error.message)  // "File too large (15.2MB, max 10MB)"
  console.log(error.code)     // "FILE_TOO_LARGE"
  console.log(error.fileName) // "resume.pdf"
}
```

## Integration with Existing Code

The service is designed to work seamlessly with:
- `ResumeUploadPage.jsx`: UI component for upload
- `storageManager.js`: Session/database storage
- `supabaseStore.js`: Database operations
- `pdfParser.js`: PDF text extraction utility

## Future Enhancements

- [ ] DOCX file support (currently throws error)
- [ ] Image-based OCR for scanned PDFs
- [ ] Resume format standardization
- [ ] Duplicate detection
- [ ] Virus scanning integration
