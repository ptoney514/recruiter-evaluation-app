import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { sessionStore } from '../services/storage/sessionStore'
import { exportService } from '../services/exportService'

// Methodology section constants
const METHODOLOGY_SECTIONS = {
  OVERVIEW: 0,
  QUALIFICATIONS: 1,
  EXPERIENCE: 2,
  RISK_FLAGS: 3,
  THRESHOLDS: 4
}

// FAQ section constants
const FAQ_SECTIONS = {
  PHONE_SCREEN: 0,
  INTERVIEW_PANELS: 1,
  REFERENCE_CHECKS: 2,
  DISPOSITION: 3,
  INTERNAL_CANDIDATES: 4
}

export function ResultsPage() {
  const navigate = useNavigate()
  const [evaluation, setEvaluation] = useState(null)
  const [results, setResults] = useState(null)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [expandedFaqs, setExpandedFaqs] = useState(new Set())
  const [expandedMethodology, setExpandedMethodology] = useState(new Set())

  useEffect(() => {
    const current = sessionStore.getCurrentEvaluation()
    if (!current || !current.job.title || !current.resumes.length) {
      navigate('/')
      return
    }
    setEvaluation(current)

    // Get actual results based on evaluation mode
    const mode = current.evaluationMode || 'openai'
    // Both 'openai' and 'claude' use AI results (not regex)
    const isAiMode = mode === 'openai' || mode === 'claude' || mode === 'ai'
    const evaluationResults = isAiMode ? current.aiResults : current.regexResults

    if (evaluationResults) {
      setResults({
        mode,
        isAiMode, // Add flag for easier checking
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

  // Memoized toggle functions for better performance
  const toggleRow = useCallback((index) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }, [])

  const toggleFaq = useCallback((index) => {
    setExpandedFaqs(prev => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }, [])

  const toggleMethodology = useCallback((index) => {
    setExpandedMethodology(prev => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }, [])

  // Keyboard event handler for accessibility
  const handleKeyDown = useCallback((e, toggleFn, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleFn(index)
    }
  }, [])

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

  // Filter out any null/undefined candidates from the results array
  const allCandidates = results.results || results.candidates || []
  const candidates = allCandidates.filter(c => c != null && c.name != null)

  // Log for debugging
  if (allCandidates.length !== candidates.length) {
    console.warn(`Filtered out ${allCandidates.length - candidates.length} null candidates from results`)
  }

  // Handle both camelCase (AI) and snake_case (regex) summary fields
  const advanceCount = results.summary?.advanceToInterview ??
                        results.summary?.advance_to_interview ??
                        candidates.filter(c => c.recommendation === 'ADVANCE TO INTERVIEW').length

  const phoneScreenCount = results.summary?.phoneScreen ??
                           results.summary?.phone_screen ??
                           candidates.filter(c => c.recommendation === 'PHONE SCREEN FIRST').length

  const declineCount = results.summary?.declined ??
                       candidates.filter(c => c.recommendation === 'DECLINE').length

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
            {candidates.length} candidates evaluated • {results.isAiMode ? `AI Detailed Analysis (${results.mode === 'openai' ? 'OpenAI GPT-4o Mini' : 'Claude 3.5 Haiku'})` : 'Regex Keyword Matching'}
          </p>
        </div>

        {/* Detailed Analysis for AI mode - Modern Collapsible Table */}
        {results.isAiMode && (
          <div className="mb-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl tracking-tight font-semibold leading-tight text-gray-900">Detailed AI Analysis</h2>
                <p className="mt-1 text-sm text-gray-500">Expandable rows with focused detail panels for faster evaluation.</p>
              </div>
            </div>

            {/* Card with gradient accent */}
            <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm">
              {/* Gradient accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700"></div>

              {/* Table wrapper */}
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0 text-[14px]">
                  <thead className="bg-gray-50/80 backdrop-blur">
                    <tr className="text-[12px] uppercase text-gray-500">
                      <th className="sticky top-0 z-10 px-4 py-3 text-left font-medium">Rank</th>
                      <th className="sticky top-0 z-10 px-4 py-3 text-left font-medium">Candidate</th>
                      <th className="sticky top-0 z-10 px-4 py-3 text-left font-medium">Overall Score</th>
                      <th className="sticky top-0 z-10 px-4 py-3 text-left font-medium hidden md:table-cell">Qualifications</th>
                      <th className="sticky top-0 z-10 px-4 py-3 text-left font-medium hidden md:table-cell">Experience</th>
                      <th className="sticky top-0 z-10 px-4 py-3 text-left font-medium hidden lg:table-cell">Risk Flags</th>
                      <th className="sticky top-0 z-10 px-4 py-3 text-left font-medium">Recommendation</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200/80 text-gray-800">
                    {candidates.map((candidate, index) => (
                      <>
                        {/* Main Row */}
                        <tr
                          key={`row-${index}`}
                          className="group hover:bg-gray-50/60 transition-colors"
                        >
                          <td className="px-4 py-4 align-middle text-gray-700">#{index + 1}</td>
                          <td className="px-4 py-4 align-middle">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleRow(index)
                                }}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
                                aria-expanded={expandedRows.has(index)}
                              >
                                <svg
                                  className={`h-4 w-4 transition-transform duration-200 ${
                                    expandedRows.has(index) ? '' : '-rotate-90'
                                  }`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              <div className="min-w-[10rem]">
                                <div className="font-semibold leading-tight tracking-tight">{candidate.name}</div>
                                <div className="text-[12px] text-gray-500">{evaluation.job.title}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 align-middle">
                            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
                              candidate.score >= 85 ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' :
                              candidate.score >= 70 ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100' :
                              'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
                            }`}>
                              {candidate.score}
                            </div>
                          </td>
                          <td className="px-4 py-4 align-middle hidden md:table-cell">
                            {candidate.qualificationsScore ?? '-'}
                          </td>
                          <td className="px-4 py-4 align-middle hidden md:table-cell">
                            {candidate.experienceScore ?? '-'}
                          </td>
                          <td className="px-4 py-4 align-middle hidden lg:table-cell">
                            {candidate.riskFlagsScore ?? '-'}
                          </td>
                          <td className="px-4 py-4 align-middle">
                            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium ${
                              candidate.recommendation === 'ADVANCE TO INTERVIEW' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' :
                              candidate.recommendation === 'PHONE SCREEN FIRST' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100' :
                              candidate.recommendation === 'ERROR' ? 'bg-red-50 text-red-700 ring-1 ring-red-100' :
                              'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
                            }`}>
                              {candidate.recommendation === 'ADVANCE TO INTERVIEW' && (
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                              {candidate.recommendation === 'PHONE SCREEN FIRST' && (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                              {candidate.recommendation === 'ADVANCE TO INTERVIEW' ? 'Advance to interview' :
                               candidate.recommendation === 'PHONE SCREEN FIRST' ? 'Phone screen first' :
                               candidate.recommendation === 'DECLINE' ? 'Decline' :
                               candidate.recommendation}
                            </span>
                          </td>
                        </tr>

                        {/* Expandable Details Row */}
                        {expandedRows.has(index) && (
                          <tr key={`details-${index}`} className="bg-gray-50/70">
                            <td colSpan="7" className="px-6 sm:px-10 py-6">
                              <div className="grid gap-6">
                                {/* Key Strengths */}
                                {candidate.keyStrengths && candidate.keyStrengths.length > 0 && (
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                    <div>
                                      <h3 className="text-[15px] font-semibold tracking-tight text-emerald-800">Key Strengths</h3>
                                      <ul className="mt-2 list-disc pl-5 space-y-1.5 text-[14px] text-gray-700">
                                        {candidate.keyStrengths.map((strength, i) => (
                                          <li key={i}>{strength}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                )}

                                {/* Key Concerns */}
                                {candidate.keyConcerns && candidate.keyConcerns.length > 0 && (
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-200">
                                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                    <div>
                                      <h3 className="text-[15px] font-semibold tracking-tight text-amber-800">Key Concerns</h3>
                                      <ul className="mt-2 list-disc pl-5 space-y-1.5 text-[14px] text-gray-700">
                                        {candidate.keyConcerns.map((concern, i) => (
                                          <li key={i}>{concern}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                )}

                                {/* Interview Questions */}
                                {candidate.interviewQuestions && candidate.interviewQuestions.length > 0 && (
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <h3 className="text-[15px] font-semibold tracking-tight text-indigo-800">Suggested Interview Questions</h3>
                                      <ol className="mt-2 list-decimal pl-5 space-y-1.5 text-[14px] text-gray-700">
                                        {candidate.interviewQuestions.map((question, i) => (
                                          <li key={i}>{question}</li>
                                        ))}
                                      </ol>
                                    </div>
                                  </div>
                                )}

                                {/* Reasoning */}
                                {candidate.reasoning && (
                                  <div className="rounded-lg border border-gray-200 bg-white p-4 text-[14px] text-gray-700">
                                    <div className="font-medium text-gray-900">AI Reasoning</div>
                                    <p className="mt-2 leading-6 whitespace-pre-line">
                                      {candidate.reasoning}
                                    </p>
                                  </div>
                                )}

                                {/* Error Display */}
                                {candidate.error && (
                                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-[14px]">
                                    <div className="font-medium text-red-900">Evaluation Error</div>
                                    <p className="mt-2 leading-6 text-red-700">{candidate.error}</p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer note */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 text-[13px] text-gray-500 border-t border-gray-200/50">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Scores combine qualifications (40%), experience (40%), and risk factors (20%). Higher scores indicate better fit.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Immediate Next Steps */}
        <Card className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Immediate Next Steps</h2>

          <div className="space-y-6">
            {/* Direct to Interview - High Scorers */}
            {advanceCount > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  1. Schedule interviews for top candidates ({advanceCount} total)
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  {candidates
                    .filter(c => c.recommendation === 'ADVANCE TO INTERVIEW')
                    .slice(0, 5)
                    .map((c, i) => (
                      <li key={i}>
                        <strong>{c.name}</strong> - Score: {c.score}/100
                      </li>
                    ))}
                  <li className="mt-3 text-blue-600">
                    📄 <a href="#" className="underline hover:no-underline">Customized Interview Guide – {evaluation.job.title}</a>
                  </li>
                  <li className="text-blue-600">
                    📄 <a href="#" className="underline hover:no-underline">Candidate Evaluation Form</a> for standardized scoring
                  </li>
                </ul>
              </div>
            )}

            {/* Phone Screen Candidates */}
            {phoneScreenCount > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {advanceCount > 0 ? '2' : '1'}. Conduct phone screens to clarify fit ({phoneScreenCount} total)
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  {candidates
                    .filter(c => c.recommendation === 'PHONE SCREEN FIRST')
                    .slice(0, 5)
                    .map((c, i) => (
                      <li key={i}>
                        <strong>{c.name}</strong> - Score: {c.score}/100
                      </li>
                    ))}
                  {candidates.filter(c => c.recommendation === 'PHONE SCREEN FIRST').length > 5 && (
                    <li className="text-gray-500">...and {candidates.filter(c => c.recommendation === 'PHONE SCREEN FIRST').length - 5} more</li>
                  )}
                  <li className="mt-3 text-gray-700">
                    <strong>Focus areas for phone screen:</strong>
                  </li>
                  <li className="ml-4">Clarify concerns identified in AI analysis (see Key Concerns above)</li>
                  <li className="ml-4">Verify qualifications and experience claims</li>
                  <li className="ml-4">Assess cultural fit and motivation for the role</li>
                  <li className="mt-3 text-blue-600">
                    📄 <a href="#" className="underline hover:no-underline">Phone Screen Script – {evaluation.job.title}</a>
                  </li>
                </ul>
              </div>
            )}

            {/* Interview Panels - Only if we have candidates to interview */}
            {(advanceCount > 0 || phoneScreenCount > 0) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {advanceCount > 0 && phoneScreenCount > 0 ? '3' : advanceCount > 0 || phoneScreenCount > 0 ? '2' : '1'}. Prepare interview panels
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Hiring manager and department leadership</li>
                  <li>Peer team members (assess collaboration fit)</li>
                  <li>Cross-functional stakeholders (if applicable)</li>
                  <li className="mt-3 text-blue-600">
                    📄 <a href="#" className="underline hover:no-underline">Candidate Evaluation Form</a> for standardized scoring
                  </li>
                </ul>
              </div>
            )}

            {/* Decline Non-Qualified */}
            {declineCount > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  3. Decline non-qualified candidates ({declineCount} total)
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Send standard HR declination communications</li>
                  <li className="text-blue-600">
                    📄 <a href="#" className="underline hover:no-underline">Candidate Disposition Guide</a> for documentation and messaging
                  </li>
                </ul>
              </div>
            )}
          </div>
        </Card>

        {/* FAQ Section - Collapsible */}
        <Card className="mb-6 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions (FAQ)</h2>
          <p className="text-sm text-gray-600 mb-6">
            Quick explanations of key steps in the hiring process for {evaluation.job.title}.
            Designed to help search committee members, interviewers, and HR staff understand the why behind each action.
          </p>

          <div className="space-y-3">
            {/* FAQ 1 */}
            <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <button
                onClick={() => toggleFaq(FAQ_SECTIONS.PHONE_SCREEN)}
                onKeyDown={(e) => handleKeyDown(e, toggleFaq, FAQ_SECTIONS.PHONE_SCREEN)}
                aria-expanded={expandedFaqs.has(FAQ_SECTIONS.PHONE_SCREEN)}
                aria-label="What is the purpose of a phone screen?"
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-left font-semibold text-gray-900">1. What is the purpose of a phone screen?</span>
                <svg
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                    expandedFaqs.has(FAQ_SECTIONS.PHONE_SCREEN) ? '' : '-rotate-90'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedFaqs.has(FAQ_SECTIONS.PHONE_SCREEN) && (
                <div className="px-4 pb-4 pt-2 bg-gray-50/50">
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-2">
                    <li>A phone screen helps assess a candidate's communication skills, role fit, and alignment with company values before advancing to interviews</li>
                    <li>It ensures only the most qualified candidates move forward, saving time for both the search team and applicants</li>
                    <li className="text-blue-600">
                      📄 Use the <a href="#" className="underline hover:no-underline">Phone Screen Script – {evaluation.job.title}</a> to maintain consistency and fairness
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <button
                onClick={() => toggleFaq(FAQ_SECTIONS.INTERVIEW_PANELS)}
                onKeyDown={(e) => handleKeyDown(e, toggleFaq, FAQ_SECTIONS.INTERVIEW_PANELS)}
                aria-expanded={expandedFaqs.has(FAQ_SECTIONS.INTERVIEW_PANELS)}
                aria-label="Why do we use interview panels?"
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-left font-semibold text-gray-900">2. Why do we use interview panels?</span>
                <svg
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                    expandedFaqs.has(FAQ_SECTIONS.INTERVIEW_PANELS) ? '' : '-rotate-90'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedFaqs.has(FAQ_SECTIONS.INTERVIEW_PANELS) && (
                <div className="px-4 pb-4 pt-2 bg-gray-50/50">
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-2">
                    <li>Panels bring multiple perspectives to the evaluation process, reducing individual bias</li>
                    <li>They reflect collaborative and inclusive culture by including representatives from different teams and stakeholders</li>
                    <li className="text-blue-600">
                      📄 Refer to the <a href="#" className="underline hover:no-underline">Customized Interview Guide – {evaluation.job.title}</a> for panel structure and core questions
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <button
                onClick={() => toggleFaq(FAQ_SECTIONS.REFERENCE_CHECKS)}
                onKeyDown={(e) => handleKeyDown(e, toggleFaq, FAQ_SECTIONS.REFERENCE_CHECKS)}
                aria-expanded={expandedFaqs.has(FAQ_SECTIONS.REFERENCE_CHECKS)}
                aria-label="Why conduct reference checks?"
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-left font-semibold text-gray-900">3. Why conduct reference checks?</span>
                <svg
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                    expandedFaqs.has(FAQ_SECTIONS.REFERENCE_CHECKS) ? '' : '-rotate-90'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedFaqs.has(FAQ_SECTIONS.REFERENCE_CHECKS) && (
                <div className="px-4 pb-4 pt-2 bg-gray-50/50">
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-2">
                    <li>Reference checks verify past performance, leadership style, and interpersonal effectiveness</li>
                    <li>They help validate cultural fit and confirm whether the candidate demonstrates company values in practice</li>
                    <li className="text-blue-600">
                      📄 Use the <a href="#" className="underline hover:no-underline">Reference Check Template – {evaluation.job.title}</a> for consistent and compliant documentation
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* FAQ 4 */}
            <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <button
                onClick={() => toggleFaq(FAQ_SECTIONS.DISPOSITION)}
                onKeyDown={(e) => handleKeyDown(e, toggleFaq, FAQ_SECTIONS.DISPOSITION)}
                aria-expanded={expandedFaqs.has(FAQ_SECTIONS.DISPOSITION)}
                aria-label="What does disposition mean in the hiring process?"
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-left font-semibold text-gray-900">4. What does "disposition" mean in the hiring process?</span>
                <svg
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                    expandedFaqs.has(FAQ_SECTIONS.DISPOSITION) ? '' : '-rotate-90'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedFaqs.has(FAQ_SECTIONS.DISPOSITION) && (
                <div className="px-4 pb-4 pt-2 bg-gray-50/50">
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-2">
                    <li>"Dispositioning" refers to formally marking a candidate's application status (e.g., interviewed, not selected, declined)</li>
                    <li>It ensures accurate record-keeping in the applicant tracking system (ATS) and triggers standard declination communications</li>
                    <li className="text-blue-600">
                      📄 Follow the <a href="#" className="underline hover:no-underline">Candidate Disposition Guide</a> to complete this step properly and respectfully
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* FAQ 5 */}
            <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <button
                onClick={() => toggleFaq(FAQ_SECTIONS.INTERNAL_CANDIDATES)}
                onKeyDown={(e) => handleKeyDown(e, toggleFaq, FAQ_SECTIONS.INTERNAL_CANDIDATES)}
                aria-expanded={expandedFaqs.has(FAQ_SECTIONS.INTERNAL_CANDIDATES)}
                aria-label="Why are internal candidate protocols important?"
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-left font-semibold text-gray-900">5. Why are internal candidate protocols important?</span>
                <svg
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                    expandedFaqs.has(FAQ_SECTIONS.INTERNAL_CANDIDATES) ? '' : '-rotate-90'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedFaqs.has(FAQ_SECTIONS.INTERNAL_CANDIDATES) && (
                <div className="px-4 pb-4 pt-2 bg-gray-50/50">
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-2">
                    <li>Internal candidates must be evaluated with transparency and fairness while recognizing their current contributions</li>
                    <li>Following internal candidate protocols ensures compliance with HR policies, avoids conflicts of interest, and maintains trust in the selection process</li>
                    <li className="text-blue-600">
                      📄 Confirm requirements with HR and reference the <a href="#" className="underline hover:no-underline">Internal Candidate Process Guide</a> before proceeding
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Evaluation Methodology - Collapsible */}
        <Card className="mb-6 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Evaluation Methodology</h2>
          <p className="text-sm text-gray-600 mb-4">
            <strong>Screening Completed By:</strong> Claude 3.5 Haiku (AI Recruiting Assistant) •{' '}
            <strong>Framework:</strong> Two-Stage Recruiting Evaluation, Stage 1 Resume Screening •{' '}
            <strong>Evaluation Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} •{' '}
            <strong>Total Candidates:</strong> {candidates.length} •{' '}
            <strong>Job Position:</strong> {evaluation.job.title}
          </p>

          <div className="space-y-3">
            {/* Overview */}
            <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <button
                onClick={() => toggleMethodology(METHODOLOGY_SECTIONS.OVERVIEW)}
                onKeyDown={(e) => handleKeyDown(e, toggleMethodology, METHODOLOGY_SECTIONS.OVERVIEW)}
                aria-expanded={expandedMethodology.has(METHODOLOGY_SECTIONS.OVERVIEW)}
                aria-label="Scoring Overview and Calculation"
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-left font-semibold text-gray-900">Scoring Overview & Calculation</span>
                <svg
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                    expandedMethodology.has(METHODOLOGY_SECTIONS.OVERVIEW) ? '' : '-rotate-90'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedMethodology.has(METHODOLOGY_SECTIONS.OVERVIEW) && (
                <div className="px-4 pb-4 pt-2 bg-gray-50/50">
                  <p className="text-sm text-gray-700 mb-4">
                    Each candidate receives a composite score (0-100) calculated using three weighted components.
                    The final score determines the hiring recommendation based on predetermined thresholds.
                  </p>
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded border-2 border-green-300">
                    <h5 className="font-semibold text-gray-900 mb-2">Final Score Calculation</h5>
                    <div className="text-sm font-mono text-gray-800 space-y-1">
                      <p><strong>Overall Score = (Qualifications × 0.40) + (Experience × 0.40) + (Risk Flags × 0.20)</strong></p>
                      <p className="text-xs text-gray-600 mt-2">Example: (88 × 0.40) + (80 × 0.40) + (85 × 0.20) = 35.2 + 32.0 + 17.0 = <strong>84.2 ≈ 84</strong></p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Qualifications Score */}
            <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <button
                onClick={() => toggleMethodology(METHODOLOGY_SECTIONS.QUALIFICATIONS)}
                onKeyDown={(e) => handleKeyDown(e, toggleMethodology, METHODOLOGY_SECTIONS.QUALIFICATIONS)}
                aria-expanded={expandedMethodology.has(METHODOLOGY_SECTIONS.QUALIFICATIONS)}
                aria-label="Qualifications Score breakdown"
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-700">40%</span>
                  </div>
                  <span className="text-left font-semibold text-gray-900">Qualifications Score</span>
                </div>
                <svg
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                    expandedMethodology.has(METHODOLOGY_SECTIONS.QUALIFICATIONS) ? '' : '-rotate-90'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedMethodology.has(METHODOLOGY_SECTIONS.QUALIFICATIONS) && (
                <div className="px-4 pb-4 pt-2 bg-gray-50/50">
                  <p className="text-sm text-gray-700 mb-3">
                    Evaluates education, certifications, licenses, and technical skills against job requirements.
                  </p>
                  <div className="bg-blue-50 p-3 rounded text-xs font-mono text-gray-800">
                    <strong>Formula:</strong> Qualifications Score × 0.40 = Weighted Component<br/>
                    <strong>Criteria:</strong> Degree match, required certifications, technical proficiencies, specialized training<br/>
                    <strong>Scale:</strong> 0-100 (100 = exceeds all requirements, 0 = no qualifications match)
                  </div>
                </div>
              )}
            </div>

            {/* Experience Score */}
            <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <button
                onClick={() => toggleMethodology(METHODOLOGY_SECTIONS.EXPERIENCE)}
                onKeyDown={(e) => handleKeyDown(e, toggleMethodology, METHODOLOGY_SECTIONS.EXPERIENCE)}
                aria-expanded={expandedMethodology.has(METHODOLOGY_SECTIONS.EXPERIENCE)}
                aria-label="Experience Score breakdown"
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-purple-700">40%</span>
                  </div>
                  <span className="text-left font-semibold text-gray-900">Experience Score</span>
                </div>
                <svg
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                    expandedMethodology.has(METHODOLOGY_SECTIONS.EXPERIENCE) ? '' : '-rotate-90'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedMethodology.has(METHODOLOGY_SECTIONS.EXPERIENCE) && (
                <div className="px-4 pb-4 pt-2 bg-gray-50/50">
                  <p className="text-sm text-gray-700 mb-3">
                    Assesses years of relevant experience, role similarity, industry background, and demonstrated achievements.
                  </p>
                  <div className="bg-purple-50 p-3 rounded text-xs font-mono text-gray-800">
                    <strong>Formula:</strong> Experience Score × 0.40 = Weighted Component<br/>
                    <strong>Criteria:</strong> Years in role, industry relevance, leadership experience, measurable impact<br/>
                    <strong>Scale:</strong> 0-100 (100 = extensive relevant experience, 0 = no relevant experience)
                  </div>
                </div>
              )}
            </div>

            {/* Risk Flags Score */}
            <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <button
                onClick={() => toggleMethodology(METHODOLOGY_SECTIONS.RISK_FLAGS)}
                onKeyDown={(e) => handleKeyDown(e, toggleMethodology, METHODOLOGY_SECTIONS.RISK_FLAGS)}
                aria-expanded={expandedMethodology.has(METHODOLOGY_SECTIONS.RISK_FLAGS)}
                aria-label="Risk Flags Score breakdown"
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-amber-700">20%</span>
                  </div>
                  <span className="text-left font-semibold text-gray-900">Risk Flags Score</span>
                </div>
                <svg
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                    expandedMethodology.has(METHODOLOGY_SECTIONS.RISK_FLAGS) ? '' : '-rotate-90'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedMethodology.has(METHODOLOGY_SECTIONS.RISK_FLAGS) && (
                <div className="px-4 pb-4 pt-2 bg-gray-50/50">
                  <p className="text-sm text-gray-700 mb-3">
                    Identifies potential concerns including employment gaps, job-hopping, credential mismatches, or missing requirements.
                  </p>
                  <div className="bg-amber-50 p-3 rounded text-xs font-mono text-gray-800">
                    <strong>Formula:</strong> Risk Flags Score × 0.20 = Weighted Component<br/>
                    <strong>Criteria:</strong> Employment gaps, role progression, requirement gaps, credential verification<br/>
                    <strong>Scale:</strong> 0-100 (100 = no concerns, 0 = critical red flags present)
                  </div>
                </div>
              )}
            </div>

            {/* Recommendation Thresholds */}
            <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <button
                onClick={() => toggleMethodology(METHODOLOGY_SECTIONS.THRESHOLDS)}
                onKeyDown={(e) => handleKeyDown(e, toggleMethodology, METHODOLOGY_SECTIONS.THRESHOLDS)}
                aria-expanded={expandedMethodology.has(METHODOLOGY_SECTIONS.THRESHOLDS)}
                aria-label="Recommendation Thresholds"
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-left font-semibold text-gray-900">Recommendation Thresholds</span>
                <svg
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                    expandedMethodology.has(METHODOLOGY_SECTIONS.THRESHOLDS) ? '' : '-rotate-90'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedMethodology.has(METHODOLOGY_SECTIONS.THRESHOLDS) && (
                <div className="px-4 pb-4 pt-2 bg-gray-50/50">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        ADVANCE TO INTERVIEW
                      </span>
                      <span className="text-sm text-gray-700">Score ≥ 85 (Strong match, proceed directly to interviews)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        PHONE SCREEN FIRST
                      </span>
                      <span className="text-sm text-gray-700">Score 70-84 (Potential fit, conduct phone screen to clarify)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                        DECLINE
                      </span>
                      <span className="text-sm text-gray-700">Score &lt; 70 (Insufficient match for this role)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="mt-6 pt-4 border-t border-gray-300 text-xs text-gray-600">
            <p>
              <strong>Note:</strong> AI evaluations are designed to augment human decision-making, not replace it.
              Scores should be used as a screening tool alongside recruiter judgment, cultural fit assessment, and structured interviews.
              All hiring decisions should comply with applicable employment laws and organizational policies.
            </p>
          </div>
        </Card>

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

        {/* AI Cost Summary - Moved to bottom */}
        {results.isAiMode && results.usage && (
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
      </div>
    </div>
  )
}
