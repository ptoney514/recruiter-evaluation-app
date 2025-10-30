import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { TextArea } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { ProgressModal } from '../components/ui/ProgressModal'
import { storageManager } from '../services/storage/storageManager'
import { sessionStore } from '../services/storage/sessionStore'
import { COST_PER_CANDIDATE_AI } from '../constants/config'
import { evaluationService } from '../services/evaluationService'

// LLM Provider configurations
const LLM_PROVIDERS = {
  anthropic: {
    name: 'Anthropic Claude',
    models: [
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', cost: 0.003 },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', cost: 0.015 },
    ]
  },
  openai: {
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', cost: 0.001 },
      { id: 'gpt-4o', name: 'GPT-4o', cost: 0.008 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', cost: 0.020 },
    ]
  }
}

export function ReviewPage() {
  const navigate = useNavigate()
  const [evaluation, setEvaluation] = useState(null)
  const [evaluationMode, setEvaluationMode] = useState('openai') // 'openai' or 'claude'
  const [llmProvider, setLlmProvider] = useState('openai')
  const [llmModel, setLlmModel] = useState('gpt-4o-mini')
  const [additionalInstructions, setAdditionalInstructions] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [progress, setProgress] = useState(null)
  const [showCostWarning, setShowCostWarning] = useState(false)

  useEffect(() => {
    async function loadEvaluation() {
      const current = await storageManager.getCurrentEvaluation()
      if (!current || !current.job?.title || !current.resumes?.length) {
        // Missing data, go back to start
        navigate('/')
        return
      }
      setEvaluation(current)
      setAdditionalInstructions(current.additionalInstructions || '')
      setLlmProvider(current.llmProvider || 'openai')
      setLlmModel(current.llmModel || 'gpt-4o-mini')
    }
    loadEvaluation()
  }, [navigate])

  // Handle evaluation mode change - sets provider and model
  const handleModeChange = (mode) => {
    setEvaluationMode(mode)
    if (mode === 'openai') {
      setLlmProvider('openai')
      setLlmModel('gpt-4o-mini')
    } else if (mode === 'claude') {
      setLlmProvider('anthropic')
      setLlmModel('claude-3-5-haiku-20241022')
    }
  }

  // Get current model cost
  const getCurrentModelCost = () => {
    const provider = LLM_PROVIDERS[llmProvider]
    const model = provider?.models.find(m => m.id === llmModel)
    return model?.cost || COST_PER_CANDIDATE_AI
  }

  const handleEvaluate = async () => {
    console.log('=== Starting Evaluation ===')
    console.log('Mode:', evaluationMode)
    console.log('LLM Provider:', llmProvider)
    console.log('LLM Model:', llmModel)
    console.log('Job:', evaluation.job)
    console.log('Candidates count:', evaluation.resumes.length)

    // Save additional instructions, mode, and LLM settings
    await storageManager.updateEvaluation({
      additionalInstructions,
      evaluationMode,
      llmProvider,
      llmModel
    })

    setIsEvaluating(true)

    try {
      console.log('Calling AI evaluation API...')
      // Initialize progress
      setProgress({ current: 0, total: evaluation.resumes.length, currentCandidate: '' })

      // Run AI evaluation with progress callback
      const results = await evaluationService.evaluateWithAI(
        evaluation.job,
        evaluation.resumes,
        {
          stage: evaluation.stage || 1,
          additionalInstructions,
          provider: llmProvider,
          model: llmModel,
          onProgress: (progressData) => setProgress(progressData)
        }
      )
      console.log('AI results received:', results)

      // Save results to storage (auto-routes to session or database)
      await storageManager.updateEvaluation({ aiResults: results })

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

  const estimatedCost = (evaluation.resumes.length * getCurrentModelCost()).toFixed(3)

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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose AI Model</h3>

          <div className="space-y-4">
            {/* OpenAI Mode (Fast & Cheap) */}
            <label
              className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                evaluationMode === 'openai'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="evaluationMode"
                  value="openai"
                  checked={evaluationMode === 'openai'}
                  onChange={(e) => handleModeChange(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">OpenAI GPT-4o Mini (Fast Screening)</span>
                    <span className="text-sm font-semibold text-green-600">${evaluationMode === 'openai' ? estimatedCost : (evaluation.resumes.length * 0.001).toFixed(3)}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Cheapest option (~$0.001/candidate). Fast AI-powered screening to quickly filter candidates. Great for initial evaluation of large batches.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Fastest</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Cheapest</span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">AI-Powered</span>
                  </div>
                </div>
              </div>
            </label>

            {/* Claude Mode (Deep Analysis) */}
            <label
              className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                evaluationMode === 'claude'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="evaluationMode"
                  value="claude"
                  checked={evaluationMode === 'claude'}
                  onChange={(e) => handleModeChange(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">Claude 3.5 Haiku (Deep Analysis)</span>
                    <span className="text-sm font-semibold text-primary-600">${evaluationMode === 'claude' ? estimatedCost : (evaluation.resumes.length * 0.003).toFixed(3)}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Premium analysis (~$0.003/candidate). Detailed scoring breakdown, strengths, concerns, and tailored interview questions. Best for final candidate evaluation.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">~30s per candidate</span>
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">Detailed Analysis</span>
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">Full Report</span>
                  </div>
                </div>
              </div>
            </label>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <p className="text-blue-800">
              💡 <strong>Recommended workflow:</strong> Start with OpenAI for fast screening, then run Claude on top 5-10 candidates for detailed analysis.
            </p>
          </div>
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

        {/* Cost Warning for Large Batches */}
        {evaluationMode === 'claude' && evaluation.resumes.length > 15 && (
          <Card className="mb-6 bg-yellow-50 border-yellow-300">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">Large Batch - Consider OpenAI First</h4>
                <p className="text-sm text-yellow-800 mb-2">
                  You're about to evaluate {evaluation.resumes.length} candidates with Claude. This will cost approximately ${estimatedCost} and take ~{Math.ceil(evaluation.resumes.length / 3 * 30)} seconds.
                </p>
                <p className="text-sm text-yellow-800">
                  <strong>Tip:</strong> Consider running OpenAI screening first (3x cheaper) to filter candidates, then run Claude on top 5-10 performers.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="secondary" onClick={handleBack}>
            Back
          </Button>
          <Button onClick={handleEvaluate} disabled={isEvaluating}>
            {isEvaluating ? 'Evaluating...' : `Run ${evaluationMode === 'openai' ? 'OpenAI' : 'Claude'} Evaluation`}
          </Button>
        </div>
      </div>

      {/* Progress Modal */}
      <ProgressModal isOpen={isEvaluating} progress={progress} />
    </div>
  )
}
