import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight,
  Search,
  UploadCloud,
  Sparkles,
  MoreHorizontal
} from 'lucide-react';
import { CandidateDetailPanel } from '../components/workbench/CandidateDetailPanel';

// Mock candidates data
const MOCK_CANDIDATES = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Senior Marketing Manager',
    date: 'Oct 24, 2023',
    tier1Score: 92,
    tier2Score: null,
    recommendation: null,
    status: 'New',
    risk: 'Low',
    quals: 90,
    exp: 95,
    flags: 5,
    summary: 'Sarah has exceptional alignment with the JD, specifically in digital marketing campaigns.',
    skills: ['SEO', 'Content Strategy', 'Team Leadership'],
    email: 'sarah.j@example.com'
  },
  {
    id: 2,
    name: 'Mike Ross',
    role: 'Senior Marketing Manager',
    date: 'Oct 24, 2023',
    tier1Score: 88,
    tier2Score: null,
    recommendation: null,
    status: 'New',
    risk: 'Medium',
    quals: 85,
    exp: 92,
    flags: 15,
    summary: 'Strong creative background. Lacks specific experience with enterprise-level budgets.',
    skills: ['Brand Design', 'Copywriting', 'Adobe Suite'],
    email: 'mike.r@example.com'
  },
  {
    id: 3,
    name: 'John Doe',
    role: 'Senior Marketing Manager',
    date: 'Oct 23, 2023',
    tier1Score: 45,
    tier2Score: null,
    recommendation: null,
    status: 'Auto-Reject',
    risk: 'High',
    quals: 40,
    exp: 30,
    flags: 60,
    summary: 'Does not meet minimum education requirements.',
    skills: ['Sales', 'CRM'],
    email: 'j.doe@example.com'
  },
  {
    id: 4,
    name: 'Emily Chen',
    role: 'Senior Marketing Manager',
    date: 'Oct 23, 2023',
    tier1Score: 78,
    tier2Score: null,
    recommendation: null,
    status: 'New',
    risk: 'Low',
    quals: 80,
    exp: 75,
    flags: 5,
    summary: 'Solid generalist background. Good cultural fit potential.',
    skills: ['Analytics', 'Project Management'],
    email: 'e.chen@example.com'
  },
  {
    id: 5,
    name: 'David Miller',
    role: 'Senior Marketing Manager',
    date: 'Oct 22, 2023',
    tier1Score: 65,
    tier2Score: null,
    recommendation: null,
    status: 'New',
    risk: 'High',
    quals: 60,
    exp: 60,
    flags: 40,
    summary: 'Resume formatting makes extraction difficult. Gaps in employment history.',
    skills: ['Social Media'],
    email: 'd.miller@example.com'
  }
];

/**
 * Badge component
 */
function Badge({ children, color = 'slate' }) {
  const colors = {
    green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    yellow: 'bg-amber-100 text-amber-700 border-amber-200',
    red: 'bg-rose-100 text-rose-700 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    teal: 'bg-teal-100 text-teal-700 border-teal-200'
  };
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${colors[color]}`}>
      {children}
    </span>
  );
}

/**
 * Button component
 */
function Button({ children, variant = 'primary', className = '', onClick, disabled }) {
  const baseStyle = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-teal-500 hover:bg-teal-600 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50',
    outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700',
    ai: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

/**
 * WorkbenchPage - Main candidate management table
 */
export function WorkbenchPage() {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const [candidates, setCandidates] = useState(MOCK_CANDIDATES);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailCandidate, setDetailCandidate] = useState(null);

  // Mock role name
  const activeRoleName = 'Senior Marketing Manager';

  const toggleCandidateSelection = (id) => {
    if (selectedCandidates.includes(id)) {
      setSelectedCandidates(selectedCandidates.filter(c => c !== id));
    } else {
      setSelectedCandidates([...selectedCandidates, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(candidates.map(c => c.id));
    }
  };

  const runAIAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      const updatedCandidates = candidates.map(c => {
        if (selectedCandidates.includes(c.id)) {
          let tier2 = 0;
          let rec = 'Decline';

          if (c.tier1Score > 90) { tier2 = 94; rec = 'Interview'; }
          else if (c.tier1Score > 80) { tier2 = 86; rec = 'Phone Screen'; }
          else if (c.tier1Score > 60) { tier2 = 72; rec = 'Phone Screen'; }
          else { tier2 = 55; rec = 'Decline'; }

          return { ...c, tier2Score: tier2, recommendation: rec, status: 'Analyzed' };
        }
        return c;
      });
      setCandidates(updatedCandidates);
      setSelectedCandidates([]);
      setAnalyzing(false);
    }, 1500);
  };

  const getScoreColor = (score) => {
    if (!score) return 'text-slate-400';
    if (score >= 85) return 'text-emerald-600 font-bold';
    if (score >= 70) return 'text-amber-600 font-bold';
    return 'text-rose-600 font-bold';
  };

  const filteredCandidates = candidates.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center shadow-sm z-10">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <span
              className="cursor-pointer hover:text-teal-600"
              onClick={() => navigate('/app')}
            >
              Dashboard
            </span>
            <ChevronRight size={14} />
            <span>{activeRoleName}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Candidate Workbench</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right mr-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Stage</div>
            <div className="font-medium text-teal-700 bg-teal-50 px-3 py-1 rounded-full text-sm">
              Resume Screening
            </div>
          </div>
          <Button variant="outline">
            <UploadCloud size={18} />
            Upload Resumes
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-8 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="h-6 w-px bg-slate-300"></div>
          <span className="text-sm text-slate-600">
            Showing <strong>{filteredCandidates.length}</strong> candidates
          </span>
        </div>

        <div className={`transition-all duration-300 flex items-center gap-3 ${
          selectedCandidates.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-1 pointer-events-none'
        }`}>
          <span className="text-sm font-medium text-slate-700">
            {selectedCandidates.length} Selected
          </span>
          <Button
            onClick={runAIAnalysis}
            disabled={analyzing}
            variant="ai"
          >
            {analyzing ? (
              <span className="flex items-center gap-2">Analyzing...</span>
            ) : (
              <>
                <Sparkles size={16} />
                Run AI Analysis ({selectedCandidates.length * 5} Credits)
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white px-8 py-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <th className="py-3 pl-4 w-12">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  checked={selectedCandidates.length === candidates.length && candidates.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="py-3">Candidate Name</th>
              <th className="py-3">Date Uploaded</th>
              <th className="py-3">Tier 1: Keyword Match</th>
              <th className="py-3">Tier 2: AI Score</th>
              <th className="py-3">Recommendation</th>
              <th className="py-3">Status</th>
              <th className="py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCandidates.map((candidate) => (
              <tr
                key={candidate.id}
                className={`hover:bg-slate-50 transition-colors group ${
                  selectedCandidates.includes(candidate.id) ? 'bg-indigo-50 hover:bg-indigo-50' : ''
                }`}
              >
                <td className="py-4 pl-4">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    checked={selectedCandidates.includes(candidate.id)}
                    onChange={() => toggleCandidateSelection(candidate.id)}
                  />
                </td>
                <td className="py-4">
                  <div className="font-medium text-slate-900">{candidate.name}</div>
                  <div className="text-xs text-slate-500">{candidate.role}</div>
                </td>
                <td className="py-4 text-sm text-slate-600">{candidate.date}</td>

                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          candidate.tier1Score > 80
                            ? 'bg-emerald-500'
                            : candidate.tier1Score < 50
                            ? 'bg-rose-400'
                            : 'bg-amber-400'
                        }`}
                        style={{ width: `${candidate.tier1Score}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {candidate.tier1Score}%
                    </span>
                  </div>
                </td>

                <td className="py-4">
                  {candidate.tier2Score !== null ? (
                    <div className="flex flex-col">
                      <span className={`text-lg ${getScoreColor(candidate.tier2Score)}`}>
                        {candidate.tier2Score}/100
                      </span>
                      <div className="flex gap-1 mt-1">
                        <div
                          title="Qualifications"
                          className={`w-2 h-2 rounded-full ${
                            candidate.quals > 80 ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                        ></div>
                        <div
                          title="Experience"
                          className={`w-2 h-2 rounded-full ${
                            candidate.exp > 80 ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                        ></div>
                        <div
                          title="Risk"
                          className={`w-2 h-2 rounded-full ${
                            candidate.risk === 'Low' ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (!selectedCandidates.includes(candidate.id)) {
                          toggleCandidateSelection(candidate.id);
                        }
                      }}
                      className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition flex items-center w-fit gap-1"
                    >
                      <Sparkles size={12} /> Unlock
                    </button>
                  )}
                </td>

                <td className="py-4">
                  {candidate.recommendation ? (
                    <Badge
                      color={
                        candidate.recommendation === 'Interview'
                          ? 'green'
                          : candidate.recommendation === 'Decline'
                          ? 'red'
                          : 'yellow'
                      }
                    >
                      {candidate.recommendation}
                    </Badge>
                  ) : (
                    <span className="text-slate-400 text-sm">--</span>
                  )}
                </td>

                <td className="py-4 text-sm text-slate-600">{candidate.status}</td>

                <td className="py-4 text-right pr-4">
                  {candidate.tier2Score !== null ? (
                    <button
                      className="text-teal-600 hover:text-teal-800 font-medium text-sm"
                      onClick={() => setDetailCandidate(candidate)}
                    >
                      View Details
                    </button>
                  ) : (
                    <span className="text-slate-300">
                      <MoreHorizontal size={20} className="inline" />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Candidate Detail Panel */}
      <CandidateDetailPanel
        candidate={detailCandidate}
        onClose={() => setDetailCandidate(null)}
        onUpdateStatus={(id, status) => {
          setCandidates(candidates.map(c =>
            c.id === id ? { ...c, status } : c
          ));
        }}
      />
    </div>
  );
}
