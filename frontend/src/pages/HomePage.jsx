import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { sessionStore } from '../services/storage/sessionStore'

export function HomePage() {
  const navigate = useNavigate()
  const hasActive = sessionStore.hasActiveEvaluation()

  const startNewEvaluation = () => {
    // Clear any existing evaluation
    sessionStore.clearEvaluation()
    // Create new and navigate to job input
    sessionStore.saveEvaluation(sessionStore.createNewEvaluation())
    navigate('/job-input')
  }

  const continueEvaluation = () => {
    navigate('/job-input')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-primary-600 rounded-full mb-4">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Resume Ranker</h1>
          <p className="text-lg text-gray-600">
            AI-powered batch resume evaluation for recruiters
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Upload Job & Resumes</h3>
              <p className="text-sm text-gray-600">Add job description and 1-50 candidate resumes</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Choose Evaluation Mode</h3>
              <p className="text-sm text-gray-600">Regex (free, instant) or AI (detailed, paid)</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Get Ranked Results</h3>
              <p className="text-sm text-gray-600">Download formatted evaluation report</p>
            </div>
          </div>
        </div>

        {hasActive && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              You have an evaluation in progress. Continue where you left off or start a new one.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          {hasActive && (
            <Button
              variant="secondary"
              onClick={continueEvaluation}
              className="flex-1"
            >
              Continue Evaluation
            </Button>
          )}
          <Button
            onClick={startNewEvaluation}
            className="flex-1"
          >
            Start New Evaluation
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
          <p>Supports PDF, DOCX, and TXT resume files</p>
          <p>ATS-agnostic • Works with Oracle, LinkedIn, career fairs</p>
        </div>
      </Card>
    </div>
  )
}
