// ============================================================
// ESTATE HUB — ROUTER
// src/router.tsx
// ============================================================

import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'

// Layouts
import AuthLayout   from '@/components/layout/AuthLayout'
import MainLayout   from '@/components/layout/MainLayout'
import PublicLayout from '@/components/layout/PublicLayout'

// ── Page loading spinner ──────────────────────────────────────
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

// ── Lazy pages — Public ───────────────────────────────────────
const HomePage           = lazy(() => import('@/pages/Home/HomePage'))
const PropertiesPage     = lazy(() => import('@/pages/Properties/PropertiesPage'))
const PropertyDetailPage = lazy(() => import('@/pages/Properties/PropertyDetailPage'))
const AgencyProfilePage  = lazy(() => import('@/pages/Agency/AgencyProfilePage'))
const ReelsPage          = lazy(() => import('@/pages/Reels/ReelsPage'))

// ── Lazy pages — Auth ─────────────────────────────────────────
const LoginPage          = lazy(() => import('@/pages/Auth/LoginPage'))
const RegisterPage       = lazy(() => import('@/pages/Auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/Auth/ForgotPasswordPage'))
const ResetPasswordPage  = lazy(() => import('@/pages/Auth/ResetPasswordPage'))
const VerifyEmailPage    = lazy(() => import('@/pages/Auth/VerifyEmailPage'))

// ── Lazy pages — Dashboard (authenticated) ───────────────────
const FeedPage           = lazy(() => import('@/pages/Feed/FeedPage'))
const DashboardPage      = lazy(() => import('@/pages/Dashboard/DashboardPage'))
const ProfilePage        = lazy(() => import('@/pages/Dashboard/sub/ProfilePage'))
const SavedPage          = lazy(() => import('@/pages/Dashboard/sub/SavedPage'))
const BookingsPage       = lazy(() => import('@/pages/Dashboard/sub/BookingsPage'))
const MessagesPage       = lazy(() => import('@/pages/Dashboard/sub/MessagesPage'))
const NotificationsPage  = lazy(() => import('@/pages/Dashboard/sub/NotificationsPage'))
const VerificationPage   = lazy(() => import('@/pages/Dashboard/sub/VerificationPage'))
const SettingsPage       = lazy(() => import('@/pages/Dashboard/sub/SettingsPage'))

// ── Protected route wrapper ───────────────────────────────────
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

// ── Router ────────────────────────────────────────────────────
export const router = createBrowserRouter([

  // ── Public pages (Navbar + Footer) ─────────────────────────
  {
    element: <PublicLayout />,
    children: [
      { path: '/',                element: S(HomePage)           },
      { path: '/properties',      element: S(PropertiesPage)     },
      { path: '/properties/:id',  element: S(PropertyDetailPage) },
      { path: '/agencies/:id',    element: S(AgencyProfilePage)  },
      { path: '/reels',           element: S(ReelsPage)          },
    ],
  },

  // ── Auth pages (centered card) ──────────────────────────────
  {
    element: <AuthLayout />,
    children: [
      { path: '/login',            element: S(LoginPage)          },
      { path: '/register',         element: S(RegisterPage)       },
      { path: '/forgot-password',  element: S(ForgotPasswordPage) },
      { path: '/reset-password',   element: S(ResetPasswordPage)  },
      { path: '/verify-email',     element: S(VerifyEmailPage)    },
    ],
  },

  // ── Authenticated pages (3-column shell) ────────────────────
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      // Feed
      { path: '/feed', element: S(FeedPage) },

      // Dashboard with nested sub-routes
      {
        path: '/dashboard',
        element: <Outlet />,
        children: [
          { index: true,                  element: S(DashboardPage)     },
          { path: 'profile',              element: S(ProfilePage)       },
          { path: 'saved',                element: S(SavedPage)         },
          { path: 'bookings',             element: S(BookingsPage)      },
          { path: 'messages',             element: S(MessagesPage)      },
          { path: 'notifications',        element: S(NotificationsPage) },
          { path: 'verification',         element: S(VerificationPage)  },
          { path: 'settings',             element: S(SettingsPage)      },
          // Catch-all for unknown dashboard routes → redirect to overview
          { path: '*',                    element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },

  // ── 404 ─────────────────────────────────────────────────────
  { path: '*', element: <Navigate to="/" replace /> },
])