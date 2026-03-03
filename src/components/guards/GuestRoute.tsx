// ============================================================
// ESTATE HUB — GUEST ROUTE GUARD
// frontend/src/components/guards/GuestRoute.tsx
// Redirects already-authenticated users away from auth pages
// ============================================================

import { Navigate, Outlet } from 'react-router-dom'

interface Props {
  isAuthenticated: boolean
}

export default function GuestRoute({ isAuthenticated }: Props) {
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}