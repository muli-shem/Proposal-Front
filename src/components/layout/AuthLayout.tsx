// ============================================================
// ESTATE HUB — AUTH LAYOUT
// src/components/layout/AuthLayout.tsx
// ============================================================

import { Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-purple-50 flex flex-col">

      {/* Decorative orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #1e3a5f, transparent)' }} />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
      </div>

      {/* Logo top-left */}
      <div className="relative z-10 px-8 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-purple-700 flex items-center justify-center shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
                fill="currentColor"/>
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-lg group-hover:text-purple-700 transition-colors">
            Estate Hub
          </span>
        </Link>
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center pb-6 px-4">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Estate Hub. Kenya's Premier Property Marketplace.
        </p>
      </div>
    </div>
  )
}