import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { sessionStore } from '../services/storage/sessionStore'
import { exportService } from '../services/exportService'

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

    // Get actual results based on evaluation mode
    const mode = current.evaluationMode || 'regex'
    const evaluationResults = mode === 'regex' ? current.regexResults : current.aiResults

    if (evaluationResults) {
      setResults({
        mode,
        ...evaluationResults
      })
    } else {
      // No results yet, shouldn't happen
      navigate('/review')
    }
  }, [navigate])

  const handleStartNew = () => {
    sessionStore.clearEvaluation()
    navigate('/')
  }

  const handleStage2 = () => {
    // TODO: Navigate to Stage 2 interview notes page
    alert('Stage 2 coming soon!')
  }

  const handleExportExcel = () => {
    try {
      const filename = exportService.exportToExcel(evaluation, results, results.mode)
      alert(`✅ Excel file exported successfully: ${filename}`)
    } catch (error) {
      console.error('Export to Excel failed:', error)
      alert(`❌ Export failed: ${error.message}`)
    }
  }

  const handleExportPDF = () => {
    try {
      const filename = exportService.exportToPDF(evaluation, results, results.mode)
      alert(`✅ PDF file exported successfully: ${filename}`)
    } catch (error) {
      console.error('Export to PDF failed:', error)
      alert(`❌ Export failed: ${error.message}`)
    }
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

  const candidates = results.results || results.candidates || []

  // Handle both camelCase (AI) and snake_case (regex) summary fields
  const advanceCount = results.summary?.advanceToInterview ??
                        results.summary?.advance_to_interview ??
                        candidates.filter(c => c?.recommendation === 'ADVANCE TO INTERVIEW').length

  const phoneScreenCount = results.summary?.phoneScreen ??
                           results.summary?.phone_screen ??
                           candidates.filter(c => c?.recommendation === 'PHONE SCREEN FIRST').length

  const declineCount = results.summary?.declined ??
                       candidates.filter(c => c?.recommendation === 'DECLINE').length

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
            {candidates.length} candidates evaluated • {results.mode === 'ai' ? 'AI Detailed Analysis' : 'Regex Keyword Matching'}
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
                {candidates.map((candidate, index) => (
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

        {/* AI Cost Summary */}
        {results.mode === 'ai' && results.usage && (
          <Card className="mb-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Evaluation Summary</h2>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Cost</div>
                <div className="text-2xl font-bold text-blue-600">${results.usage.cost.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Avg per Candidate</div>
                <div className="text-lg font-semibold text-gray-700">${results.usage.avgCostPerCandidate.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Input Tokens</div>
                <div className="text-lg font-semibold text-gray-700">{results.usage.inputTokens.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Output Tokens</div>
                <div className="text-lg font-semibold text-gray-700">{results.usage.outputTokens.toLocaleString()}</div>
              </div>
            </div>
          </Card>
        )}

        {/* Detailed Analysis for AI mode */}
        {results.mode === 'ai' && (
          <div className="space-y-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Detailed AI Analysis</h2>
            {candidates.map((candidate, index) => (
              <Card key={index} className="overflow-hidden">
                {/* Candidate Header */}
                <div className={`p-4 ${
                  candidate.recommendation === 'ADVANCE TO INTERVIEW' ? 'bg-green-50 border-b border-green-200' :
                  candidate.recommendation === 'PHONE SCREEN FIRST' ? 'bg-yellow-50 border-b border-yellow-200' :
                  candidate.recommendation === 'ERROR' ? 'bg-red-50 border-b border-red-200' :
                  'bg-gray-50 border-b border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        #{index + 1} {candidate.name}
                      </h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${
                        candidate.recommendation === 'ADVANCE TO INTERVIEW' ? 'bg-green-100 text-green-800' :
                        candidate.recommendation === 'PHONE SCREEN FIRST' ? 'bg-yellow-100 text-yellow-800' :
                        candidate.recommendation === 'ERROR' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {candidate.recommendation}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`text-4xl font-bold ${
                        candidate.score >= 85 ? 'text-green-600' :
                        candidate.score >= 70 ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {candidate.score}
                      </div>
                      <div className="text-sm text-gray-600">Overall Score</div>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                {candidate.qualificationsScore !== undefined && (
                  <div className="p-4 bg-gray-50 border-b">
                    <h4 className="font-semibold text-gray-900 mb-3">Score Breakdown</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Qualifications (40%)</div>
                        <div className="text-2xl font-bold text-gray-900">{candidate.qualificationsScore}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Experience (40%)</div>
                        <div className="text-2xl font-bold text-gray-900">{candidate.experienceScore}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Risk Flags (20%)</div>
                        <div className="text-2xl font-bold text-gray-900">{candidate.riskFlagsScore}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Analysis Details */}
                <div className="p-6 space-y-6">
                  {/* Key Strengths */}
                  {candidate.keyStrengths && candidate.keyStrengths.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Key Strengths
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {candidate.keyStrengths.map((strength, i) => (
                          <li key={i}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Key Concerns */}
                  {candidate.keyConcerns && candidate.keyConcerns.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Key Concerns
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {candidate.keyConcerns.map((concern, i) => (
                          <li key={i}>{concern}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Interview Questions */}
                  {candidate.interviewQuestions && candidate.interviewQuestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Suggested Interview Questions
                      </h4>
                      <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        {candidate.interviewQuestions.map((question, i) => (
                          <li key={i} className="pl-2">{question}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Reasoning */}
                  {candidate.reasoning && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">AI Reasoning</h4>
                      <p className="text-gray-700 whitespace-pre-line">{candidate.reasoning}</p>
                    </div>
                  )}

                  {/* Error Display */}
                  {candidate.error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded">
                      <h4 className="font-semibold text-red-900 mb-2">Evaluation Error</h4>
                      <p className="text-red-700">{candidate.error}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button variant="secondary" onClick={handleStartNew} className="flex-1">
            Start New Evaluation
          </Button>
          <Button variant="secondary" onClick={handleExportExcel} className="flex-1">
            <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export to Excel
          </Button>
          <Button onClick={handleExportPDF} className="flex-1">
            <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
            Export to PDF
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
