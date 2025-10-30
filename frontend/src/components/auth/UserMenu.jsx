/**
 * User Menu Component
 * Displays auth status and user menu in navigation
 */
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useStorageInfo } from '../../hooks/useEvaluations'
import { Button } from '../ui/Button'

export function UserMenu({ onOpenAuth }) {
  const { user, signOut, loading } = useAuth()
  const { data: storageInfo } = useStorageInfo()
  const [showDropdown, setShowDropdown] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        {storageInfo?.mode === 'session' && (
          <span className="text-xs text-gray-500 hidden sm:inline">
            Using temporary storage
          </span>
        )}
        <Button onClick={() => onOpenAuth('login')} variant="secondary" size="sm">
          Sign In
        </Button>
        <Button onClick={() => onOpenAuth('signup')} size="sm">
          Sign Up
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
          {user.email.charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-gray-900">{user.email}</div>
          <div className="text-xs text-gray-500">
            {storageInfo?.mode === 'database' ? 'Cloud Storage' : 'Session Storage'}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          ></div>

          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-900">{user.email}</div>
              <div className="text-xs text-gray-500 mt-1">
                Storage: {storageInfo?.mode === 'database' ? 'Cloud (Persistent)' : 'Session (Temporary)'}
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={async () => {
                  await signOut()
                  setShowDropdown(false)
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
