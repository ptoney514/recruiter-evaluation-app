import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  ClipboardList,
  RefreshCw,
  Check,
  X as XIcon,
  Minus
} from 'lucide-react';

/**
 * Badge component
 */
function Badge({ children, color = 'slate' }) {
  const colors = {
    green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    yellow: 'bg-amber-100 text-amber-700 border-amber-200',
    red: 'bg-rose-100 text-rose-700 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-100'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
}

/**
 * Button component
 */
function Button({ children, variant = 'primary', className = '', onClick }) {
  const baseStyle = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-teal-500 hover:bg-teal-600 text-white shadow-sm',
    outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

/**
 * RequirementStatus icon component
 */
function StatusIcon({ status }) {
  switch (status) {
    case 'MET':
      return <Check size={14} className="text-emerald-600" />;
    case 'NOT_MET':
      return <XIcon size={14} className="text-rose-600" />;
    case 'PARTIAL':
      return <Minus size={14} className="text-amber-600" />;
    default:
      return <Minus size={14} className="text-slate-400" />;
  }
}

/**
 * Analysis Tab Content - Shows requirements breakdown
 */
function AnalysisTab({ candidate, job, onReEvaluate }) {
  const analysis = candidate?.quick_score_analysis;

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <ClipboardList size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-600 mb-2">No Analysis Available</h3>
        <p className="text-sm text-slate-500 mb-4">
          Run a Quick Score evaluation to see the requirements analysis.
        </p>
      </div>
    );
  }

  const { requirements_identified, match_analysis, methodology, model, evaluated_at } = analysis;

  // Count statuses
  const statusCounts = (match_analysis || []).reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Screening Analysis</h3>
            <p className="text-sm text-slate-500">
              {job?.title || 'Position'}
            </p>
          </div>
          {onReEvaluate && (
            <button
              onClick={onReEvaluate}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
            >
              <RefreshCw size={14} />
              Re-evaluate
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Model:</span>
            <span className="ml-2 font-medium text-slate-900">{model || 'Unknown'}</span>
          </div>
          <div>
            <span className="text-slate-500">Evaluated:</span>
            <span className="ml-2 font-medium text-slate-900">
              {evaluated_at ? new Date(evaluated_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Methodology:</span>
            <span className="ml-2 font-medium text-slate-900">{methodology}</span>
          </div>
        </div>

        {/* Summary badges */}
        <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
            {statusCounts.MET || 0} Met
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
            {statusCounts.PARTIAL || 0} Partial
          </span>
          <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
            {statusCounts.NOT_MET || 0} Not Met
          </span>
        </div>
      </div>

      {/* Requirements Identified */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h4 className="font-bold text-slate-900 mb-4">Requirements Identified</h4>

        <div className="grid grid-cols-2 gap-6">
          {/* Must-Have */}
          <div>
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Must-Have ({requirements_identified?.must_have?.length || 0})
            </h5>
            <ul className="space-y-2">
              {(requirements_identified?.must_have || []).map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-slate-400 mt-0.5">•</span>
                  {req}
                </li>
              ))}
              {(!requirements_identified?.must_have || requirements_identified.must_have.length === 0) && (
                <li className="text-sm text-slate-400 italic">None identified</li>
              )}
            </ul>
          </div>

          {/* Preferred */}
          <div>
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Preferred ({requirements_identified?.preferred?.length || 0})
            </h5>
            <ul className="space-y-2">
              {(requirements_identified?.preferred || []).map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-slate-400 mt-0.5">•</span>
                  {req}
                </li>
              ))}
              {(!requirements_identified?.preferred || requirements_identified.preferred.length === 0) && (
                <li className="text-sm text-slate-400 italic">None identified</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Match Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h4 className="font-bold text-slate-900 mb-4">Match Analysis</h4>

        <div className="space-y-4">
          {(match_analysis || []).map((item, i) => (
            <div key={i} className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
              <div className="mt-0.5">
                <StatusIcon status={item.status} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-900 text-sm">{item.requirement}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    item.status === 'MET' ? 'bg-emerald-50 text-emerald-700' :
                    item.status === 'NOT_MET' ? 'bg-rose-50 text-rose-700' :
                    item.status === 'PARTIAL' ? 'bg-amber-50 text-amber-700' :
                    'bg-slate-50 text-slate-700'
                  }`}>
                    {item.status?.replace('_', ' ') || 'Unknown'}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  {item.evidence || 'No evidence provided'}
                </p>
              </div>
            </div>
          ))}

          {(!match_analysis || match_analysis.length === 0) && (
            <p className="text-sm text-slate-400 italic text-center py-4">
              No match analysis available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * CandidateDetailPanel - Slide-in panel for candidate details
 */
export function CandidateDetailPanel({ candidate, job, onClose, onUpdateStatus, onReEvaluate }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!candidate) return null;

  const handleRemove = () => {
    if (onUpdateStatus) {
      onUpdateStatus(candidate.id, 'Removed');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Panel */}
      <div className="relative w-full max-w-5xl bg-white shadow-2xl flex flex-col h-full animate-slide-in-right">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{candidate.name}</h2>
            <p className="text-sm text-slate-500">{candidate.role} • Seattle, WA</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-500">
              Status: <span className="font-medium text-slate-800">{candidate.status}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side: Resume Preview */}
          <div className="w-1/2 bg-slate-100 p-6 overflow-y-auto border-r border-slate-200">
            <div className="bg-white shadow-sm min-h-[800px] w-full p-8 mx-auto max-w-[600px] text-slate-800 text-sm leading-relaxed">
              {/* Resume Header */}
              <div className="text-center border-b pb-6 mb-6">
                <h1 className="text-2xl font-bold uppercase tracking-widest mb-2">
                  {candidate.name}
                </h1>
                <p className="text-slate-500">
                  Senior Marketing Professional | {candidate.email}
                </p>
              </div>

              {/* Summary */}
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 uppercase text-xs border-b border-slate-300 pb-1 mb-3">
                  Summary
                </h3>
                <p>{candidate.summary}</p>
              </div>

              {/* Experience */}
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 uppercase text-xs border-b border-slate-300 pb-1 mb-3">
                  Experience
                </h3>
                <div className="mb-4">
                  <div className="flex justify-between font-bold text-sm">
                    <span>Marketing Lead</span>
                    <span>2019 - 2023</span>
                  </div>
                  <div className="text-slate-500 text-xs mb-2">TechFlow Inc.</div>
                  <ul className="list-disc ml-4 space-y-1 text-xs">
                    <li>Led go-to-market strategy for 3 major product launches.</li>
                    <li className="bg-yellow-100 px-1 -ml-1">
                      Managed annual budget of $500k with 15% ROI improvement.
                    </li>
                    <li>Oversaw team of 5 content specialists.</li>
                  </ul>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between font-bold text-sm">
                    <span>Digital Specialist</span>
                    <span>2018 - 2019</span>
                  </div>
                  <div className="text-slate-500 text-xs mb-2">Creative Agency XYZ</div>
                  <ul className="list-disc ml-4 space-y-1 text-xs">
                    <li>Executed SEO campaigns for enterprise clients.</li>
                    <li>Implemented Marketo automation flows.</li>
                  </ul>
                </div>
              </div>

              {/* Education */}
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 uppercase text-xs border-b border-slate-300 pb-1 mb-3">
                  Education
                </h3>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Bachelor of Science, Marketing</span>
                  <span className="text-slate-500">2017</span>
                </div>
                <div className="text-slate-500 text-xs">University of Washington</div>
              </div>
            </div>
          </div>

          {/* Right Side: AI Assessment with Tabs */}
          <div className="w-1/2 bg-slate-50/50 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-white px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'overview'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <FileText size={16} />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'analysis'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <ClipboardList size={16} />
                Analysis
                {candidate.quick_score_analysis && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-teal-100 text-teal-700">
                    New
                  </span>
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {activeTab === 'analysis' ? (
                <AnalysisTab candidate={candidate} job={job} onReEvaluate={onReEvaluate} />
              ) : (
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                    Evala Intelligence
                  </h3>

              {/* Score Cards - A-T-Q Model */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="col-span-1 bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center flex flex-col justify-center">
                  <div
                    className={`text-3xl font-bold ${
                      (candidate.stage1Score || candidate.quickScore || 0) >= 85 ? 'text-emerald-600' :
                      (candidate.stage1Score || candidate.quickScore || 0) >= 70 ? 'text-amber-600' : 'text-rose-600'
                    }`}
                  >
                    {candidate.stage1Score || candidate.quickScore || '--'}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    {candidate.stage1Score ? 'Evala Score' : 'Quick Score'}
                  </div>
                </div>
                <div className="col-span-3 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-around items-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-800">
                      {candidate.stage1AScore || candidate.quick_score_analysis?.a_score || '--'}
                    </div>
                    <div className="text-xs text-slate-400">A (50%)</div>
                    <div className="text-[10px] text-slate-300">Accomplishments</div>
                  </div>
                  <div className="w-px h-10 bg-slate-100"></div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-800">
                      {candidate.stage1TScore || candidate.quick_score_analysis?.t_score || '--'}
                    </div>
                    <div className="text-xs text-slate-400">T (30%)</div>
                    <div className="text-[10px] text-slate-300">Trajectory</div>
                  </div>
                  <div className="w-px h-10 bg-slate-100"></div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-800">
                      {candidate.stage1QScore || candidate.quick_score_analysis?.q_score || '--'}
                    </div>
                    <div className="text-xs text-slate-400">Q (20%)</div>
                    <div className="text-[10px] text-slate-300">Qualifications</div>
                  </div>
                </div>
              </div>

              {/* AI Assessment */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-teal-500" />
                  Evala Assessment
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {candidate.stage1Reasoning || candidate.quick_score_analysis?.reasoning || candidate.summary || 'No assessment available yet. Run an evaluation to see the AI analysis.'}
                </p>

                <div className="space-y-3">
                  {/* Key Strengths */}
                  {(candidate.stage1Strengths?.length > 0 || candidate.quick_score_analysis?.key_strengths?.length > 0) && (
                    <div>
                      <div className="text-xs font-bold text-emerald-600 mb-1 flex items-center gap-1">
                        <CheckCircle2 size={12} /> KEY STRENGTHS
                      </div>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {(candidate.stage1Strengths || candidate.quick_score_analysis?.key_strengths || []).map((strength, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-emerald-500 mt-0.5">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Observations (replacing "AREAS TO PROBE" - no penalties, just contextual notes) */}
                  {(candidate.stage1Observations?.length > 0 || candidate.quick_score_analysis?.observations?.length > 0) && (
                    <div>
                      <div className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                        <AlertCircle size={12} /> OBSERVATIONS
                      </div>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {(candidate.stage1Observations || candidate.quick_score_analysis?.observations || []).map((obs, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-slate-400 mt-0.5">•</span>
                            {obs}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Matched Skills */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Matched Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill} color="teal">
                      {skill}
                    </Badge>
                  ))}
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs border border-slate-200 opacity-50">
                    Python (Missing)
                  </span>
                </div>
              </div>

              {/* Fit Assessment */}
              {candidate.score !== undefined && candidate.score !== null && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Fit Assessment</h4>
                  <Badge
                    color={
                      candidate.score >= 85
                        ? 'green'
                        : candidate.score >= 70
                        ? 'yellow'
                        : 'red'
                    }
                  >
                    {candidate.score >= 85 ? 'Strong Fit' : candidate.score >= 70 ? 'Possible Fit' : 'Weak Fit'}
                  </Badge>
                </div>
              )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-slate-200 flex justify-between items-center">
          <Button variant="danger" onClick={handleRemove}>
            Remove from Pool
          </Button>
          <div className="flex gap-3">
            <Button variant="outline">View Resume</Button>
            <Button>
              <Sparkles size={16} />
              Generate Interview Qs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
