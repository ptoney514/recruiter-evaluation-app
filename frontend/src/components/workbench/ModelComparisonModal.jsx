import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useModelComparison, useSaveQuickScore, getOllamaModels } from '../../hooks/useEvaluations';

/**
 * ModelComparisonModal - Side-by-side comparison of Ollama models
 * Helps determine best model for job complexity
 */
export function ModelComparisonModal({ isOpen, onClose, job, candidate, onScoreSaved }) {
  const [selectedModels, setSelectedModels] = useState(['phi3', 'mistral', 'llama3']);
  const [results, setResults] = useState(null);

  const ollamaModels = getOllamaModels();
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
      { job, candidate, models: selectedModels },
      {
        onSuccess: (data) => {
          if (data.success) {
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
        reasoning: modelResult.reasoning
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
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
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
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

              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${results.length}, 1fr)` }}>
                {results.map((result, index) => (
                  <div
                    key={result.model}
                    className={`p-4 rounded-xl border-2 ${
                      result.success
                        ? 'border-slate-200 bg-white'
                        : 'border-rose-200 bg-rose-50'
                    }`}
                  >
                    {/* Model Header */}
                    <div className="flex items-center justify-between mb-3">
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

                    {result.success ? (
                      <>
                        {/* Score */}
                        <div className="text-center py-4 mb-3 bg-slate-50 rounded-lg">
                          <div className={`text-4xl font-bold ${
                            result.score >= 85 ? 'text-emerald-600' :
                            result.score >= 70 ? 'text-amber-600' :
                            'text-rose-600'
                          }`}>
                            {result.score}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">Quick Score</div>
                        </div>

                        {/* Reasoning */}
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
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-rose-600 text-sm">
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
