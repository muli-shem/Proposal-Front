// ============================================================
// ESTATE HUB — ADMIN LAYOUT
// src/components/admin/AdminLayout.tsx
// ============================================================

import { useState } from 'react'
import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Building2, Calendar, CreditCard,
  Users, BarChart2, Settings, Menu, X, Bell,
  LogOut, ExternalLink, Shield,
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import { clearStoredTokens } from '@/services/api'
import { getInitials } from '@/utils/format'

const NAV = [
  { to: '/admin',            label: 'Overview',    icon: LayoutDashboard, end: true },
  { to: '/admin/analytics',  label: 'Analytics',   icon: BarChart2  },
  { to: '/admin/properties', label: 'Properties',  icon: Building2  },
  { to: '/admin/bookings',   label: 'Bookings',    icon: Calendar   },
  { to: '/admin/payments',   label: 'Payments',    icon: CreditCard },
  { to: '/admin/team',       label: 'Team',        icon: Users      },
  { to: '/admin/agency',     label: 'Agency',      icon: Shield     },
  { to: '/admin/settings',   label: 'Settings',    icon: Settings   },
]

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user } = useAppSelector((s) => s.auth)
  const dispatch  = useAppDispatch()
  const navigate  = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    clearStoredTokens()
    navigate('/')
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-sandDark">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-sandDark">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-terra flex items-center justify-center">
            <span className="text-white text-xs font-bold font-display">EH</span>
          </div>
          <div>
            <p className="font-display font-bold text-ink-900 text-sm leading-none">Estate Hub</p>
            <p className="text-[10px] text-terra font-semibold mt-0.5">Admin Panel</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-sand text-ink-400">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Agency badge */}
      {user?.agency && (
        <div className="mx-4 mt-4 px-3 py-2.5 bg-terra-50 border border-terra/20 rounded-xl">
          <p className="text-[10px] text-terra font-semibold uppercase tracking-wide mb-0.5">Managing</p>
          <p className="text-sm font-bold text-ink-900 truncate">{user.agency.name}</p>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                isActive
                  ? 'bg-terra text-white shadow-terra'
                  : 'text-ink-600 hover:bg-sand hover:text-ink-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-white' : 'text-ink-400 group-hover:text-terra transition-colors'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer — user + logout */}
      <div className="px-3 py-3 border-t border-sandDark">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sand transition-colors">
          <div className="w-8 h-8 rounded-lg bg-terra-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user?.avatar_url
              ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              : <span className="text-xs font-bold text-terra">{getInitials(user?.full_name ?? user?.email ?? '?')}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-ink-900 truncate">{user?.full_name ?? 'Admin'}</p>
            <p className="text-[10px] text-ink-400 truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout}
            className="p-1.5 rounded-lg text-ink-400 hover:text-error hover:bg-error/10 transition-colors flex-shrink-0">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const { user } = useAppSelector((s) => s.auth)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user || user.role !== 'agency_admin') return <Navigate to="/dashboard" replace />

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-56 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: -224 }} animate={{ x: 0 }} exit={{ x: -224 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-56 lg:hidden">
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-sandDark flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-sand text-ink-500">
            <Menu size={18} />
          </button>

          <div className="flex-1" />

          {/* Back to site */}
          <a href="/" target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink-500 hover:text-terra rounded-lg hover:bg-sand transition-all">
            View site <ExternalLink size={12} />
          </a>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-sand text-ink-500 transition-colors">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-terra rounded-full" />
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-lg bg-terra-50 flex items-center justify-center overflow-hidden">
            {user?.avatar_url
              ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              : <span className="text-xs font-bold text-terra">{getInitials(user?.full_name ?? '?')}</span>
            }
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}