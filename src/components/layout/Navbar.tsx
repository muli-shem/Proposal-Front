// ============================================================
// ESTATE HUB — NAVBAR (Tailwind-only)
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

  const [searchOpen,  setSearchOpen]  = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [avatarOpen,  setAvatarOpen]  = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [scrolled,    setScrolled]    = useState(false)

  const avatarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node))
        setAvatarOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
    { to: '/properties', label: 'Properties', icon: Building2 },
    { to: '/reels',      label: 'Reels',       icon: Clapperboard },
  ]

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-200 transition-shadow duration-200 ${
          scrolled ? 'shadow-md' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-purple-700 flex items-center justify-center shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                <path
                  d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-lg group-hover:text-purple-700 transition-colors hidden sm:block">
              Estate Hub
            </span>
          </Link>

          {/* ── Search bar (desktop) ── */}
          <div className="flex-1 max-w-md hidden md:block">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search properties, cities, agencies…"
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-stone-50 border border-stone-200
                             text-sm text-gray-900 placeholder:text-gray-400
                             focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500
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
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  location.pathname === to || location.pathname.startsWith(to + '/')
                    ? 'text-purple-700 bg-purple-50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-stone-100'
                }`}
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
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-stone-100 hover:text-gray-900 transition-all"
            >
              <Search size={18} />
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button className="relative p-2 rounded-lg text-gray-500 hover:bg-stone-100 hover:text-gray-900 transition-all">
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-600" />
                </button>

                {/* Feed link */}
                <Link
                  to="/feed"
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    location.pathname === '/feed'
                      ? 'text-purple-700 bg-purple-50'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-stone-100'
                  }`}
                >
                  <Home size={15} />
                  Feed
                </Link>

                {/* Avatar dropdown */}
                <div ref={avatarRef} className="relative">
                  <button
                    onClick={() => setAvatarOpen(!avatarOpen)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-stone-100 transition-all duration-150"
                  >
                    <div className="w-7 h-7 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
                      {user?.avatar_url
                        ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                        : <span>{getInitials(user?.full_name || user?.email || '?')}</span>
                      }
                    </div>
                    <ChevronDown
                      size={14}
                      className={`text-gray-500 transition-transform ${avatarOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {avatarOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-stone-200 shadow-lg py-1 z-50"
                      >
                        <div className="px-4 py-3 border-b border-stone-100">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>

                        {[
                          { to: '/dashboard',         icon: LayoutDashboard, label: 'Dashboard' },
                          { to: '/dashboard/profile', icon: User,            label: 'Profile' },
                          { to: '/dashboard/saved',   icon: BookMarked,      label: 'Saved Properties' },
                        ].map(({ to, icon: Icon, label }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setAvatarOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                                       hover:bg-stone-50 hover:text-purple-700 transition-all"
                          >
                            <Icon size={15} />
                            {label}
                          </Link>
                        ))}

                        <div className="border-t border-stone-100 mt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600
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
                  className="text-sm font-semibold text-gray-700 px-3 py-2 rounded-lg
                             hover:bg-stone-100 hover:text-gray-900 transition-all hidden sm:block"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-purple-700 px-4 py-2 rounded-lg
                             hover:bg-purple-800 transition-all shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-stone-100 transition-all"
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
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-stone-200"
            >
              <form onSubmit={handleSearch} className="px-4 py-3">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search properties…"
                    autoFocus
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-stone-50 border border-stone-200
                               text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500"
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
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white shadow-2xl z-50 md:hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
                <span className="font-semibold text-gray-900">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-stone-100">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <nav className="px-3 py-4 flex flex-col gap-1">
                {[
                  { to: '/',           label: 'Home',       icon: Home },
                  { to: '/properties', label: 'Properties', icon: Building2 },
                  { to: '/reels',      label: 'Reels',      icon: Clapperboard },
                  ...(isAuthenticated ? [
                    { to: '/feed',      label: 'Feed',      icon: Home },
                    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  ] : []),
                ].map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      location.pathname === to
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-700 hover:bg-stone-100'
                    }`}
                  >
                    <Icon size={17} />
                    {label}
                  </Link>
                ))}
              </nav>

              {!isAuthenticated && (
                <div className="px-4 pt-4 border-t border-stone-200 flex flex-col gap-3">
                  <Link
                    to="/login"
                    className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold
                               border border-stone-300 text-gray-700 hover:bg-stone-50 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold
                               bg-purple-700 text-white hover:bg-purple-800 transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {isAuthenticated && (
                <div className="px-4 pt-4 border-t border-stone-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3
                               rounded-xl text-sm font-semibold text-red-600 bg-red-50
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