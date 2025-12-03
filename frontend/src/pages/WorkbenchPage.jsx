import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight,
  Search,
  UploadCloud,
  Sparkles,
  MoreVertical,
  AlertCircle,
  Loader2,
  RefreshCw,
  Trash2,
  Eye,
  GitCompare
} from 'lucide-react';
import { CandidateDetailPanel } from '../components/workbench/CandidateDetailPanel';
import { ResumeUploadModal } from '../components/workbench/ResumeUploadModal';
import { ModelComparisonModal } from '../components/workbench/ModelComparisonModal';
import { useCandidates, useDeleteCandidate } from '../hooks/useCandidates';
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
 * Get the best available score for fit calculation
 * Priority: Stage 2 > Stage 1 > Quick Score
 */
function getBestScore(candidate) {
  if (candidate.stage2Score !== null && candidate.stage2Score !== undefined) {
    return { score: candidate.stage2Score, source: 'S2' };
  }
  if (candidate.stage1Score !== null && candidate.stage1Score !== undefined) {
    return { score: candidate.stage1Score, source: 'S1' };
  }
  if (candidate.quickScore !== null && candidate.quickScore !== undefined) {
    return { score: candidate.quickScore, source: 'Quick' };
  }
  // Fallback to legacy score
  if (candidate.score !== null && candidate.score !== undefined) {
    return { score: candidate.score, source: 'Legacy' };
  }
  return { score: null, source: null };
}

/**
 * Map score to Fit label
 */
function getFitLabel(score) {
  if (score === null || score === undefined) return null;
  if (score >= 85) return 'Strong Fit';
  if (score >= 70) return 'Possible Fit';
  return 'Weak Fit';
}

/**
 * Get rank medal for top candidates
 */
function getRankDisplay(rank) {
  if (rank === 1) return { medal: '🥇', text: '#1' };
  if (rank === 2) return { medal: '🥈', text: '#2' };
  if (rank === 3) return { medal: '🥉', text: '#3' };
  return { medal: null, text: `#${rank}` };
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
 * Actions Dropdown Menu component
 */
function ActionsDropdown({ candidate, onViewDetails, onCompareModels, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasEvaluation = candidate.evaluationStatus === 'evaluated' ||
    candidate.quickScore !== null ||
    candidate.stage1Score !== null ||
    candidate.stage2Score !== null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
          <button
            onClick={() => {
              onViewDetails(candidate);
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <Eye size={16} />
            View Details
          </button>
          <button
            onClick={() => {
              onCompareModels(candidate);
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <GitCompare size={16} />
            Compare Models
          </button>
          <div className="border-t border-slate-100 my-1" />
          <button
            onClick={() => {
              onDelete(candidate.id, candidate.name || candidate.fullName);
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
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

  // Delete candidate mutation
  const deleteCandidate = useDeleteCandidate();

  // Local state
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailCandidate, setDetailCandidate] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [comparisonCandidate, setComparisonCandidate] = useState(null);
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

    setEvaluationProgress({ current: 0, total: selectedCandidates.length });

    try {
      await batchEvaluate.mutateAsync({
        candidateIds: selectedCandidates,
        jobId: roleId,
        options: {
          onProgress: (progress) => {
            setEvaluationProgress({
              current: progress.current,
              total: progress.total
            });
          }
        }
      });

      // Clear selection after successful evaluation
      setSelectedCandidates([]);
      setEvaluationProgress({ current: 0, total: 0 });

      // Explicitly refetch candidates to ensure UI updates
      await refetchCandidates();
    } catch (error) {
      console.error('Batch evaluation failed:', error);
      setEvaluationProgress({ current: 0, total: 0 });
    }
  }, [selectedCandidates, job, roleId, batchEvaluate, refetchCandidates]);

  const handleUploadSuccess = useCallback((count) => {
    console.log(`Successfully uploaded ${count} candidates`);
    setShowUploadModal(false);
    // Candidates list will auto-refresh via React Query invalidation
  }, []);

  const handleCompareModels = useCallback((candidate) => {
    setComparisonCandidate(candidate);
    setShowComparisonModal(true);
  }, []);

  const handleScoreSaved = useCallback((candidateId, score, model) => {
    console.log(`Score saved for ${candidateId}: ${score} (${model})`);
    refetchCandidates();
  }, [refetchCandidates]);

  const handleDeleteCandidate = useCallback(async (candidateId, candidateName) => {
    if (!window.confirm(`Are you sure you want to delete ${candidateName}? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteCandidate.mutateAsync({ candidateId, jobId: roleId });
      // Remove from selection if selected
      setSelectedCandidates(prev => prev.filter(id => id !== candidateId));
    } catch (error) {
      console.error('Failed to delete candidate:', error);
      alert('Failed to delete candidate. Please try again.');
    }
  }, [deleteCandidate, roleId]);

  const getScoreColor = (score) => {
    if (!score) return 'text-slate-400';
    if (score >= 85) return 'text-emerald-600 font-bold';
    if (score >= 70) return 'text-amber-600 font-bold';
    return 'text-rose-600 font-bold';
  };

  // Filter and sort candidates by best score (descending)
  const filteredCandidates = candidates
    .filter(c => (c.name || c.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()))
    .map(c => ({ ...c, bestScore: getBestScore(c) }))
    .sort((a, b) => {
      // Sort by best score descending (nulls last)
      const scoreA = a.bestScore.score;
      const scoreB = b.bestScore.score;
      if (scoreA === null && scoreB === null) return 0;
      if (scoreA === null) return 1;
      if (scoreB === null) return -1;
      return scoreB - scoreA;
    });

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
                Run Evala S1
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
              <th className="py-3 w-16">Rank</th>
              <th className="py-3">Candidate</th>
              <th className="py-3 w-28">Quick Score</th>
              <th className="py-3 w-36">Evala Score</th>
              <th className="py-3 w-36">
                <span title="Accomplishments (50%) + Trajectory (30%) + Qualifications (20%)">A-T-Q</span>
              </th>
              <th className="py-3 w-28">Fit</th>
              <th className="py-3 w-16 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center">
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
              filteredCandidates.map((candidate, index) => {
                const displayName = candidate.name || candidate.fullName || 'Unknown';
                const rank = index + 1;
                const rankDisplay = getRankDisplay(rank);
                const fitLabel = getFitLabel(candidate.bestScore.score);

                return (
                  <tr
                    key={candidate.id}
                    className={`hover:bg-slate-50 transition-colors group ${
                      selectedCandidates.includes(candidate.id) ? 'bg-indigo-50 hover:bg-indigo-50' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-4 pl-4">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => toggleCandidateSelection(candidate.id)}
                      />
                    </td>

                    {/* Rank */}
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        {rankDisplay.medal && (
                          <span className="text-lg">{rankDisplay.medal}</span>
                        )}
                        <span className={`font-semibold ${rank <= 3 ? 'text-slate-800' : 'text-slate-500'}`}>
                          {rankDisplay.text}
                        </span>
                      </div>
                    </td>

                    {/* Candidate Name */}
                    <td className="py-4">
                      <div className="font-medium text-slate-900">{displayName}</div>
                    </td>

                    {/* Quick Score */}
                    <td className="py-4">
                      {candidate.quickScore !== null && candidate.quickScore !== undefined ? (
                        <div
                          className={`text-lg font-bold ${getScoreColor(candidate.quickScore)}`}
                          title={candidate.quickScoreModel ? `Model: ${candidate.quickScoreModel}` : undefined}
                        >
                          {candidate.quickScore}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">--</span>
                      )}
                    </td>

                    {/* Evala Score (S1 / S2) */}
                    <td className="py-4">
                      <div className="flex items-center gap-3 text-sm">
                        <div>
                          <span className="text-slate-500">S1:</span>{' '}
                          {candidate.stage1Score !== null && candidate.stage1Score !== undefined ? (
                            <span className={`font-bold ${getScoreColor(candidate.stage1Score)}`}>
                              {Math.round(candidate.stage1Score)}
                            </span>
                          ) : (
                            <span className="text-slate-400">--</span>
                          )}
                        </div>
                        <div>
                          <span className="text-slate-500">S2:</span>{' '}
                          {candidate.stage2Score !== null && candidate.stage2Score !== undefined ? (
                            <span className={`font-bold ${getScoreColor(candidate.stage2Score)}`}>
                              {Math.round(candidate.stage2Score)}
                            </span>
                          ) : (
                            <span className="text-slate-400">--</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* A-T-Q Breakdown */}
                    <td className="py-4">
                      {(candidate.stage1AScore || candidate.stage1TScore || candidate.stage1QScore) ? (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium text-slate-700" title="Accomplishments">
                            A:{candidate.stage1AScore || '--'}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="font-medium text-slate-700" title="Trajectory">
                            T:{candidate.stage1TScore || '--'}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="font-medium text-slate-700" title="Qualifications">
                            Q:{candidate.stage1QScore || '--'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">--</span>
                      )}
                    </td>

                    {/* Fit */}
                    <td className="py-4">
                      {fitLabel ? (
                        <Badge
                          color={
                            fitLabel === 'Strong Fit'
                              ? 'green'
                              : fitLabel === 'Weak Fit'
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

                    {/* Actions */}
                    <td className="py-4 text-center">
                      <ActionsDropdown
                        candidate={candidate}
                        onViewDetails={setDetailCandidate}
                        onCompareModels={handleCompareModels}
                        onDelete={handleDeleteCandidate}
                      />
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

      {/* Model Comparison Modal */}
      <ModelComparisonModal
        isOpen={showComparisonModal}
        onClose={() => {
          setShowComparisonModal(false);
          setComparisonCandidate(null);
        }}
        job={job}
        candidate={comparisonCandidate}
        onScoreSaved={handleScoreSaved}
      />
    </div>
  );
}
