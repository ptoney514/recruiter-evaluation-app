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
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 overflow-hidden relative">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '4s' }}></div>

      <Card glass className="max-w-3xl w-full relative z-10 animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-block p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl mb-6 shadow-2xl animate-float">
            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold mb-4">
            <span className="text-gradient">Resume Scanner Pro</span>
          </h1>
          <p className="text-xl text-gray-700 font-medium">
            AI-powered batch resume evaluation for modern recruiters
          </p>
        </div>

        <div className="space-y-5 mb-10">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all duration-300 group">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
              1
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Upload Job & Resumes</h3>
              <p className="text-base text-gray-700">Add job description and 1-50 candidate resumes in seconds</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all duration-300 group">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
              2
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Choose Evaluation Mode</h3>
              <p className="text-base text-gray-700">Quick regex matching (free) or deep AI analysis (premium)</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all duration-300 group">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
              3
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Get Ranked Results</h3>
              <p className="text-base text-gray-700">Download beautifully formatted evaluation reports instantly</p>
            </div>
          </div>
        </div>

        {hasActive && (
          <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-purple-200 rounded-2xl shadow-lg animate-slide-up">
            <p className="text-base text-gray-800 font-medium">
              ✨ You have an evaluation in progress. Continue where you left off or start fresh!
            </p>
          </div>
        )}

        <div className="flex gap-4">
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

        <div className="mt-10 pt-8 border-t border-white/30 text-center">
          <div className="flex justify-center gap-6 text-sm text-gray-700 font-medium">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📄</span>
              <span>PDF, DOCX, TXT</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span>Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
