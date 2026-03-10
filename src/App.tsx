// ============================================================
// ESTATE HUB — ROOT APP COMPONENT
// frontend/src/App.tsx
// Defines all routes and global layout structure
// ============================================================

import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from './store/store'

// Layouts
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'
import DashboardLayout from './components/layout/DashboardLayout'

// Public Pages
import HomePage from '@/pages/Home/HomePage'
import PropertiesPage from '@/pages/Properties/PropertiesPage'
import PropertyDetailPage from '@/pages/Properties/PropertyDetailPage'
import AgencyProfilePage from '@/pages/Agency/AgencyProfilePage'
import ReelsPage from '@/pages/Reels/ReelsPage'

// Auth Pages
import LoginPage from '@/pages/Auth/LoginPage'
import RegisterPage from '@/pages/Auth/RegisterPage'
import ForgotPasswordPage from '@/pages/Auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/Auth/ResetPasswordPage'
import VerifyEmailPage from '@/pages/Auth/VerifyEmailPage'

// Dashboard Pages
import DashboardPage from '@/pages/Dashboard/DashboardPage'
// import MyListingsPage from '@/pages/Dashboard/MyListingsPage'
// import BookingsPage from '@/pages/Dashboard/BookingsPage'
// import MessagesPage from '@/pages/Dashboard/MessagesPage'
// import ProfileSettingsPage from '@/pages/Dashboard/ProfileSettingsPage'



export default function App() {
  

  return (
    <Routes>

      {/* ── Public Routes (with main navbar) ──────────────── */}
      <Route element={<MainLayout />}>
        <Route path="/"                  element={<HomePage />} />
        <Route path="/properties"        element={<PropertiesPage />} />
        <Route path="/properties/:id"    element={<PropertyDetailPage />} />
        <Route path="/agencies/:id"      element={<AgencyProfilePage />} />
        <Route path="/reels"             element={<ReelsPage />} />
      </Route>

      {/* ── Auth Routes (no navbar — clean layout) ────────── */}
      <Route element={<AuthLayout />}>
        <Route path="/login"                    element={<LoginPage />} />
        <Route path="/register"                 element={<RegisterPage />} />
        <Route path="/forgot-password"          element={<ForgotPasswordPage />} />
        <Route path="/reset-password"           element={<ResetPasswordPage />} />
        <Route path="/verify-email"             element={<VerifyEmailPage />} />
      </Route>

      {/* ── Protected Dashboard Routes ────────────────────── */}
      {/* <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}> */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard"                element={<DashboardPage />} />
          {/* <Route path="/dashboard/listings"       element={<MyListingsPage />} />
          <Route path="/dashboard/bookings"       element={<BookingsPage />} />
          <Route path="/dashboard/messages"       element={<MessagesPage />} />
          <Route path="/dashboard/settings"       element={<ProfileSettingsPage /> */}
        </Route>
      {/* </Route> */}

      {/* ── Fallback ──────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}
