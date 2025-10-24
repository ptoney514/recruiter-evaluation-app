/**
 * Progress Modal Component
 * Displays progress for AI evaluation batch processing
 */

export function ProgressModal({ isOpen, progress }) {
  if (!isOpen) return null

  const { current = 0, total = 0, currentCandidate = '' } = progress || {}
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-primary-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Evaluating Candidates with AI
          </h3>
          <p className="text-sm text-gray-600">
            This may take a few moments. Please don't close this window.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span className="font-medium">
              {current} of {total} candidates
            </span>
            <span className="font-semibold text-primary-600">
              {percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Current Candidate */}
        {currentCandidate && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Currently evaluating
                </p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {currentCandidate}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estimated Time */}
        {total > current && current > 0 && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Estimated time remaining: ~{Math.ceil((total - current) * 15)} seconds
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
