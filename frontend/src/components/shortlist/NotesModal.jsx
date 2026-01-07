import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const QUICK_TAGS = [
  'Strong Fit',
  'Follow-up',
  'Culture Fit',
  'Salary Mismatch',
  'Location Issue',
  'Overqualified',
  'Needs Interview',
  'Reference Check'
];

export function NotesModal({
  candidateId,
  candidateName,
  initialNotes = '',
  initialTags = [],
  onSave,
  onClose,
  isLoading = false
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [selectedTags, setSelectedTags] = useState(initialTags);
  const [draftSaved, setDraftSaved] = useState(false);

  // Auto-save draft to localStorage
  useEffect(() => {
    const draftKey = `notes-draft-${candidateId}`;
    const timer = setTimeout(() => {
      if (notes !== initialNotes || selectedTags !== initialTags) {
        localStorage.setItem(draftKey, JSON.stringify({
          notes,
          tags: selectedTags,
          savedAt: new Date().toISOString()
        }));
        setDraftSaved(true);

        // Hide "draft saved" indicator after 2 seconds
        setTimeout(() => setDraftSaved(false), 2000);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [notes, selectedTags, candidateId, initialNotes, initialTags]);

  const toggleTag = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleSave = async () => {
    try {
      await onSave(candidateId, notes, selectedTags);
      // Clear draft after successful save
      localStorage.removeItem(`notes-draft-${candidateId}`);
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      {/* Modal Content */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Candidate Notes</h2>
            <p className="text-sm text-gray-600 mt-1">{candidateName}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Notes Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Recruiter Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
              placeholder="Add notes about this candidate..."
              className="
                w-full h-40 px-4 py-3 border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:bg-gray-50 disabled:text-gray-500
                resize-none
              "
            />
            <p className="text-xs text-gray-500 mt-2">
              {notes.length} characters
            </p>
          </div>

          {/* Quick Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Quick Tags ({selectedTags.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    disabled={isLoading}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium
                      transition-all duration-200
                      ${isSelected
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }
                      ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                    `}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex items-center justify-between gap-3 bg-gray-50">
          <div className="flex items-center gap-2">
            {draftSaved && (
              <span className="text-xs text-green-600 font-medium">
                ✓ Draft saved
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="
                px-4 py-2 rounded-lg font-medium
                border border-gray-300 text-gray-700
                hover:bg-gray-100 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="
                px-4 py-2 rounded-lg font-medium
                bg-blue-600 text-white hover:bg-blue-700 transition-colors
                flex items-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <Save size={16} />
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
