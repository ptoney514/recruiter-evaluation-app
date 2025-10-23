import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { sessionStore } from '../services/storage/sessionStore'

export function ResultsPage() {
  const navigate = useNavigate()
  const [evaluation, setEvaluation] = useState(null)
  const [results, setResults] = useState(null)

  useEffect(() => {
    const current = sessionStore.getCurrentEvaluation()
    if (!current || !current.job.title || !current.resumes.length) {
      navigate('/')
      return
    }
    setEvaluation(current)

    // TODO: Replace with actual evaluation results
    // For now, show placeholder
    setResults({
      mode: 'regex', // or 'ai'
      candidates: current.resumes.map((resume, index) => ({
        name: resume.name,
        score: Math.floor(Math.random() * 40) + 60, // Random score 60-100
        recommendation: index < 2 ? 'ADVANCE TO INTERVIEW' : index < 5 ? 'PHONE SCREEN FIRST' : 'DECLINE',
        matchedKeywords: ['Python', 'React', '5+ years'],
        missingKeywords: ['PostgreSQL', 'AWS']
      })).sort((a, b) => b.score - a.score) // Sort by score descending
    })
  }, [navigate])

  const handleStartNew = () => {
    sessionStore.clearEvaluation()
    navigate('/')
  }

  const handleStage2 = () => {
    // TODO: Navigate to Stage 2 interview notes page
    alert('Stage 2 coming soon!')
  }

  if (!evaluation || !results) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Evaluating candidates...</p>
        </div>
      </div>
    )
  }

  const advanceCount = results.candidates.filter(c => c.recommendation === 'ADVANCE TO INTERVIEW').length
  const phoneScreenCount = results.candidates.filter(c => c.recommendation === 'PHONE SCREEN FIRST').length
  const declineCount = results.candidates.filter(c => c.recommendation === 'DECLINE').length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Evaluation Complete</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {evaluation.job.title} - Candidate Ranking
          </h1>
          <p className="text-gray-600">
            {results.candidates.length} candidates evaluated • {results.mode === 'ai' ? 'AI Detailed Analysis' : 'Regex Keyword Matching'}
          </p>
        </div>

        {/* Executive Summary */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Executive Summary</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{advanceCount}</div>
              <div className="text-sm text-gray-600">Advance to Interview</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-1">{phoneScreenCount}</div>
              <div className="text-sm text-gray-600">Phone Screen First</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-400 mb-1">{declineCount}</div>
              <div className="text-sm text-gray-600">Decline</div>
            </div>
          </div>
        </Card>

        {/* Ranked Results */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Candidate Rankings</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Candidate</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Score</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Recommendation</th>
                  {results.mode === 'regex' && (
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Matched</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {results.candidates.map((candidate, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4 text-gray-700">{index + 1}</td>
                    <td className="py-4 px-4 font-semibold text-gray-900">{candidate.name}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full font-bold ${
                        candidate.score >= 85 ? 'bg-green-100 text-green-700' :
                        candidate.score >= 70 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {candidate.score}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        candidate.recommendation === 'ADVANCE TO INTERVIEW' ? 'bg-green-100 text-green-800' :
                        candidate.recommendation === 'PHONE SCREEN FIRST' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {candidate.recommendation}
                      </span>
                    </td>
                    {results.mode === 'regex' && (
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="text-green-600">{candidate.matchedKeywords.join(', ')}</div>
                          {candidate.missingKeywords.length > 0 && (
                            <div className="text-gray-400 mt-1">Missing: {candidate.missingKeywords.join(', ')}</div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Detailed Analysis (placeholder for AI mode) */}
        {results.mode === 'ai' && (
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Detailed Analysis</h2>
            <div className="p-8 bg-gray-50 rounded-lg text-center text-gray-500">
              <p>Detailed per-candidate analysis with strengths, concerns, and interview questions will appear here.</p>
              <p className="text-sm mt-2">(Coming soon - will match your Claude Desktop markdown format)</p>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button variant="secondary" onClick={handleStartNew} className="flex-1">
            Start New Evaluation
          </Button>
          <Button variant="secondary" onClick={handleStage2} className="flex-1">
            Proceed to Stage 2 (Add Interview Notes)
          </Button>
          <Button className="flex-1">
            Download Report (Coming Soon)
          </Button>
        </div>

        {/* Note about regex mode */}
        {results.mode === 'regex' && advanceCount + phoneScreenCount > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Want Deeper Insights?</h3>
                <p className="text-sm text-blue-800">
                  You've identified {advanceCount + phoneScreenCount} potentially qualified candidates with regex matching.
                  Run AI evaluation on these candidates for detailed analysis, strengths/concerns, and tailored interview questions.
                </p>
                <Button variant="secondary" size="sm" className="mt-3">
                  Run AI on Top {advanceCount + phoneScreenCount} Candidates (~${((advanceCount + phoneScreenCount) * 0.003).toFixed(3)})
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
