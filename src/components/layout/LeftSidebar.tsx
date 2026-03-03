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
  { to: '/feed',                label: 'Home Feed',      icon: Home },
  { to: '/properties',          label: 'Properties',     icon: Building2 },
  { to: '/reels',               label: 'Reels',          icon: Clapperboard },
  { to: '/dashboard/saved',     label: 'Saved',          icon: Bookmark },
  { to: '/dashboard/messages',  label: 'Messages',       icon: MessageCircle },
  { to: '/dashboard',           label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { to: '/dashboard/settings',  label: 'Settings',       icon: Settings },
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
          className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2
                     hover:bg-sand transition-all group"
        >
          <div className="avatar-md flex-shrink-0">
            {user.avatar_url
              ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
              : <span>{getInitials(user.full_name || user.email)}</span>
            }
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900 truncate group-hover:text-terra transition-colors">
              {user.full_name}
            </p>
            <p className="text-xs text-ink-500 truncate capitalize">
              {user.role.replace('_', ' ')}
            </p>
          </div>
        </Link>
      )}

      <div className="divider mb-2" />

      {/* Nav links */}
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname === to ||
          (to !== '/feed' && to !== '/properties' && to !== '/reels' &&
           location.pathname.startsWith(to))

        return (
          <Link
            key={to}
            to={to}
            className={isActive ? 'nav-link-active' : 'nav-link'}
          >
            <Icon size={17} />
            <span>{label}</span>
          </Link>
        )
      })}

      {/* Divider and Estate Hub branding */}
      <div className="divider mt-4 mb-4" />
      <div className="px-3">
        <p className="text-xs text-ink-300 leading-relaxed">
          Estate Hub — Kenya's Premier Property Marketplace
        </p>
      </div>
    </div>
  )
}