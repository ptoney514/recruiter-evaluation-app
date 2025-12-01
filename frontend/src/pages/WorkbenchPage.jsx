import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight,
  Search,
  UploadCloud,
  Sparkles,
  MoreHorizontal,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { CandidateDetailPanel } from '../components/workbench/CandidateDetailPanel';
import { ResumeUploadModal } from '../components/workbench/ResumeUploadModal';
import { useCandidates } from '../hooks/useCandidates';
import { useJob } from '../hooks/useJobs';
import { useBatchEvaluate } from '../hooks/useEvaluations';

/**
 * Badge component
 */
function Badge({ children, color = 'slate' }) {
  const colors = {
    green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    yellow: 'bg-amber-100 text-amber-700 border-amber-200',
    red: 'bg-rose-100 text-rose-700 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    teal: 'bg-teal-100 text-teal-700 border-teal-200'
  };
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${colors[color]}`}>
      {children}
    </span>
  );
}

/**
 * Button component
 */
function Button({ children, variant = 'primary', className = '', onClick, disabled }) {
  const baseStyle = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-teal-500 hover:bg-teal-600 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50',
    outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700',
    ai: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

/**
 * Map evaluation status from database to display format
 */
function mapStatusToDisplay(evaluationStatus) {
  switch (evaluationStatus) {
    case 'pending': return 'New';
    case 'evaluated': return 'Analyzed';
    case 'evaluating': return 'Processing';
    case 'failed': return 'Error';
    default: return evaluationStatus || 'New';
  }
}

/**
 * Map recommendation from database to Fit label
 */
function mapRecommendationToFitLabel(recommendation, score) {
  // Use score-based fit labels instead of ATS workflow stages
  if (score >= 85) return 'Strong Fit';
  if (score >= 70) return 'Possible Fit';
  if (score !== null && score !== undefined) return 'Weak Fit';
  // Fallback based on recommendation if no score
  switch (recommendation) {
    case 'INTERVIEW': return 'Strong Fit';
    case 'PHONE_SCREEN': return 'Possible Fit';
    case 'DECLINE': return 'Weak Fit';
    case 'ERROR': return 'Error';
    default: return null;
  }
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * WorkbenchPage - Main candidate management table
 */
export function WorkbenchPage() {
  const navigate = useNavigate();
  const { roleId } = useParams();

  // Fetch job details
  const { data: job, isLoading: jobLoading, error: jobError } = useJob(roleId);

  // Fetch candidates for this job
  const { data: candidates = [], isLoading: candidatesLoading, error: candidatesError, refetch: refetchCandidates } = useCandidates(roleId);

  // Batch evaluation mutation
  const batchEvaluate = useBatchEvaluate();

  // Local state
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailCandidate, setDetailCandidate] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [evaluationProgress, setEvaluationProgress] = useState({ current: 0, total: 0 });

  // Derived state
  const isLoading = jobLoading || candidatesLoading;
  const error = jobError || candidatesError;
  const activeRoleName = job?.title || 'Loading...';
  const analyzing = batchEvaluate.isPending;

  const toggleCandidateSelection = useCallback((id) => {
    setSelectedCandidates(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(candidates.map(c => c.id));
    }
  }, [selectedCandidates.length, candidates]);

  const runAIAnalysis = useCallback(async () => {
    if (selectedCandidates.length === 0 || !job) return;

    // Get candidates to evaluate
    const candidatesToEvaluate = candidates.filter(c => selectedCandidates.includes(c.id));

    setEvaluationProgress({ current: 0, total: candidatesToEvaluate.length });

    try {
      await batchEvaluate.mutateAsync({
        jobId: roleId,
        job: {
          title: job.title,
          description: job.description,
          must_have_requirements: job.must_have_requirements || [],
          preferred_requirements: job.preferred_requirements || []
        },
        candidates: candidatesToEvaluate.map(c => ({
          id: c.id,
          name: c.name || c.fullName,
          text: c.resumeText,
          email: c.email
        })),
        onProgress: (progress) => {
          setEvaluationProgress({
            current: progress.current,
            total: progress.total
          });
        }
      });

      // Clear selection after successful evaluation
      setSelectedCandidates([]);
      setEvaluationProgress({ current: 0, total: 0 });
    } catch (error) {
      console.error('Batch evaluation failed:', error);
      setEvaluationProgress({ current: 0, total: 0 });
    }
  }, [selectedCandidates, candidates, job, roleId, batchEvaluate]);

  const handleUploadSuccess = useCallback((count) => {
    console.log(`Successfully uploaded ${count} candidates`);
    setShowUploadModal(false);
    // Candidates list will auto-refresh via React Query invalidation
  }, []);

  const getScoreColor = (score) => {
    if (!score) return 'text-slate-400';
    if (score >= 85) return 'text-emerald-600 font-bold';
    if (score >= 70) return 'text-amber-600 font-bold';
    return 'text-rose-600 font-bold';
  };

  const filteredCandidates = candidates.filter(c =>
    (c.name || c.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-fade-in">
        <Loader2 size={48} className="text-teal-500 animate-spin mb-4" />
        <p className="text-slate-600">Loading candidates...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-fade-in">
        <AlertCircle size={48} className="text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Data</h2>
        <p className="text-slate-600 mb-4">{error.message}</p>
        <Button onClick={() => refetchCandidates()} variant="outline">
          <RefreshCw size={18} />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center shadow-sm z-10">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <span
              className="cursor-pointer hover:text-teal-600"
              onClick={() => navigate('/app')}
            >
              Dashboard
            </span>
            <ChevronRight size={14} />
            <span>{activeRoleName}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Candidate Workbench</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right mr-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Stage</div>
            <div className="font-medium text-teal-700 bg-teal-50 px-3 py-1 rounded-full text-sm">
              Resume Screening
            </div>
          </div>
          <Button variant="outline" onClick={() => setShowUploadModal(true)}>
            <UploadCloud size={18} />
            Upload Resumes
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-8 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="h-6 w-px bg-slate-300"></div>
          <span className="text-sm text-slate-600">
            Showing <strong>{filteredCandidates.length}</strong> candidates
          </span>
        </div>

        <div className={`transition-all duration-300 flex items-center gap-3 ${
          selectedCandidates.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-1 pointer-events-none'
        }`}>
          <span className="text-sm font-medium text-slate-700">
            {selectedCandidates.length} Selected
          </span>
          <Button
            onClick={runAIAnalysis}
            disabled={analyzing}
            variant="ai"
          >
            {analyzing ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                {evaluationProgress.total > 0
                  ? `Evaluating ${evaluationProgress.current}/${evaluationProgress.total}...`
                  : 'Starting...'}
              </span>
            ) : (
              <>
                <Sparkles size={16} />
                Run AI Analysis ({selectedCandidates.length * 5} Credits)
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white px-8 py-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <th className="py-3 pl-4 w-12">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  checked={selectedCandidates.length === candidates.length && candidates.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="py-3">Candidate</th>
              <th className="py-3">Date Uploaded</th>
              <th className="py-3">Evala Score</th>
              <th className="py-3">Fit</th>
              <th className="py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center">
                  <div className="flex flex-col items-center">
                    <UploadCloud size={48} className="text-slate-300 mb-4" />
                    <p className="text-slate-500 mb-2">No candidates yet</p>
                    <Button variant="outline" onClick={() => setShowUploadModal(true)}>
                      <UploadCloud size={18} />
                      Upload Resumes
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCandidates.map((candidate) => {
                const displayName = candidate.name || candidate.fullName || 'Unknown';
                const lastTitle = candidate.lastTitle || candidate.currentTitle || 'Title not extracted';
                const hasEvaluation = candidate.evaluationStatus === 'evaluated' && candidate.score !== null;
                const fitLabel = mapRecommendationToFitLabel(candidate.recommendation, candidate.score);
                const evaluation = candidate.evaluation;

                return (
                  <tr
                    key={candidate.id}
                    className={`hover:bg-slate-50 transition-colors group ${
                      selectedCandidates.includes(candidate.id) ? 'bg-indigo-50 hover:bg-indigo-50' : ''
                    }`}
                  >
                    <td className="py-4 pl-4">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => toggleCandidateSelection(candidate.id)}
                      />
                    </td>
                    <td className="py-4">
                      <div className="font-medium text-slate-900">{displayName}</div>
                      <div className="text-xs text-slate-500">{lastTitle}</div>
                    </td>
                    <td className="py-4 text-sm text-slate-600">{formatDate(candidate.createdAt)}</td>

                    <td className="py-4">
                      {hasEvaluation ? (
                        <div className="flex flex-col">
                          <span className={`text-lg ${getScoreColor(candidate.score)}`}>
                            {candidate.score}/100
                          </span>
                          {evaluation && (
                            <div className="flex gap-1 mt-1">
                              <div
                                title={`Confidence: ${evaluation.confidence || 'N/A'}`}
                                className={`w-2 h-2 rounded-full ${
                                  (evaluation.confidence || 0) >= 80 ? 'bg-emerald-400' : 'bg-amber-400'
                                }`}
                              ></div>
                              <div
                                title={`Strengths: ${(evaluation.keyStrengths || []).length}`}
                                className={`w-2 h-2 rounded-full ${
                                  (evaluation.keyStrengths || []).length > 2 ? 'bg-emerald-400' : 'bg-amber-400'
                                }`}
                              ></div>
                              <div
                                title={`Concerns: ${(evaluation.concerns || []).length}`}
                                className={`w-2 h-2 rounded-full ${
                                  (evaluation.concerns || []).length === 0 ? 'bg-emerald-400' : 'bg-rose-400'
                                }`}
                              ></div>
                            </div>
                          )}
                        </div>
                      ) : candidate.evaluationStatus === 'evaluating' ? (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full flex items-center w-fit gap-1">
                          <Loader2 size={12} className="animate-spin" /> Processing
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            if (!selectedCandidates.includes(candidate.id)) {
                              toggleCandidateSelection(candidate.id);
                            }
                          }}
                          className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition flex items-center w-fit gap-1"
                        >
                          <Sparkles size={12} /> Unlock
                        </button>
                      )}
                    </td>

                    <td className="py-4">
                      {fitLabel ? (
                        <Badge
                          color={
                            fitLabel === 'Strong Fit'
                              ? 'green'
                              : fitLabel === 'Weak Fit'
                              ? 'red'
                              : fitLabel === 'Error'
                              ? 'red'
                              : 'yellow'
                          }
                        >
                          {fitLabel}
                        </Badge>
                      ) : (
                        <span className="text-slate-400 text-sm">--</span>
                      )}
                    </td>

                    <td className="py-4 text-right pr-4">
                      {hasEvaluation ? (
                        <button
                          className="text-teal-600 hover:text-teal-800 font-medium text-sm"
                          onClick={() => setDetailCandidate(candidate)}
                        >
                          View Details
                        </button>
                      ) : (
                        <span className="text-slate-300">
                          <MoreHorizontal size={20} className="inline" />
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Candidate Detail Panel */}
      <CandidateDetailPanel
        candidate={detailCandidate}
        onClose={() => setDetailCandidate(null)}
        onUpdateStatus={(id, status) => {
          // Status updates are handled by the database via React Query
          // This will be refactored when we update CandidateDetailPanel
          console.log('Status update requested:', id, status);
        }}
      />

      {/* Resume Upload Modal */}
      <ResumeUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        jobId={roleId}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
