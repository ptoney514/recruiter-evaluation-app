import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { useCreateJob } from '../hooks/useJobs';
import { extractRequirements } from '../utils/requirementExtraction';

/**
 * Badge component for keywords
 */
function Badge({ children }) {
  return (
    <span className="px-2 py-1 rounded-md text-xs font-semibold border bg-slate-100 text-slate-700 border-slate-200">
      {children}
    </span>
  );
}

/**
 * Button component
 */
function Button({ children, variant = 'primary', className = '', onClick, disabled, type = 'button' }) {
  const baseStyle = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-teal-500 hover:bg-teal-600 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
    outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700',
  };

  return (
    <button
      type={type}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

/**
 * CreateRolePage - New role creation form
 * Allows users to define job requirements and success criteria
 */
export function CreateRolePage() {
  const navigate = useNavigate();
  const createJob = useCreateJob();
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' or 'upload'
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    education: 'bachelors',
  });
  const [error, setError] = useState(null);

  // Extract keywords from description
  const { mustHave, niceToHave } = extractRequirements(formData.description);
  const detectedKeywords = [...mustHave, ...niceToHave].slice(0, 5);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Job title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Job description is required');
      return;
    }

    if (formData.description.trim().length < 30) {
      setError('Job description must be at least 30 characters');
      return;
    }

    try {
      // Extract requirements from description
      const { mustHave: mustHaveReqs, niceToHave: niceToHaveReqs } = extractRequirements(formData.description);

      // Create job in Supabase
      const newJob = await createJob.mutateAsync({
        title: formData.title.trim(),
        department: formData.department.trim() || null,
        description: formData.description.trim(),
        must_have_requirements: mustHaveReqs,
        preferred_requirements: niceToHaveReqs,
        status: 'open'
      });

      // Navigate to workbench of created job
      if (newJob?.id) {
        navigate(`/app/role/${newJob.id}/workbench`);
      }
    } catch (err) {
      setError(err?.message || 'Failed to create job. Please try again.');
      console.error('Job creation error:', err);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in overflow-auto h-full">
      {/* Back Button */}
      <div
        className="flex items-center gap-2 text-slate-500 mb-6 cursor-pointer hover:text-teal-600 transition-colors"
        onClick={() => navigate('/app')}
      >
        <ArrowRight className="rotate-180" size={20} />
        <span>Back to Dashboard</span>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Create New Role</h1>
          <p className="text-slate-500">
            Define the success criteria for this position. This sets the "Truth" for the AI.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="px-8 pt-6 pb-0">
              <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-red-900">Error</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-8 space-y-6">
            {/* Title and Department */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior Marketing Manager"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Sales, Engineering"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Job Description Tabs */}
            <div>
              <div className="flex border-b border-slate-200 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeTab === 'paste'
                      ? 'border-b-2 border-teal-500 text-teal-600'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Job Description (Paste)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeTab === 'upload'
                      ? 'border-b-2 border-teal-500 text-teal-600'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Performance Profile (Upload)
                </button>
              </div>

              {activeTab === 'paste' ? (
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={8}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm font-mono text-slate-600"
                  placeholder={`About the Role:
We are looking for a Senior Marketing Manager to lead our digital growth strategy.

Must Have:
- 5+ years in digital marketing
- Experience with Marketo and Salesforce
- Proven track record of managing $500k+ budgets
- Leadership experience managing small teams

Nice to Have:
- SaaS B2B experience
- Startup background`}
                />
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  <p className="text-slate-500 mb-4">
                    Upload a Performance Profile document
                  </p>
                  <Button variant="outline">Choose File</Button>
                </div>
              )}
            </div>

            {/* Keywords and Education */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Must-Have Keywords (Auto-detected)
                </label>
                <div className="flex flex-wrap gap-2 p-3 border border-slate-300 rounded-lg bg-slate-50 min-h-[50px]">
                  {detectedKeywords.length > 0 ? (
                    detectedKeywords.map((keyword) => (
                      <Badge key={keyword}>{keyword}</Badge>
                    ))
                  ) : (
                    <span className="text-slate-400 text-sm">
                      Enter a job description to auto-detect keywords
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Education Requirement
                </label>
                <select
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="none">No Preference</option>
                  <option value="highschool">High School</option>
                  <option value="associates">Associate's Degree</option>
                  <option value="bachelors">Bachelor's Degree</option>
                  <option value="masters">Master's Degree</option>
                  <option value="phd">PhD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/app')} disabled={createJob.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createJob.isPending || !formData.title}>
              {createJob.isPending ? 'Creating...' : 'Save & Start Uploading'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
