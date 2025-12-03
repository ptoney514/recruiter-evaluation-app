import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp, FileText, Target, CheckCheck, XCircle, AlertTriangle } from 'lucide-react';
import { useModelComparison, useSaveQuickScore, getOllamaModels } from '../../hooks/useEvaluations';

/**
 * ModelComparisonModal - Side-by-side comparison of Ollama models
 * Helps determine best model for job complexity
 */
export function ModelComparisonModal({ isOpen, onClose, job, candidate, onScoreSaved }) {
  const [selectedModels, setSelectedModels] = useState(['phi3', 'mistral', 'llama3']);
  const [results, setResults] = useState(null);
  const [showInputs, setShowInputs] = useState(true);
  const [expandedResults, setExpandedResults] = useState({});

  const ollamaModels = getOllamaModels();

  // Toggle expanded view for a specific model result
  const toggleExpanded = (modelId) => {
    setExpandedResults(prev => ({
      ...prev,
      [modelId]: !prev[modelId]
    }));
  };
  const { mutate: runComparison, isPending: isComparing } = useModelComparison();
  const { mutate: saveScore, isPending: isSaving } = useSaveQuickScore();

  // Reset results when modal opens with new candidate
  useEffect(() => {
    if (isOpen) {
      setResults(null);
    }
  }, [isOpen, candidate?.id]);

  const handleModelToggle = (modelId) => {
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        // Don't allow deselecting all
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== modelId);
      }
      return [...prev, modelId];
    });
  };

  const handleRunComparison = () => {
    if (!job || !candidate || selectedModels.length === 0) return;

    runComparison(
      { candidateId: candidate.id, jobId: job.id, models: selectedModels },
      {
        onSuccess: (data) => {
          if (data.results) {
            setResults(data.results);
          }
        }
      }
    );
  };

  const handleUseScore = (modelResult) => {
    if (!candidate?.id) return;

    saveScore(
      {
        candidateId: candidate.id,
        score: modelResult.score,
        model: modelResult.model,
        reasoning: modelResult.reasoning,
        requirements_identified: modelResult.requirements_identified,
        match_analysis: modelResult.match_analysis,
        methodology: modelResult.methodology,
        evaluated_at: modelResult.evaluated_at,
        // A-T-Q scores
        a_score: modelResult.a_score,
        t_score: modelResult.t_score,
        q_score: modelResult.q_score
      },
      {
        onSuccess: () => {
          if (onScoreSaved) {
            onScoreSaved(candidate.id, modelResult.score, modelResult.model);
          }
          onClose();
        }
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="text-indigo-500" size={20} />
              Model Comparison
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Compare Quick Score results from different Ollama models
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Candidate Info */}
          <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Candidate</div>
                <div className="font-semibold text-slate-900">{candidate?.name || 'Unknown'}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Job</div>
                <div className="font-semibold text-slate-900">{job?.title || 'Unknown'}</div>
              </div>
            </div>
          </div>

          {/* Inputs Section - What the models are evaluating */}
          <div className="mb-6 border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowInputs(!showInputs)}
              className="w-full px-4 py-3 bg-slate-100 flex items-center justify-between hover:bg-slate-150 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-slate-600" />
                <span className="font-medium text-slate-700">Evaluation Inputs</span>
                <span className="text-xs text-slate-500">(what models are comparing against)</span>
              </div>
              {showInputs ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
            </button>

            {showInputs && (
              <div className="p-4 bg-white space-y-4">
                {/* Must-Have Requirements */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={14} className="text-rose-500" />
                    <span className="text-sm font-semibold text-slate-700">Must-Have Requirements</span>
                    <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                      {job?.must_have_requirements?.length || job?.mustHaveRequirements?.length || 0}
                    </span>
                  </div>
                  <ul className="space-y-1 pl-5">
                    {(job?.must_have_requirements || job?.mustHaveRequirements || []).map((req, idx) => (
                      <li key={idx} className="text-sm text-slate-600 list-disc">{req}</li>
                    ))}
                    {!(job?.must_have_requirements || job?.mustHaveRequirements || []).length && (
                      <li className="text-sm text-slate-400 italic">No must-have requirements specified</li>
                    )}
                  </ul>
                </div>

                {/* Preferred Requirements */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={14} className="text-amber-500" />
                    <span className="text-sm font-semibold text-slate-700">Preferred Requirements</span>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      {job?.preferred_requirements?.length || job?.preferredRequirements?.length || 0}
                    </span>
                  </div>
                  <ul className="space-y-1 pl-5">
                    {(job?.preferred_requirements || job?.preferredRequirements || []).map((req, idx) => (
                      <li key={idx} className="text-sm text-slate-600 list-disc">{req}</li>
                    ))}
                    {!(job?.preferred_requirements || job?.preferredRequirements || []).length && (
                      <li className="text-sm text-slate-400 italic">No preferred requirements specified</li>
                    )}
                  </ul>
                </div>

                {/* Resume Preview */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={14} className="text-indigo-500" />
                    <span className="text-sm font-semibold text-slate-700">Resume Text</span>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      {(candidate?.resumeText || candidate?.resume_text || '').length.toLocaleString()} chars
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded p-3 max-h-32 overflow-y-auto">
                    <p className="text-xs text-slate-600 whitespace-pre-wrap font-mono">
                      {(candidate?.resumeText || candidate?.resume_text || 'No resume text available').slice(0, 500)}
                      {(candidate?.resumeText || candidate?.resume_text || '').length > 500 && '...'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Model Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Select Models to Compare</h3>
            <div className="flex gap-3">
              {ollamaModels.map(model => (
                <button
                  key={model.id}
                  onClick={() => handleModelToggle(model.id)}
                  disabled={isComparing}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    selectedModels.includes(model.id)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  } ${isComparing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-medium text-slate-900">{model.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{model.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Run Button */}
          {!results && (
            <div className="flex justify-center mb-6">
              <button
                onClick={handleRunComparison}
                disabled={isComparing || selectedModels.length === 0}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                  isComparing || selectedModels.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isComparing ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Running Comparison...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Run Comparison ({selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''})
                  </>
                )}
              </button>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={16} />
                Results
              </h3>

              {/* Summary Stats Bar */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500">Score Range:</span>
                    <span className="font-semibold text-slate-700">
                      {Math.min(...results.filter(r => r.success).map(r => r.score))} - {Math.max(...results.filter(r => r.success).map(r => r.score))}
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500">Variance:</span>
                    <span className="font-semibold text-slate-700">
                      {results.filter(r => r.success).length > 1
                        ? `±${Math.round((Math.max(...results.filter(r => r.success).map(r => r.score)) - Math.min(...results.filter(r => r.success).map(r => r.score))) / 2)}`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="text-slate-500">
                    Click "View Analysis Details" to see how each model evaluated the requirements
                  </div>
                </div>
              </div>

              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${results.length}, 1fr)` }}>
                {results.map((result, index) => (
                  <div
                    key={result.model}
                    className={`rounded-xl border-2 overflow-hidden ${
                      result.success
                        ? 'border-slate-200 bg-white'
                        : 'border-rose-200 bg-rose-50'
                    }`}
                  >
                    {/* Model Header */}
                    <div className="p-4 border-b border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-slate-900">
                          {ollamaModels.find(m => m.id === result.model)?.name || result.model}
                        </div>
                        {result.success && result.elapsed_seconds && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock size={12} />
                            {result.elapsed_seconds.toFixed(1)}s
                          </div>
                        )}
                      </div>

                      {result.success && (
                        <>
                          {/* Overall Score */}
                          <div className="text-center py-3 bg-slate-50 rounded-lg mb-3">
                            <div className={`text-4xl font-bold ${
                              result.score >= 85 ? 'text-emerald-600' :
                              result.score >= 70 ? 'text-amber-600' :
                              'text-rose-600'
                            }`}>
                              {result.score}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">Quick Score</div>
                          </div>

                          {/* A-T-Q Breakdown */}
                          <div className="flex justify-around py-2 bg-slate-50 rounded-lg text-center">
                            <div>
                              <div className="text-lg font-bold text-slate-800">{result.a_score || '--'}</div>
                              <div className="text-[10px] text-slate-400">A (50%)</div>
                            </div>
                            <div className="w-px bg-slate-200"></div>
                            <div>
                              <div className="text-lg font-bold text-slate-800">{result.t_score || '--'}</div>
                              <div className="text-[10px] text-slate-400">T (30%)</div>
                            </div>
                            <div className="w-px bg-slate-200"></div>
                            <div>
                              <div className="text-lg font-bold text-slate-800">{result.q_score || '--'}</div>
                              <div className="text-[10px] text-slate-400">Q (20%)</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {result.success ? (
                      <div className="p-4">
                        {/* Expandable Analysis Section */}
                        <button
                          onClick={() => toggleExpanded(result.model)}
                          className="w-full flex items-center justify-between text-left mb-3 text-sm font-medium text-slate-600 hover:text-slate-800"
                        >
                          <span>View Analysis Details</span>
                          {expandedResults[result.model] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {expandedResults[result.model] && (
                          <div className="space-y-4 mb-4 animate-in slide-in-from-top-2">
                            {/* What model identified as requirements */}
                            {result.requirements_identified && (
                              <div className="text-xs">
                                <div className="font-semibold text-slate-600 mb-2 flex items-center gap-1">
                                  <Target size={12} />
                                  Requirements Model Identified
                                </div>
                                {result.requirements_identified.must_have?.length > 0 && (
                                  <div className="mb-2">
                                    <span className="text-rose-600 font-medium">Must-Have:</span>
                                    <ul className="mt-1 space-y-0.5 pl-3">
                                      {result.requirements_identified.must_have.map((req, i) => (
                                        <li key={i} className="text-slate-600 list-disc">{req}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {result.requirements_identified.preferred?.length > 0 && (
                                  <div>
                                    <span className="text-amber-600 font-medium">Preferred:</span>
                                    <ul className="mt-1 space-y-0.5 pl-3">
                                      {result.requirements_identified.preferred.map((req, i) => (
                                        <li key={i} className="text-slate-600 list-disc">{req}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Match Analysis - How each requirement was evaluated */}
                            {result.match_analysis?.length > 0 && (
                              <div className="text-xs">
                                <div className="font-semibold text-slate-600 mb-2 flex items-center gap-1">
                                  <CheckCheck size={12} />
                                  Match Analysis
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {result.match_analysis.map((match, i) => (
                                    <div
                                      key={i}
                                      className={`p-2 rounded border-l-2 ${
                                        match.status === 'MET' ? 'border-emerald-500 bg-emerald-50' :
                                        match.status === 'PARTIAL' ? 'border-amber-500 bg-amber-50' :
                                        match.status === 'NOT_MET' ? 'border-rose-500 bg-rose-50' :
                                        'border-slate-300 bg-slate-50'
                                      }`}
                                    >
                                      <div className="flex items-start gap-2">
                                        {match.status === 'MET' && <CheckCheck size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />}
                                        {match.status === 'PARTIAL' && <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />}
                                        {match.status === 'NOT_MET' && <XCircle size={14} className="text-rose-600 mt-0.5 flex-shrink-0" />}
                                        {!['MET', 'PARTIAL', 'NOT_MET'].includes(match.status) && <AlertCircle size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />}
                                        <div className="flex-1">
                                          <div className="font-medium text-slate-700">{match.requirement}</div>
                                          <div className="text-slate-500 mt-0.5">{match.evidence}</div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Methodology */}
                            {result.methodology && (
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                <span className="font-medium">Scoring:</span> {result.methodology}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Reasoning Summary (always visible) */}
                        <div className="mb-4">
                          <div className="text-xs font-medium text-slate-500 mb-1">Reasoning</div>
                          <p className="text-sm text-slate-700 line-clamp-4">
                            {result.reasoning || 'No reasoning provided'}
                          </p>
                        </div>

                        {/* Use This Score Button */}
                        <button
                          onClick={() => handleUseScore(result)}
                          disabled={isSaving}
                          className="w-full py-2 px-4 rounded-lg border-2 border-indigo-500 text-indigo-600 font-medium hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSaving ? 'Saving...' : 'Use This Score'}
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 flex items-center gap-2 text-rose-600 text-sm">
                        <AlertCircle size={16} />
                        {result.error || 'Evaluation failed'}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Run Again Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setResults(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-50"
                >
                  Run Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
