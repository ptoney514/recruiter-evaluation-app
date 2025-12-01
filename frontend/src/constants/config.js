/**
 * Application configuration constants
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Storage Limits
export const STORAGE_LIMIT_MB = 5 // Conservative sessionStorage limit
export const MAX_FILE_SIZE_MB = 10 // Max individual file size
export const MAX_RESUMES_BATCH = 50 // Max resumes per batch

// Evaluation Costs (in USD)
export const COST_PER_CANDIDATE_AI = 0.003 // Claude Haiku cost per evaluation
export const COST_PER_CANDIDATE_REGEX = 0 // Free

// Scoring Thresholds
export const SCORE_THRESHOLD_INTERVIEW = 85 // Score >= 85: Advance to interview
export const SCORE_THRESHOLD_PHONE = 70 // Score 70-84: Phone screen first
// Score < 70: Decline

// Evaluation Weights
export const STAGE1_WEIGHTS = {
  qualifications: 0.4,
  experience: 0.4,
  riskFlags: 0.2
}

export const STAGE2_WEIGHTS = {
  resume: 0.25,
  interview: 0.50,
  references: 0.25
}

// File Types
export const SUPPORTED_FILE_TYPES = ['.pdf', '.txt', '.docx', '.doc']
