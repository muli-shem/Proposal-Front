// ============================================================
// ESTATE HUB — DASHBOARD LAYOUT
// frontend/src/layouts/DashboardLayout.tsx
// Sidebar + content area for authenticated users
// ============================================================

import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  LayoutDashboard, Building2, Calendar, MessageSquare,
  Settings, LogOut, Menu, X, Bell,
} from 'lucide-react'
import type { RootState } from '../../store/store'
import { logout } from '../../store/slices/authSlice'
import authService from '../../services/authService'

const navItems = [
  { to: '/dashboard',           icon: LayoutDashboard, label: 'Overview'  },
  { to: '/dashboard/listings',  icon: Building2,       label: 'Listings'  },
  { to: '/dashboard/bookings',  icon: Calendar,        label: 'Bookings'  },
  { to: '/dashboard/messages',  icon: MessageSquare,   label: 'Messages'  },
  { to: '/dashboard/settings',  icon: Settings,        label: 'Settings'  },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const { user, refreshToken } = useSelector((s: RootState) => s.auth)
  const unread = useSelector((s: RootState) => s.notification.unreadCount)

  const handleLogout = async () => {
    try {
      if (refreshToken) await authService.logout(refreshToken)
    } finally {
      dispatch(logout())
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-sm">EH</span>
            </div>
            <span className="font-semibold text-lg">EstateHub</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold">
                {user?.first_name?.[0]}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{user?.full_name}</p>
              <p className="text-slate-400 text-xs capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3 ml-auto">
            {/* Notifications bell */}
            <button className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100">
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  )
}