import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Archive,
  Database,
  Settings,
  UserCircle,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Mock credits for now
  const credits = 250;

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
    { icon: Users, label: 'Active Positions', path: '/app/positions' },
    { icon: Archive, label: 'Archived Positions', path: '/app/archived' },
    { icon: Database, label: 'Candidate DB', path: '/app/candidates' },
  ];

  const isActive = (path) => {
    if (path === '/app') {
      return location.pathname === '/app';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 h-screen">
      {/* Logo */}
      <div
        className="p-6 flex items-center gap-3 text-white mb-6 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg shadow-teal-900/50">
          E
        </div>
        <span className="text-xl font-bold tracking-tight">Eval</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors ${
                active
                  ? 'bg-slate-800 text-white shadow-inner'
                  : 'hover:bg-slate-800/50'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 mt-auto border-t border-slate-800">
        {/* Credits Display */}
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-4 px-2">
          <DollarSign size={14} />
          <span>Credits: {credits}</span>
        </div>

        {/* Settings */}
        <button
          onClick={() => navigate('/app/settings')}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-slate-800/50 transition-colors text-sm"
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>

        {/* User Menu */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-slate-800/50 transition-colors text-sm"
        >
          <UserCircle size={18} />
          <span className="truncate">{user?.email || 'User'}</span>
        </button>
      </div>
    </div>
  );
}
