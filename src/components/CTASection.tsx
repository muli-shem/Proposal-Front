
// src/components/CTASection.tsx
// ============================================================
import { motion as m } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2 } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-900 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden shadow-2xl"
        >
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 -translate-y-1/2 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-purple-700 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Building2 size={28} className="text-white" />
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Ready to find your<br />
              <span className="text-amber-400 italic">next property?</span>
            </h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Join thousands of buyers, agents, and agencies already using Estate Hub.
              It's free to get started.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-500 text-white font-bold text-base hover:bg-amber-600 transition-all shadow-lg">
                Get Started Free <ArrowRight size={17} />
              </Link>
              <Link to="/properties"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/20 text-white font-semibold text-base hover:bg-white/10 transition-all">
                Browse Listings
              </Link>
            </div>

            <p className="text-white/40 text-xs mt-8">
              No credit card required. Free forever for buyers.
            </p>
          </div>
        </m.div>
      </div>
    </section>
  )
}

export default CTASection