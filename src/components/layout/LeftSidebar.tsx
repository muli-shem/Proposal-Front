// ============================================================
// ESTATE HUB — LEFT SIDEBAR
// src/components/layout/LeftSidebar.tsx
// ============================================================

import { Link, useLocation } from 'react-router-dom'
import {
  Home, Building2, Clapperboard, Bookmark,
  LayoutDashboard, MessageCircle, Bell, Settings,
} from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { getInitials } from '@/utils/format'

const NAV_ITEMS = [
  { to: '/feed',                    label: 'Home Feed',      icon: Home },
  { to: '/properties',              label: 'Properties',     icon: Building2 },
  { to: '/reels',                   label: 'Reels',          icon: Clapperboard },
  { to: '/dashboard/saved',         label: 'Saved',          icon: Bookmark },
  { to: '/dashboard/messages',      label: 'Messages',       icon: MessageCircle },
  { to: '/dashboard',               label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/dashboard/notifications', label: 'Notifications',  icon: Bell },
  { to: '/dashboard/settings',      label: 'Settings',       icon: Settings },
]

export default function LeftSidebar() {
  const location = useLocation()
  const { user } = useAppSelector((s) => s.auth)

  return (
    <div className="flex flex-col gap-1">
      {/* User mini profile */}
      {user && (
        <Link
          to="/dashboard/profile"
          className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2 hover:bg-stone-100 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white text-sm font-semibold overflow-hidden flex-shrink-0">
            {user.avatar_url
              ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
              : <span>{getInitials(user.full_name || user.email)}</span>
            }
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
              {user.full_name}
            </p>
            <p className="text-xs text-gray-500 truncate capitalize">
              {user.role.replace('_', ' ')}
            </p>
          </div>
        </Link>
      )}

      <div className="h-px bg-stone-200 mb-2" />

      {/* Nav links */}
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname === to ||
          (to !== '/feed' && to !== '/properties' && to !== '/reels' &&
           location.pathname.startsWith(to))

        return (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-600 hover:bg-stone-100 hover:text-gray-900'
            }`}
          >
            <Icon size={17} />
            <span>{label}</span>
          </Link>
        )
      })}

      <div className="h-px bg-stone-200 mt-4 mb-4" />
      <div className="px-3">
        <p className="text-xs text-gray-400 leading-relaxed">
          Estate Hub — Kenya's Premier Property Marketplace
        </p>
      </div>
    </div>
  )
}