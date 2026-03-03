// ============================================================
// ESTATE HUB — NAVBAR
// src/components/layout/Navbar.tsx
// ============================================================

import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Bell, ChevronDown, LogOut, User, LayoutDashboard,
  Menu, X, Building2, Clapperboard, Home, BookMarked,
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import { clearStoredTokens } from '@/services/api'
import authService from '@/services/authService'
import { getInitials } from '@/utils/format'

export default function Navbar() {
  const dispatch  = useAppDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()
  const { isAuthenticated, user } = useAppSelector((s) => s.auth)

  const [searchOpen,    setSearchOpen]    = useState(false)
  const [searchQuery,   setSearchQuery]   = useState('')
  const [avatarOpen,    setAvatarOpen]    = useState(false)
  const [mobileOpen,    setMobileOpen]    = useState(false)
  const [scrolled,      setScrolled]      = useState(false)

  const avatarRef = useRef<HTMLDivElement>(null)

  // Scroll shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close avatar dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location.pathname])

  const handleLogout = async () => {
    await authService.logout()
    clearStoredTokens()
    dispatch(logout())
    navigate('/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const navLinks = [
    { to: '/properties', label: 'Properties',  icon: Building2 },
    { to: '/reels',      label: 'Reels',        icon: Clapperboard },
  ]

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-nav bg-white border-b border-sandDark
          transition-shadow duration-200
          ${scrolled ? 'shadow-warm' : ''}
        `}
      >
        <div className="page-container h-16 flex items-center gap-4">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-terra flex items-center justify-center shadow-terra">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
                  fill="currentColor"/>
              </svg>
            </div>
            <span className="font-display font-semibold text-ink-900 text-lg
                             group-hover:text-terra transition-colors hidden sm:block">
              Estate Hub
            </span>
          </Link>

          {/* ── Search bar (desktop) ── */}
          <div className="flex-1 max-w-md hidden md:block">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search properties, cities, agencies…"
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-sand border border-sandDark
                             text-sm text-ink-900 placeholder:text-ink-300 font-body
                             focus:outline-none focus:ring-2 focus:ring-terra/30 focus:border-terra
                             transition-all duration-200"
                />
              </div>
            </form>
          </div>

          {/* ── Nav links (desktop) ── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`
                  px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150
                  ${location.pathname === to || location.pathname.startsWith(to + '/')
                    ? 'text-terra bg-terra-50'
                    : 'text-ink-500 hover:text-ink-900 hover:bg-sand'
                  }
                `}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* ── Right side ── */}
          <div className="ml-auto flex items-center gap-2">

            {/* Search icon (mobile) */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-lg text-ink-500 hover:bg-sand hover:text-ink-900 transition-all"
            >
              <Search size={18} />
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button className="relative p-2 rounded-lg text-ink-500 hover:bg-sand hover:text-ink-900 transition-all">
                  <Bell size={18} />
                  {/* Unread dot */}
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-terra" />
                </button>

                {/* Feed link */}
                <Link
                  to="/feed"
                  className={`
                    hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all
                    ${location.pathname === '/feed'
                      ? 'text-terra bg-terra-50'
                      : 'text-ink-500 hover:text-ink-900 hover:bg-sand'
                    }
                  `}
                >
                  <Home size={15} />
                  Feed
                </Link>

                {/* Avatar dropdown */}
                <div ref={avatarRef} className="relative">
                  <button
                    onClick={() => setAvatarOpen(!avatarOpen)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg
                               hover:bg-sand transition-all duration-150"
                  >
                    <div className="avatar-sm text-xs">
                      {user?.avatar_url
                        ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                        : <span>{getInitials(user?.full_name || user?.email || '?')}</span>
                      }
                    </div>
                    <ChevronDown size={14} className={`text-ink-500 transition-transform ${avatarOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {avatarOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{  opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 card shadow-warm-md py-1 z-50"
                      >
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-sandDark">
                          <p className="text-sm font-semibold text-ink-900 truncate">{user?.full_name}</p>
                          <p className="text-xs text-ink-500 truncate">{user?.email}</p>
                        </div>

                        {/* Menu items */}
                        {[
                          { to: '/dashboard',         icon: LayoutDashboard, label: 'Dashboard' },
                          { to: '/dashboard/profile', icon: User,            label: 'Profile' },
                          { to: '/dashboard/saved',   icon: BookMarked,      label: 'Saved Properties' },
                        ].map(({ to, icon: Icon, label }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setAvatarOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700
                                       hover:bg-sand hover:text-terra transition-all"
                          >
                            <Icon size={15} />
                            {label}
                          </Link>
                        ))}

                        <div className="border-t border-sandDark mt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error
                                       hover:bg-red-50 transition-all"
                          >
                            <LogOut size={15} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-ink-700 px-3 py-2 rounded-lg
                             hover:bg-sand hover:text-ink-900 transition-all hidden sm:block"
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn-terra text-sm">
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-ink-500 hover:bg-sand transition-all"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* ── Mobile search bar ── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{  height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-sandDark"
            >
              <form onSubmit={handleSearch} className="px-4 py-3">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search properties…"
                    autoFocus
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-sand border border-sandDark
                               text-sm font-body focus:outline-none focus:ring-2 focus:ring-terra/30
                               focus:border-terra"
                  />
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Mobile menu drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-ink-900/40 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white shadow-warm-xl z-50 md:hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-sandDark">
                <span className="font-display font-semibold text-ink-900">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-sand">
                  <X size={18} className="text-ink-500" />
                </button>
              </div>

              <nav className="px-3 py-4 flex flex-col gap-1">
                {[
                  { to: '/',           label: 'Home',        icon: Home },
                  { to: '/properties', label: 'Properties',  icon: Building2 },
                  { to: '/reels',      label: 'Reels',        icon: Clapperboard },
                  ...(isAuthenticated ? [
                    { to: '/feed',      label: 'Feed',         icon: Home },
                    { to: '/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
                  ] : []),
                ].map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                      ${location.pathname === to ? 'bg-terra-50 text-terra' : 'text-ink-700 hover:bg-sand'}
                    `}
                  >
                    <Icon size={17} />
                    {label}
                  </Link>
                ))}
              </nav>

              {!isAuthenticated && (
                <div className="px-4 pt-4 border-t border-sandDark flex flex-col gap-3">
                  <Link to="/login"    className="btn-outline w-full justify-center">Sign In</Link>
                  <Link to="/register" className="btn-terra  w-full justify-center">Get Started</Link>
                </div>
              )}

              {isAuthenticated && (
                <div className="px-4 pt-4 border-t border-sandDark">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3
                               rounded-xl text-sm font-semibold text-error bg-red-50
                               hover:bg-red-100 transition-all"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}