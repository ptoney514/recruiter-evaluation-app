import React, { useState, useEffect } from 'react'
import { Save, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react'
import { useSettings, useUpdateSettings, useAvailableModels } from '../hooks/useSettings'

export function SettingsPage() {
  const { data: currentSettings, isLoading: settingsLoading } = useSettings()
  const { data: availableModels, isLoading: modelsLoading } = useAvailableModels()
  const updateMutation = useUpdateSettings()

  const [formData, setFormData] = useState({
    stage1_model: 'claude-3-5-haiku-20241022',
    stage2_model: 'claude-sonnet-4-5-20251022',
    default_provider: 'anthropic'
  })

  const [saveStatus, setSaveStatus] = useState(null) // 'success' | 'error' | null

  // Load current settings into form
  useEffect(() => {
    if (currentSettings) {
      setFormData({
        stage1_model: currentSettings.stage1_model || 'claude-3-5-haiku-20241022',
        stage2_model: currentSettings.stage2_model || 'claude-sonnet-4-5-20251022',
        default_provider: currentSettings.default_provider || 'anthropic'
      })
    }
  }, [currentSettings])

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(formData)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(null), 5000)
    }
  }

  const getModelInfo = (modelId) => {
    if (!availableModels) return null
    const anthropicModels = availableModels.anthropic?.models || []
    return anthropicModels.find(m => m.id === modelId)
  }

  const calculateCostEstimate = (modelId, avgTokens = 2000) => {
    const modelInfo = getModelInfo(modelId)
    if (!modelInfo || !modelInfo.pricing) return null

    const inputCost = (avgTokens / 1_000_000) * modelInfo.pricing.input
    const outputCost = (avgTokens / 1_000_000) * modelInfo.pricing.output
    return (inputCost + outputCost).toFixed(4)
  }

  if (settingsLoading || modelsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-500">Loading settings...</div>
      </div>
    )
  }

  const anthropicModels = availableModels?.anthropic?.models || []

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">
            Configure which AI models to use for candidate evaluations.
          </p>
        </div>

        {/* Save Status Banner */}
        {saveStatus === 'success' && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="text-emerald-600" size={20} />
            <span className="text-emerald-700 font-medium">Settings saved successfully!</span>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-rose-600" size={20} />
            <span className="text-rose-700 font-medium">Failed to save settings. Please try again.</span>
          </div>
        )}

        {/* Settings Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">AI Model Configuration</h2>
            <p className="text-sm text-slate-600 mt-1">
              Choose different models for different evaluation stages to balance cost and quality.
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Stage 1 Model Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Stage 1: Resume Screening Model
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Used for initial resume evaluations. Haiku 3.5 Legacy recommended for cost-effectiveness.
              </p>
              <select
                value={formData.stage1_model}
                onChange={(e) => setFormData({ ...formData, stage1_model: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                {anthropicModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} - {model.cost} Cost
                  </option>
                ))}
              </select>

              {/* Cost Estimate */}
              {formData.stage1_model && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                  <DollarSign size={14} />
                  <span>
                    Est. ${calculateCostEstimate(formData.stage1_model)} per evaluation
                    (avg 2K tokens in/out)
                  </span>
                </div>
              )}
            </div>

            {/* Stage 2 Model Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Stage 2: Final Hiring Model
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Used for final hiring decisions. Sonnet 4.5 or Opus 4.5 recommended for quality.
              </p>
              <select
                value={formData.stage2_model}
                onChange={(e) => setFormData({ ...formData, stage2_model: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                {anthropicModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} - {model.cost} Cost
                  </option>
                ))}
              </select>

              {/* Cost Estimate */}
              {formData.stage2_model && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                  <DollarSign size={14} />
                  <span>
                    Est. ${calculateCostEstimate(formData.stage2_model)} per evaluation
                    (avg 2K tokens in/out)
                  </span>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">About Model Selection</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li><strong>Haiku 3.5 Legacy:</strong> Cheapest option at $0.003/eval. Perfect for high-volume screening.</li>
                    <li><strong>Haiku 4.5:</strong> Newer, but 4x more expensive. Best if you need latest features.</li>
                    <li><strong>Sonnet 4.5:</strong> Balanced cost/quality. Great for most evaluations.</li>
                    <li><strong>Opus 4.5:</strong> Maximum intelligence. Use for critical final decisions.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              onClick={handleSave}
              disabled={updateMutation.isLoading}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {updateMutation.isLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Model Comparison Table */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Model Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Model</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Input ($/MTok)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Output ($/MTok)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Cost Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {anthropicModels.map((model) => (
                  <tr key={model.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{model.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      ${model.pricing?.input.toFixed(2) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      ${model.pricing?.output.toFixed(2) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        model.cost === 'Very Low' ? 'bg-emerald-100 text-emerald-700' :
                        model.cost === 'Low' ? 'bg-teal-100 text-teal-700' :
                        model.cost === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        model.cost === 'High' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {model.cost}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
