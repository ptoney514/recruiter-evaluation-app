/**
 * Database Service Unit Tests
 * Tests CRUD operations with mocked fetch
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as dbService from '../databaseService';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('databaseService', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============ Jobs ============

  describe('Jobs CRUD', () => {
    const mockJob = {
      id: 'job-123',
      user_id: 'user-123',
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'Phoenix, AZ',
      must_have_requirements: ['5+ years experience', 'Python'],
      preferred_requirements: ['AWS experience'],
    };

    describe('getJobs', () => {
      it('should fetch all jobs for user', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, jobs: [mockJob] }),
        });

        const result = await dbService.getJobs();

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/jobs'),
          expect.objectContaining({ credentials: 'include' })
        );
        expect(result.success).toBe(true);
        expect(result.jobs).toHaveLength(1);
        expect(result.jobs[0].title).toBe('Senior Software Engineer');
      });

      it('should handle empty jobs list', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, jobs: [] }),
        });

        const result = await dbService.getJobs();

        expect(result.success).toBe(true);
        expect(result.jobs).toHaveLength(0);
      });
    });

    describe('getJob', () => {
      it('should fetch a specific job by ID', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, job: mockJob }),
        });

        const result = await dbService.getJob('job-123');

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/jobs/job-123'),
          expect.objectContaining({ credentials: 'include' })
        );
        expect(result.success).toBe(true);
        expect(result.job.id).toBe('job-123');
      });

      it('should handle job not found', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: async () => ({ success: false, error: 'Job not found' }),
        });

        await expect(dbService.getJob('nonexistent')).rejects.toThrow('Job not found');
      });
    });

    describe('createJob', () => {
      it('should create a new job', async () => {
        const newJobData = {
          title: 'Product Manager',
          department: 'Product',
          must_have_requirements: ['MBA', '5+ years PM experience'],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, job: { id: 'job-456', ...newJobData } }),
        });

        const result = await dbService.createJob(newJobData);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/jobs'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(newJobData),
          })
        );
        expect(result.success).toBe(true);
        expect(result.job.title).toBe('Product Manager');
      });
    });

    describe('updateJob', () => {
      it('should update an existing job', async () => {
        const updateData = { title: 'Lead Software Engineer' };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, job: { ...mockJob, ...updateData } }),
        });

        const result = await dbService.updateJob('job-123', updateData);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/jobs/job-123'),
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(updateData),
          })
        );
        expect(result.success).toBe(true);
      });
    });

    describe('deleteJob', () => {
      it('should delete a job', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

        const result = await dbService.deleteJob('job-123');

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/jobs/job-123'),
          expect.objectContaining({ method: 'DELETE' })
        );
        expect(result.success).toBe(true);
      });
    });
  });

  // ============ Candidates ============

  describe('Candidates CRUD', () => {
    const mockCandidate = {
      id: 'cand-123',
      job_id: 'job-123',
      name: 'John Developer',
      email: 'john@example.com',
      resume_text: 'Experienced software engineer...',
      quick_score: 85,
    };

    describe('getCandidates', () => {
      it('should fetch all candidates for a job', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, candidates: [mockCandidate] }),
        });

        const result = await dbService.getCandidates('job-123');

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/jobs/job-123/candidates'),
          expect.objectContaining({ credentials: 'include' })
        );
        expect(result.success).toBe(true);
        expect(result.candidates).toHaveLength(1);
      });
    });

    describe('getCandidate', () => {
      it('should fetch a specific candidate', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, candidate: mockCandidate }),
        });

        const result = await dbService.getCandidate('cand-123');

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/candidates/cand-123'),
          expect.objectContaining({ credentials: 'include' })
        );
        expect(result.success).toBe(true);
        expect(result.candidate.name).toBe('John Developer');
      });
    });

    describe('createCandidate', () => {
      it('should create a new candidate', async () => {
        const newCandidateData = {
          name: 'Jane Engineer',
          email: 'jane@example.com',
          resume_text: 'Senior backend engineer...',
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            candidate: { id: 'cand-456', job_id: 'job-123', ...newCandidateData },
          }),
        });

        const result = await dbService.createCandidate('job-123', newCandidateData);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/jobs/job-123/candidates'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(newCandidateData),
          })
        );
        expect(result.success).toBe(true);
        expect(result.candidate.name).toBe('Jane Engineer');
      });
    });

    describe('updateCandidate', () => {
      it('should update a candidate', async () => {
        const updateData = { quick_score: 90 };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, candidate: { ...mockCandidate, ...updateData } }),
        });

        const result = await dbService.updateCandidate('cand-123', updateData);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/candidates/cand-123'),
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(updateData),
          })
        );
        expect(result.success).toBe(true);
      });
    });

    describe('deleteCandidate', () => {
      it('should delete a candidate', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

        const result = await dbService.deleteCandidate('cand-123');

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/candidates/cand-123'),
          expect.objectContaining({ method: 'DELETE' })
        );
        expect(result.success).toBe(true);
      });
    });
  });

  // ============ Evaluations ============

  describe('Evaluations', () => {
    const mockEvaluation = {
      id: 'eval-123',
      candidate_id: 'cand-123',
      score: 85,
      scoring_model: 'ATQ',
      a_score: 90,
      t_score: 80,
      q_score: 85,
      recommendation: 'INTERVIEW',
      reasoning: 'Strong candidate with relevant experience...',
    };

    describe('getEvaluations', () => {
      it('should fetch evaluations for a candidate', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, evaluations: [mockEvaluation] }),
        });

        const result = await dbService.getEvaluations('cand-123');

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/candidates/cand-123/evaluations'),
          expect.objectContaining({ credentials: 'include' })
        );
        expect(result.success).toBe(true);
        expect(result.evaluations).toHaveLength(1);
        expect(result.evaluations[0].scoring_model).toBe('ATQ');
      });
    });

    describe('createEvaluation', () => {
      it('should create a new evaluation', async () => {
        const evalData = {
          score: 78,
          scoring_model: 'ATQ',
          a_score: 75,
          t_score: 80,
          q_score: 80,
          recommendation: 'PHONE_SCREEN',
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            evaluation: { id: 'eval-456', candidate_id: 'cand-123', ...evalData },
          }),
        });

        const result = await dbService.createEvaluation('cand-123', evalData);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/candidates/cand-123/evaluations'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(evalData),
          })
        );
        expect(result.success).toBe(true);
        expect(result.evaluation.scoring_model).toBe('ATQ');
      });
    });
  });

  // ============ Quick Score (Ollama) ============

  describe('Quick Score Operations', () => {
    describe('compareModels', () => {
      it('should compare multiple Ollama models', async () => {
        const mockResults = [
          { model: 'phi3', success: true, score: 75, elapsed_seconds: 2.5 },
          { model: 'mistral', success: true, score: 80, elapsed_seconds: 3.2 },
          { model: 'llama3', success: true, score: 85, elapsed_seconds: 4.1 },
        ];

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, results: mockResults }),
        });

        const job = { id: 'job-123', title: 'Engineer' };
        const candidate = { id: 'cand-123', name: 'John' };

        const result = await dbService.compareModels(job, candidate, ['phi3', 'mistral', 'llama3']);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/evaluate_quick/compare'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ job, candidate, models: ['phi3', 'mistral', 'llama3'] }),
          })
        );
        expect(result.success).toBe(true);
        expect(result.results).toHaveLength(3);
      });
    });
  });

  // ============ AI Evaluation ============

  describe('AI Evaluation', () => {
    describe('evaluateWithAI', () => {
      it('should evaluate candidate with Claude', async () => {
        const mockResult = {
          success: true,
          score: 88,
          recommendation: 'INTERVIEW',
          reasoning: 'Excellent fit for the role...',
          usage: { input_tokens: 1500, output_tokens: 500, cost: 0.003 },
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResult,
        });

        const job = { id: 'job-123', title: 'Engineer' };
        const candidate = { id: 'cand-123', name: 'John', resume_text: '...' };

        const result = await dbService.evaluateWithAI(job, candidate, 1);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/evaluate_candidate'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ job, candidate, stage: 1 }),
          })
        );
        expect(result.success).toBe(true);
        expect(result.score).toBe(88);
      });
    });
  });

  // ============ Error Handling ============

  describe('Error Handling', () => {
    it('should handle 401 Unauthorized', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      await expect(dbService.getJobs()).rejects.toThrow('Unauthorized');
    });

    it('should handle 403 Forbidden', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Forbidden' }),
      });

      await expect(dbService.getJob('job-123')).rejects.toThrow('Forbidden');
    });

    it('should handle 500 Server Error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      await expect(dbService.createJob({})).rejects.toThrow('Internal server error');
    });

    it('should handle network failures', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(dbService.getJobs()).rejects.toThrow('Network error');
    });
  });
});
