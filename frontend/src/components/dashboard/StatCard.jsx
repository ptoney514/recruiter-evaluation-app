import React from 'react';

/**
 * StatCard - Dashboard statistics card
 * Displays a single metric with label
 */
export function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-slate-500 text-sm font-medium mb-2">{label}</div>
          <div className="text-4xl font-bold text-slate-900">{value}</div>
        </div>
        {Icon && (
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
}
