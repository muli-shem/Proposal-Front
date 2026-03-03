// ============================================================
// ESTATE HUB — AUTH LAYOUT
// src/components/layout/AuthLayout.tsx
// ============================================================

import { Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-mesh-hero flex flex-col">

      {/* Decorative orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #C17D3C, transparent)' }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #1B3A5C, transparent)' }} />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #D4A853, transparent)' }} />
      </div>

      {/* Logo top-left */}
      <div className="relative z-10 px-8 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-terra flex items-center justify-center shadow-terra">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
                fill="currentColor"/>
            </svg>
          </div>
          <span className="font-display font-semibold text-ink-900 text-lg group-hover:text-terra transition-colors">
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
        <p className="text-xs text-ink-300">
          © {new Date().getFullYear()} Estate Hub. Kenya's Premier Property Marketplace.
        </p>
      </div>
    </div>
  )
}