import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Trash2, Edit2 } from 'lucide-react';
import { useDeleteJob } from '../../hooks/useJobs';
import { EditProjectModal } from './EditProjectModal';

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
  const deleteJob = useDeleteJob();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Derive status from role data
  const getStatus = () => {
    if (role.status === 'archived') return { label: 'Archived', color: 'slate' };
    if (role.status === 'paused') return { label: 'Paused', color: 'yellow' };
    return { label: 'Active', color: 'green' };
  };

  const status = getStatus();

  // Get real data from role
  const candidatesCount = role.candidates_count || 0;
  const evaluatedCount = role.evaluated_count || 0;

  const handleClick = () => {
    if (onClick) {
      onClick(role);
    } else {
      // Navigate to workbench for new UI flow
      navigate(`/app/role/${role.id}/workbench`);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${role.title}"? This will remove all ${candidatesCount} candidates and their evaluations.`)) {
      deleteJob.mutate(role.id);
    }
  };

  return (
    <div
      className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition group"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-lg text-slate-900 group-hover:text-teal-600 transition flex-1">
          {role.title}
        </h3>
        <div className="flex gap-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditModalOpen(true);
            }}
            className="p-2 text-slate-400 hover:text-teal-600 disabled:opacity-50 flex-shrink-0"
            title="Edit role"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteJob.isPending}
            className="p-2 text-slate-400 hover:text-red-600 disabled:opacity-50 flex-shrink-0"
            title="Delete role"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Users size={16} />
        <span>{candidatesCount} candidate{candidatesCount !== 1 ? 's' : ''} • {evaluatedCount} evaluated</span>
      </div>

      <button
        onClick={handleClick}
        className="mt-4 w-full py-2 px-3 bg-teal-50 text-teal-700 rounded-lg font-medium hover:bg-teal-100 transition text-sm"
      >
        Open Workbench
      </button>

      {isEditModalOpen && (
        <EditProjectModal
          project={role}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
}
