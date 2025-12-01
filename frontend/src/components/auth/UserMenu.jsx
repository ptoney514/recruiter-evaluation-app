/**
 * User Menu Component
 * Displays auth status and user menu in navigation
 * Shows DEV MODE badge when auth bypass is enabled
 */
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'

export function UserMenu({ onOpenAuth }) {
  const user = useAuth((state) => state.user)
  const loading = useAuth((state) => state.loading)
  const isDevBypass = useAuth((state) => state.isDevBypass)
  const logout = useAuth((state) => state.logout)
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
    <div className="relative flex items-center gap-2">
      {/* Dev Mode Badge */}
      {isDevBypass && (
        <span className="px-2 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-md border border-amber-300">
          DEV MODE
        </span>
      )}

      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-semibold ${isDevBypass ? 'bg-amber-600' : 'bg-primary-600'}`}>
          {user.email.charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-gray-900">{user.email}</div>
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
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-900">{user.email}</div>
              {isDevBypass && (
                <div className="text-xs text-amber-600 mt-1">
                  Auth bypass enabled - edit .env.local to disable
                </div>
              )}
            </div>

            <div className="p-2">
              <button
                onClick={async () => {
                  await logout()
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
