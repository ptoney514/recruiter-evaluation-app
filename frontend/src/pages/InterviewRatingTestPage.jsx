import { useState } from 'react'
import { InterviewRatingForm } from '../components/candidates/InterviewRatingForm'
import { interviewRatingsService } from '../services/interviewRatingsService'
import { Card } from '../components/ui/Card'

/**
 * Test page for Interview Rating Form
 * Allows testing the form with a mock candidate ID
 */
export function InterviewRatingTestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [submitResult, setSubmitResult] = useState(null)
  const [error, setError] = useState(null)

  // Mock candidate ID for testing (you can change this)
  const testCandidateId = '00000000-0000-0000-0000-000000000000'

  const handleSubmit = async (formData) => {
    setIsLoading(true)
    setError(null)
    setSubmitResult(null)

    try {
      const result = await interviewRatingsService.create(formData)
      setSubmitResult(result)
      console.log('Interview rating saved:', result)
    } catch (err) {
      console.error('Error saving interview rating:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Interview Rating Form - Test Page</h1>
          <p className="text-gray-600 mt-2">
            Testing the interview rating form component. This data will be saved to Supabase.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Using test candidate ID: <code className="bg-gray-200 px-2 py-1 rounded">{testCandidateId}</code>
          </p>
        </div>

        {/* Success Message */}
        {submitResult && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <div className="p-4">
              <h3 className="text-green-800 font-semibold mb-2">✅ Interview Rating Saved Successfully!</h3>
              <pre className="text-xs bg-white p-3 rounded overflow-x-auto">
                {JSON.stringify(submitResult, null, 2)}
              </pre>
            </div>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <div className="p-4">
              <h3 className="text-red-800 font-semibold mb-2">❌ Error Saving Interview Rating</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </Card>
        )}

        {/* The Form */}
        <Card>
          <InterviewRatingForm
            candidateId={testCandidateId}
            onSubmit={handleSubmit}
            onCancel={() => alert('Cancel clicked')}
            isLoading={isLoading}
          />
        </Card>
      </div>
    </div>
  )
}
