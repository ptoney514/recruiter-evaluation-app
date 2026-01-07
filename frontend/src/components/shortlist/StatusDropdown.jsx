import React, { useState, useRef, useEffect } from 'react';
import {
  Circle,
  CheckCircle,
  XCircle,
  ThumbsUp,
  HelpCircle,
  ThumbsDown,
  ChevronDown
} from 'lucide-react';

const STATUS_CONFIG = {
  'new': {
    label: 'New - Needs Review',
    color: 'slate',
    icon: Circle
  },
  'meets-reqs': {
    label: 'Meets Reqs',
    color: 'blue',
    icon: CheckCircle
  },
  'doesnt-meet': {
    label: "Doesn't Meet",
    color: 'red',
    icon: XCircle
  },
  'reviewed-forward': {
    label: 'Move Forward',
    color: 'green',
    icon: ThumbsUp
  },
  'reviewed-maybe': {
    label: 'Maybe',
    color: 'yellow',
    icon: HelpCircle
  },
  'reviewed-decline': {
    label: 'Decline',
    color: 'rose',
    icon: ThumbsDown
  }
};

const COLOR_STYLES = {
  slate: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  red: 'bg-red-100 text-red-700 hover:bg-red-200',
  green: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  yellow: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  rose: 'bg-rose-100 text-rose-700 hover:bg-rose-200'
};

export function StatusDropdown({
  candidateId,
  currentStatus = 'new',
  onStatusChange,
  disabled = false,
  size = 'md'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef(null);

  const config = STATUS_CONFIG[currentStatus];
  const colorStyle = COLOR_STYLES[config.color];
  const Icon = config.icon;

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      setIsOpen(!isOpen);
    }
  };

  const handleStatusSelect = async (newStatus) => {
    if (newStatus === currentStatus || isUpdating || disabled) return;

    setIsUpdating(true);
    setIsOpen(false);

    try {
      await onStatusChange(candidateId, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
      setIsOpen(true); // Reopen on error
    } finally {
      setIsUpdating(false);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm gap-1',
    md: 'px-3 py-2 text-sm gap-2',
    lg: 'px-4 py-2.5 text-base gap-2'
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled || isUpdating}
        className={`
          flex items-center justify-between gap-2 rounded-lg font-medium
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
          ${sizeClasses[size]}
          ${colorStyle}
          ${disabled || isUpdating ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          ${isOpen ? 'ring-2 ring-offset-2' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1">
          <Icon size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
          <span>{config.label}</span>
        </div>
        <ChevronDown
          size={size === 'sm' ? 14 : 16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          <ul className="py-1" role="listbox">
            {Object.entries(STATUS_CONFIG).map(([statusKey, statusConfig]) => {
              const StatusIcon = statusConfig.icon;
              const isSelected = statusKey === currentStatus;
              const itemColorStyle = COLOR_STYLES[statusConfig.color];

              return (
                <li key={statusKey}>
                  <button
                    onClick={() => handleStatusSelect(statusKey)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleStatusSelect(statusKey);
                      }
                    }}
                    className={`
                      w-full px-4 py-2.5 text-left flex items-center gap-2
                      transition-colors duration-150 text-sm
                      ${isSelected ? itemColorStyle : 'text-gray-700 hover:bg-gray-50'}
                      ${isSelected ? 'font-semibold' : ''}
                    `}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <StatusIcon size={16} />
                    <span>{statusConfig.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
