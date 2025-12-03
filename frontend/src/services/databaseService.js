/**
 * Database Service
 * Handles all database operations via the Python API backend
 * Replaces Supabase client for local SQLite database
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include', // Include cookies for auth
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `API error: ${response.status}`);
  }

  return data;
}

// ============ Jobs ============

export async function getJobs() {
  return apiFetch('/api/jobs');
}

export async function getJob(jobId) {
  return apiFetch(`/api/jobs/${jobId}`);
}

export async function createJob(jobData) {
  return apiFetch('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(jobData),
  });
}

export async function updateJob(jobId, jobData) {
  return apiFetch(`/api/jobs/${jobId}`, {
    method: 'PUT',
    body: JSON.stringify(jobData),
  });
}

export async function deleteJob(jobId) {
  return apiFetch(`/api/jobs/${jobId}`, {
    method: 'DELETE',
  });
}

// ============ Candidates ============

export async function getCandidates(jobId) {
  return apiFetch(`/api/jobs/${jobId}/candidates`);
}

export async function getCandidate(candidateId) {
  return apiFetch(`/api/candidates/${candidateId}`);
}

export async function createCandidate(jobId, candidateData) {
  return apiFetch(`/api/jobs/${jobId}/candidates`, {
    method: 'POST',
    body: JSON.stringify(candidateData),
  });
}

export async function updateCandidate(candidateId, candidateData) {
  return apiFetch(`/api/candidates/${candidateId}`, {
    method: 'PUT',
    body: JSON.stringify(candidateData),
  });
}

export async function deleteCandidate(candidateId) {
  return apiFetch(`/api/candidates/${candidateId}`, {
    method: 'DELETE',
  });
}

// ============ Evaluations ============

export async function getEvaluations(candidateId) {
  return apiFetch(`/api/candidates/${candidateId}/evaluations`);
}

export async function createEvaluation(candidateId, evaluationData) {
  return apiFetch(`/api/candidates/${candidateId}/evaluations`, {
    method: 'POST',
    body: JSON.stringify(evaluationData),
  });
}

// ============ Quick Score (Ollama) ============

export async function quickEvaluate(jobId, candidateId) {
  return apiFetch('/api/evaluate_quick', {
    method: 'POST',
    body: JSON.stringify({ job_id: jobId, candidate_id: candidateId }),
  });
}

export async function batchQuickEvaluate(jobId, candidateIds, model = 'mistral') {
  return apiFetch('/api/evaluate_quick/batch', {
    method: 'POST',
    body: JSON.stringify({
      job_id: jobId,
      candidate_ids: candidateIds,
      model,
    }),
  });
}

export async function compareModels(job, candidate, models = ['phi3', 'mistral', 'llama3']) {
  return apiFetch('/api/evaluate_quick/compare', {
    method: 'POST',
    body: JSON.stringify({ job, candidate, models }),
  });
}

// ============ AI Evaluation (Claude) ============

export async function evaluateWithAI(job, candidate, stage = 1) {
  return apiFetch('/api/evaluate_candidate', {
    method: 'POST',
    body: JSON.stringify({ job, candidate, stage }),
  });
}

// ============ File Upload ============

export async function uploadResume(jobId, candidateId, file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('job_id', jobId);
  formData.append('candidate_id', candidateId);

  const response = await fetch(`${API_BASE}/api/upload_resume`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Upload failed');
  }

  return data;
}
