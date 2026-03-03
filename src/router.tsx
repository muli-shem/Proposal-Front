// ============================================================
// ESTATE HUB — ROUTER
// src/router.tsx
// ============================================================

import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'

// Layouts
import AuthLayout from '@/components/layout/AuthLayout'
import MainLayout from '@/components/layout/MainLayout'
import PublicLayout from '@/components/layout/PublicLayout'

// Page loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-canvas">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-terra border-t-transparent animate-spin" />
      <p className="text-sm text-ink-500 font-body">Loading…</p>
    </div>
  </div>
)

const S = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
)

// ─── Lazy pages ───────────────────────────────────────────────
const HomePage           = lazy(() => import('@/pages/Home/HomePage'))
const LoginPage          = lazy(() => import('@/pages/Auth/LoginPage'))
const RegisterPage       = lazy(() => import('@/pages/Auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/Auth/ForgotPasswordPage'))
const ResetPasswordPage  = lazy(() => import('@/pages/Auth/ResetPasswordPage'))
const VerifyEmailPage    = lazy(() => import('@/pages/Auth/VerifyEmailPage'))
const PropertiesPage     = lazy(() => import('@/pages/Properties/PropertiesPage'))
const PropertyDetailPage = lazy(() => import('@/pages/Properties/PropertyDetailPage'))
const ReelsPage          = lazy(() => import('@/pages/Reels/ReelsPage'))
const AgencyProfilePage  = lazy(() => import('@/pages/Agency/AgencyProfilePage'))
const DashboardPage      = lazy(() => import('@/pages/Dashboard/DashboardPage'))
const FeedPage           = lazy(() => import('@/pages/Feed/FeedPage'))

// ─── Protected Route wrapper ──────────────────────────────────
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

// ─── Router ───────────────────────────────────────────────────
export const router = createBrowserRouter([
  // Public pages with full navbar + footer
  {
    element: <PublicLayout />,
    children: [
      { path: '/',              element: S(HomePage) },
      { path: '/properties',   element: S(PropertiesPage) },
      { path: '/properties/:id', element: S(PropertyDetailPage) },
      { path: '/agencies/:id', element: S(AgencyProfilePage) },
      { path: '/reels',        element: S(ReelsPage) },
    ],
  },

  // Auth pages (centered card layout)
  {
    element: <AuthLayout />,
    children: [
      { path: '/login',           element: S(LoginPage) },
      { path: '/register',        element: S(RegisterPage) },
      { path: '/forgot-password', element: S(ForgotPasswordPage) },
      { path: '/reset-password',  element: S(ResetPasswordPage) },
      { path: '/verify-email',    element: S(VerifyEmailPage) },
    ],
  },

  // Authenticated pages (3-column feed shell)
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/feed',       element: S(FeedPage) },
      { path: '/dashboard',  element: S(DashboardPage) },
      { path: '/dashboard/*', element: S(DashboardPage) },
    ],
  },

  // 404
  { path: '*', element: <Navigate to="/" replace /> },
])