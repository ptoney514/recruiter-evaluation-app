import { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

/**
 * PerformanceProfileWizard Component
 * Multi-step wizard for creating Lou Adler Performance Profile
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether wizard is open
 * @param {Function} props.onClose - Callback to close wizard
 * @param {Function} props.onComplete - Callback when profile is complete
 * @param {Object} props.initialData - Initial performance profile data (for editing)
 */
export function PerformanceProfileWizard({ isOpen, onClose, onComplete, initialData = {} }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [profileData, setProfileData] = useState({
    year_1_outcomes: initialData.year_1_outcomes || ['', '', ''],
    biggest_challenge: initialData.biggest_challenge || '',
    comparable_experience: initialData.comparable_experience || ['', '', ''],
    dealbreakers: initialData.dealbreakers || ['', ''],
    motivation_drivers: initialData.motivation_drivers || [],
    must_have_requirements: initialData.must_have_requirements || ['', '', ''],
    nice_to_have_requirements: initialData.nice_to_have_requirements || ['', '', ''],
    trajectory_patterns: initialData.trajectory_patterns || ['', ''],
    context_notes: initialData.context_notes || ''
  })

  const totalSteps = 8

  if (!isOpen) return null

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      // Final step - complete the profile
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Clean up empty values
    const cleanedProfile = {
      year_1_outcomes: profileData.year_1_outcomes.filter(x => x.trim()),
      biggest_challenge: profileData.biggest_challenge,
      comparable_experience: profileData.comparable_experience.filter(x => x.trim()),
      dealbreakers: profileData.dealbreakers.filter(x => x.trim()),
      motivation_drivers: profileData.motivation_drivers,
      must_have_requirements: profileData.must_have_requirements.filter(x => x.trim()),
      nice_to_have_requirements: profileData.nice_to_have_requirements.filter(x => x.trim()),
      trajectory_patterns: profileData.trajectory_patterns.filter(x => x.trim()),
      context_notes: profileData.context_notes
    }

    onComplete(cleanedProfile)
  }

  const updateArrayField = (field, index, value) => {
    const newArray = [...profileData[field]]
    newArray[index] = value
    setProfileData({ ...profileData, [field]: newArray })
  }

  const addArrayItem = (field) => {
    setProfileData({
      ...profileData,
      [field]: [...profileData[field], '']
    })
  }

  const removeArrayItem = (field, index) => {
    const newArray = profileData[field].filter((_, i) => i !== index)
    setProfileData({ ...profileData, [field]: newArray })
  }

  const toggleMotivationDriver = (driver) => {
    const drivers = profileData.motivation_drivers
    if (drivers.includes(driver)) {
      setProfileData({
        ...profileData,
        motivation_drivers: drivers.filter(d => d !== driver)
      })
    } else {
      setProfileData({
        ...profileData,
        motivation_drivers: [...drivers, driver]
      })
    }
  }

  // Progress percentage
  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Create Performance Profile
              </h2>
              <p className="text-gray-600 mt-1">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 1 && <Step1_Year1Outcomes data={profileData} updateArrayField={updateArrayField} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />}
          {currentStep === 2 && <Step2_BiggestChallenge data={profileData} setProfileData={setProfileData} />}
          {currentStep === 3 && <Step3_ComparableExperience data={profileData} updateArrayField={updateArrayField} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />}
          {currentStep === 4 && <Step4_Dealbreakers data={profileData} updateArrayField={updateArrayField} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />}
          {currentStep === 5 && <Step5_MotivationDrivers data={profileData} toggleMotivationDriver={toggleMotivationDriver} />}
          {currentStep === 6 && <Step6_Requirements data={profileData} updateArrayField={updateArrayField} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />}
          {currentStep === 7 && <Step7_TrajectoryPatterns data={profileData} updateArrayField={updateArrayField} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />}
          {currentStep === 8 && <Step8_ContextNotes data={profileData} setProfileData={setProfileData} />}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={currentStep === 1 ? onClose : handleBack}
            className="flex-1"
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1"
          >
            {currentStep === totalSteps ? 'Complete Profile' : `Next (${currentStep + 1}/${totalSteps})`}
          </Button>
        </div>

        {/* Skip Option */}
        <div className="text-center mt-4">
          <button
            onClick={() => handleComplete()}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip for now (can add later)
          </button>
        </div>
      </Card>
    </div>
  )
}

// Step 1: Year 1 Outcomes
function Step1_Year1Outcomes({ data, updateArrayField, addArrayItem, removeArrayItem }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Question 1: Year 1 Outcomes
      </h3>
      <p className="text-gray-600 mb-4">
        What are the 2-3 most critical things this person needs to accomplish in their first year?
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Focus on OUTCOMES not duties. Use action verbs like "launch," "build," "increase," "reduce."
        </p>
        <p className="text-xs text-blue-700 mt-2">
          Example: "Complete comprehensive risk assessment of all operations" (not "responsible for auditing")
        </p>
      </div>

      <div className="space-y-3">
        {data.year_1_outcomes.map((outcome, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
              {index + 1}
            </div>
            <div className="flex-1">
              <Input
                value={outcome}
                onChange={(e) => updateArrayField('year_1_outcomes', index, e.target.value)}
                placeholder={`Outcome ${index + 1}...`}
              />
            </div>
            {data.year_1_outcomes.length > 1 && (
              <button
                onClick={() => removeArrayItem('year_1_outcomes', index)}
                className="text-gray-400 hover:text-red-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}

        {data.year_1_outcomes.length < 5 && (
          <button
            onClick={() => addArrayItem('year_1_outcomes')}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add another outcome
          </button>
        )}
      </div>
    </div>
  )
}

// Step 2: Biggest Challenge
function Step2_BiggestChallenge({ data, setProfileData }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Question 2: Biggest Challenge
      </h3>
      <p className="text-gray-600 mb-4">
        What's the single hardest obstacle this person will face in their first 6 months?
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> This helps AI find resumes showing they've overcome similar challenges.
        </p>
        <p className="text-xs text-blue-700 mt-2">
          Example: "Navigating higher ed politics while maintaining audit independence"
        </p>
      </div>

      <textarea
        value={data.biggest_challenge}
        onChange={(e) => setProfileData({ ...data, biggest_challenge: e.target.value })}
        rows={4}
        placeholder="Describe the biggest challenge..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
      />
    </div>
  )
}

// Step 3: Comparable Experience
function Step3_ComparableExperience({ data, updateArrayField, addArrayItem, removeArrayItem }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Question 3: Comparable Experience
      </h3>
      <p className="text-gray-600 mb-4">
        If you saw this specific work experience on a resume, you'd think "they've done this before"—what is it?
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Define what "relevant experience" means for THIS specific role.
        </p>
        <p className="text-xs text-blue-700 mt-2">
          Example: "Led internal audit at another university OR complex nonprofit OR regulated healthcare system"
        </p>
      </div>

      <div className="space-y-3">
        {data.comparable_experience.map((exp, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={exp}
              onChange={(e) => updateArrayField('comparable_experience', index, e.target.value)}
              placeholder={`Experience pattern ${index + 1}...`}
            />
            {data.comparable_experience.length > 1 && (
              <button
                onClick={() => removeArrayItem('comparable_experience', index)}
                className="text-gray-400 hover:text-red-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}

        {data.comparable_experience.length < 5 && (
          <button
            onClick={() => addArrayItem('comparable_experience')}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add experience pattern
          </button>
        )}
      </div>
    </div>
  )
}

// Step 4: Dealbreakers
function Step4_Dealbreakers({ data, updateArrayField, addArrayItem, removeArrayItem }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Question 4: Dealbreakers
      </h3>
      <p className="text-gray-600 mb-4">
        What would cause someone to fail catastrophically in this role? What can't be taught or fixed?
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-amber-800">
          <strong>⚠️ Tip:</strong> These are non-negotiable red flags that AI will watch for.
        </p>
        <p className="text-xs text-amber-700 mt-2">
          Example: "Can't communicate complex findings to non-finance executives"
        </p>
      </div>

      <div className="space-y-3">
        {data.dealbreakers.map((dealbreaker, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={dealbreaker}
              onChange={(e) => updateArrayField('dealbreakers', index, e.target.value)}
              placeholder={`Dealbreaker ${index + 1}...`}
            />
            {data.dealbreakers.length > 1 && (
              <button
                onClick={() => removeArrayItem('dealbreakers', index)}
                className="text-gray-400 hover:text-red-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}

        {data.dealbreakers.length < 5 && (
          <button
            onClick={() => addArrayItem('dealbreakers')}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add dealbreaker
          </button>
        )}
      </div>
    </div>
  )
}

// Step 5: Motivation Drivers
function Step5_MotivationDrivers({ data, toggleMotivationDriver }) {
  const motivations = [
    { id: 'mission', label: 'Mission/Purpose', description: 'Making a difference, serving community' },
    { id: 'building', label: 'Building/Creating', description: 'Starting new things, fixing broken systems' },
    { id: 'autonomy', label: 'Autonomy', description: 'Independence, trusted, minimal oversight' },
    { id: 'impact', label: 'Impact', description: 'Seeing tangible results, moving metrics' },
    { id: 'prestige', label: 'Prestige', description: 'Brand name, reputation, career advancement' },
    { id: 'stability', label: 'Stability', description: 'Work-life balance, security, predictability' },
    { id: 'mastery', label: 'Mastery', description: 'Becoming expert, deep technical skills' }
  ]

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Question 5: Motivation Fit
      </h3>
      <p className="text-gray-600 mb-4">
        What energizes someone to excel in this role? What do top performers care about most?
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Choose 1-2 primary motivations. AI will look for career patterns that match.
        </p>
      </div>

      <div className="space-y-3">
        {motivations.map((motivation) => (
          <label
            key={motivation.id}
            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              data.motivation_drivers.includes(motivation.id)
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="checkbox"
              checked={data.motivation_drivers.includes(motivation.id)}
              onChange={() => toggleMotivationDriver(motivation.id)}
              className="mt-1 mr-3"
            />
            <div>
              <div className="font-medium text-gray-900">{motivation.label}</div>
              <div className="text-sm text-gray-600">{motivation.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

// Step 6: Requirements (Must-Have vs Nice-to-Have)
function Step6_Requirements({ data, updateArrayField, addArrayItem, removeArrayItem }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Question 6: Must-Haves vs Nice-to-Haves
      </h3>
      <p className="text-gray-600 mb-4">
        What credentials, skills, or experiences are absolutely required versus "we can teach / they can learn"?
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Be honest about what's truly required. Over-filtering costs you great candidates.
        </p>
      </div>

      {/* Must-Haves */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">
          Must-Haves (Required)
        </h4>
        <div className="space-y-3">
          {data.must_have_requirements.map((req, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={req}
                onChange={(e) => updateArrayField('must_have_requirements', index, e.target.value)}
                placeholder="e.g., CPA certification, 5+ years leadership..."
              />
              {data.must_have_requirements.length > 1 && (
                <button
                  onClick={() => removeArrayItem('must_have_requirements', index)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          {data.must_have_requirements.length < 10 && (
            <button
              onClick={() => addArrayItem('must_have_requirements')}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add must-have
            </button>
          )}
        </div>
      </div>

      {/* Nice-to-Haves */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">
          Nice-to-Haves (Preferred but not required)
        </h4>
        <div className="space-y-3">
          {data.nice_to_have_requirements.map((req, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={req}
                onChange={(e) => updateArrayField('nice_to_have_requirements', index, e.target.value)}
                placeholder="e.g., Higher ed experience, data analytics..."
              />
              {data.nice_to_have_requirements.length > 1 && (
                <button
                  onClick={() => removeArrayItem('nice_to_have_requirements', index)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          {data.nice_to_have_requirements.length < 10 && (
            <button
              onClick={() => addArrayItem('nice_to_have_requirements')}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add nice-to-have
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Step 7: Trajectory Patterns
function Step7_TrajectoryPatterns({ data, updateArrayField, addArrayItem, removeArrayItem }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Question 7: Trajectory Pattern
      </h3>
      <p className="text-gray-600 mb-4">
        What career progression pattern suggests this person is ready for THIS role?
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Lou Adler's #1 predictor: trend of performance. Look for promotions and expanding scope.
        </p>
        <p className="text-xs text-blue-700 mt-2">
          Example: "Auditor → Senior Auditor → Audit Manager → Director of IA"
        </p>
      </div>

      <div className="space-y-3">
        {data.trajectory_patterns.map((pattern, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={pattern}
              onChange={(e) => updateArrayField('trajectory_patterns', index, e.target.value)}
              placeholder="e.g., Manager at smaller org ready for Director at larger org..."
            />
            {data.trajectory_patterns.length > 1 && (
              <button
                onClick={() => removeArrayItem('trajectory_patterns', index)}
                className="text-gray-400 hover:text-red-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}

        {data.trajectory_patterns.length < 5 && (
          <button
            onClick={() => addArrayItem('trajectory_patterns')}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add trajectory pattern
          </button>
        )}
      </div>
    </div>
  )
}

// Step 8: Context Notes
function Step8_ContextNotes({ data, setProfileData }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Question 8: Context & Special Considerations
      </h3>
      <p className="text-gray-600 mb-4">
        Any special context about this role, organization, or search that affects what "good" looks like?
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Include organizational culture, role history, timeline urgency, or unique factors.
        </p>
        <p className="text-xs text-blue-700 mt-2">
          Example: "Replacing beloved 20-year veteran. Risk-averse culture requires patience before pushing change."
        </p>
      </div>

      <textarea
        value={data.context_notes}
        onChange={(e) => setProfileData({ ...data, context_notes: e.target.value })}
        rows={6}
        placeholder="Any special context about the role, organization, or search..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
      />

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800">
          <strong>✅ You're done!</strong> Click "Complete Profile" to save and start evaluating candidates.
        </p>
      </div>
    </div>
  )
}
