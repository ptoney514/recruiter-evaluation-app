import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';

/**
 * Badge component for role status
 */
function Badge({ children, color = 'slate' }) {
  const colors = {
    green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    yellow: 'bg-amber-100 text-amber-700 border-amber-200',
    red: 'bg-rose-100 text-rose-700 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${colors[color]}`}>
      {children}
    </span>
  );
}

/**
 * RoleCard - Enhanced project/role card for dashboard
 * Shows role info, applicant count, and progress
 */
export function RoleCard({ role, onClick }) {
  const navigate = useNavigate();

  // Derive status from role data
  const getStatus = () => {
    if (role.status === 'archived') return { label: 'Archived', color: 'slate' };
    if (role.status === 'paused') return { label: 'Paused', color: 'yellow' };
    return { label: 'Active', color: 'green' };
  };

  const status = getStatus();

  // Mock data for now - will be wired to real data later
  const applicantCount = role.candidate_count || 0;
  const progress = role.progress || 35;
  const location = role.location || 'Remote';
  const department = role.department || 'General';

  const handleClick = () => {
    if (onClick) {
      onClick(role);
    } else {
      // Navigate to workbench for new UI flow
      navigate(`/app/role/${role.id}/workbench`);
    }
  };

  return (
    <div
      className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition cursor-pointer group"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-900 group-hover:text-teal-600 transition">
            {role.title}
          </h3>
          <p className="text-slate-500 text-sm">
            {location} • {department}
          </p>
        </div>
        <Badge color={status.color}>{status.label}</Badge>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
        <Users size={16} />
        <span>{applicantCount} Applicants</span>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all ${
            status.label === 'Active' ? 'bg-teal-500' : 'bg-slate-300'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-500">
        <span>Screening</span>
        <span>{progress}% to goal</span>
      </div>
    </div>
  );
}
