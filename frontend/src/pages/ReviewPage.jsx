import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { TextArea } from '../components/ui/Input'
import { sessionStore } from '../services/storage/sessionStore'
import { COST_PER_CANDIDATE_AI } from '../constants/config'
import { evaluationService } from '../services/evaluationService'

export function ReviewPage() {
  const navigate = useNavigate()
  const [evaluation, setEvaluation] = useState(null)
  const [evaluationMode, setEvaluationMode] = useState('regex') // 'regex' or 'ai'
  const [additionalInstructions, setAdditionalInstructions] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)

  useEffect(() => {
    const current = sessionStore.getCurrentEvaluation()
    if (!current || !current.job.title || !current.resumes.length) {
      // Missing data, go back to start
      navigate('/')
      return
    }
    setEvaluation(current)
    setAdditionalInstructions(current.additionalInstructions || '')
  }, [navigate])

  const handleEvaluate = async () => {
    console.log('=== Starting Evaluation ===')
    console.log('Mode:', evaluationMode)
    console.log('Job:', evaluation.job)
    console.log('Candidates count:', evaluation.resumes.length)

    // Save additional instructions and mode
    sessionStore.updateEvaluation({
      additionalInstructions,
      evaluationMode
    })

    setIsEvaluating(true)

    try {
      let results

      if (evaluationMode === 'regex') {
        console.log('Calling regex evaluation API...')
        // Run regex evaluation
        results = await evaluationService.evaluateWithRegex(
          evaluation.job,
          evaluation.resumes
        )
        console.log('Regex results received:', results)
      } else {
        console.log('Calling AI evaluation API...')
        // Run AI evaluation
        results = await evaluationService.evaluateWithAI(
          evaluation.job,
          evaluation.resumes,
          {
            stage: evaluation.stage || 1,
            additionalInstructions
          }
        )
        console.log('AI results received:', results)
      }

      // Save results to session storage
      if (evaluationMode === 'regex') {
        sessionStore.updateEvaluation({ regexResults: results })
      } else {
        sessionStore.updateEvaluation({ aiResults: results })
      }

      console.log('Navigating to results page...')
      // Navigate to results
      navigate('/results')

    } catch (error) {
      console.error('=== Evaluation Error ===')
      console.error('Error type:', error.constructor.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      console.error('Full error:', error)
      alert(`Evaluation failed: ${error.message}`)
    } finally {
      setIsEvaluating(false)
      console.log('=== Evaluation Complete ===')
    }
  }

  const handleBack = () => {
    navigate('/upload-resumes')
  }

  if (!evaluation) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const estimatedCost = evaluationMode === 'ai'
    ? (evaluation.resumes.length * COST_PER_CANDIDATE_AI).toFixed(3)
    : '0.00'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-primary-600 font-semibold">Step 3 of 3</span>
            <span className="text-gray-500">Review & Evaluate</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary-600 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review & Evaluate</h1>
        <p className="text-gray-600 mb-8">
          Review your setup and choose how to evaluate candidates
        </p>

        {/* Job Summary */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-semibold text-gray-600">Title:</span>
              <p className="text-gray-900">{evaluation.job.title}</p>
            </div>
            {evaluation.job.summary && (
              <div>
                <span className="text-sm font-semibold text-gray-600">Summary:</span>
                <p className="text-gray-700 text-sm">{evaluation.job.summary}</p>
              </div>
            )}
            {evaluation.job.requirements.length > 0 && (
              <div>
                <span className="text-sm font-semibold text-gray-600">Requirements ({evaluation.job.requirements.length}):</span>
                <ul className="mt-1 space-y-1">
                  {evaluation.job.requirements.slice(0, 3).map((req, i) => (
                    <li key={i} className="text-sm text-gray-700">• {req}</li>
                  ))}
                  {evaluation.job.requirements.length > 3 && (
                    <li className="text-sm text-gray-500">...and {evaluation.job.requirements.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </Card>

        {/* Resumes Summary */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Candidates ({evaluation.resumes.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {evaluation.resumes.map((resume, i) => (
              <div key={resume.id} className="text-sm text-gray-700 truncate">
                {i + 1}. {resume.name}
              </div>
            ))}
          </div>
        </Card>

        {/* Evaluation Mode Selection */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Evaluation Mode</h3>

          <div className="space-y-4">
            {/* Regex Mode */}
            <label
              className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                evaluationMode === 'regex'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="evaluationMode"
                  value="regex"
                  checked={evaluationMode === 'regex'}
                  onChange={(e) => setEvaluationMode(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">Regex Evaluation (Free)</span>
                    <span className="text-sm font-semibold text-green-600">$0.00</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Instant keyword matching against job requirements. Fast filtering to identify strong candidates. Best for initial screening of large batches.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Instant</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Free</span>
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Basic</span>
                  </div>
                </div>
              </div>
            </label>

            {/* AI Mode */}
            <label
              className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                evaluationMode === 'ai'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="evaluationMode"
                  value="ai"
                  checked={evaluationMode === 'ai'}
                  onChange={(e) => setEvaluationMode(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">AI Evaluation (Claude Haiku)</span>
                    <span className="text-sm font-semibold text-primary-600">${estimatedCost}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Detailed analysis with scoring breakdown, strengths, concerns, and tailored interview questions. Matches your current Claude Desktop workflow.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">~30s per candidate</span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">Detailed</span>
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">Full Report</span>
                  </div>
                </div>
              </div>
            </label>
          </div>

          {evaluationMode === 'ai' && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              <p className="text-blue-800">
                💡 <strong>Tip:</strong> Start with Regex (free) to filter candidates, then run AI evaluation on top performers only to save costs.
              </p>
            </div>
          )}
        </Card>

        {/* Additional Instructions */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Additional Instructions (Optional)
          </h3>
          <TextArea
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            rows={4}
            placeholder="Any specific context or criteria to consider during evaluation? (e.g., 'Prioritize candidates with Catholic university experience' or 'Red flag if multiple short-term jobs')"
          />
        </Card>

        {/* Summary Box */}
        <Card className="mb-8 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Ready to evaluate:</div>
              <div className="text-2xl font-bold text-gray-900">
                {evaluation.resumes.length} {evaluation.resumes.length === 1 ? 'Candidate' : 'Candidates'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Estimated cost:</div>
              <div className="text-2xl font-bold text-primary-600">${estimatedCost}</div>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="secondary" onClick={handleBack}>
            Back
          </Button>
          <Button onClick={handleEvaluate} disabled={isEvaluating}>
            {isEvaluating ? 'Evaluating...' : `Run ${evaluationMode === 'ai' ? 'AI' : 'Regex'} Evaluation`}
          </Button>
        </div>
      </div>
    </div>
  )
}
