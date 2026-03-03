// ============================================================
// ESTATE HUB — ROUTE GUARDS
// frontend/src/components/guards/ProtectedRoute.tsx
// Redirects unauthenticated users to /login
// ============================================================

import { Navigate, Outlet, useLocation } from 'react-router-dom'

interface Props {
  isAuthenticated: boolean
}

export default function ProtectedRoute({ isAuthenticated }: Props) {
  const location = useLocation()

  if (!isAuthenticated) {
    // Saves the page the user was trying to visit
    // so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}