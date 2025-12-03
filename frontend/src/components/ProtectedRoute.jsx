/**
 * ProtectedRoute Component (Simplified for Personal Use)
 *
 * In single-user mode, all routes are accessible.
 * Simply renders children without authentication checks.
 */
export function ProtectedRoute({ children }) {
  return children
}
