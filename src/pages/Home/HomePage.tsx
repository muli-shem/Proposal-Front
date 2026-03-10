// ============================================================
// ESTATE HUB — HOME PAGE (Tailwind-only)
// src/pages/Home/HomePage.tsx
// ============================================================

import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Search, MapPin, TrendingUp, Shield, ArrowRight,
  Star, Building2, Home, Layers,
} from 'lucide-react'
import PropertyFeedSection from '@/components/PropertyFeedSection'
import AgencySpotlight from '@/components/AgencySpotlight'
import ReelPreviewStrip from '@/components/ReelPreviewStrip'

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY       = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Parallax background */}
        <motion.div className="absolute inset-0 z-0" style={{ y: heroY }}>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900" />
          {/* Accent orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />
          {/* Grain overlay */}
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }}
          />
        </motion.div>

        <motion.div
          className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center"
          style={{ opacity: heroOpacity }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                       bg-white/10 border border-white/20 text-white/80 text-sm font-medium
                       backdrop-blur-sm mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Africa's Premier Property Marketplace
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
          >
            Find Your
            <span className="text-amber-400"> Dream</span>
            <br />Property in Kenya
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10"
          >
            Verified listings, trusted agencies, and a secure escrow system —
            all in one beautifully designed platform.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-3xl mx-auto mb-10"
          >
            {/* Tabs */}
            <div className="flex border-b border-stone-100">
              {['Buy', 'Rent', 'Short Stay'].map((t, i) => (
                <button
                  key={t}
                  className={`flex-1 py-3 text-sm font-semibold transition-all ${
                    i === 0
                      ? 'text-purple-700 border-b-2 border-purple-700'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Fields */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-0">
              <div className="flex items-center gap-2 flex-1 px-4 py-3 border-b sm:border-b-0 sm:border-r border-stone-100">
                <MapPin size={16} className="text-purple-500 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="City or neighborhood…"
                  className="w-full text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 flex-1 px-4 py-3 border-b sm:border-b-0 sm:border-r border-stone-100">
                <Home size={16} className="text-purple-500 flex-shrink-0" />
                <select className="w-full text-sm text-gray-700 focus:outline-none bg-transparent cursor-pointer">
                  <option value="">Property type</option>
                  <option>Apartment</option>
                  <option>House</option>
                  <option>Villa</option>
                  <option>Land</option>
                  <option>Commercial</option>
                </select>
              </div>
              <div className="flex items-center gap-2 flex-1 px-4 py-3 border-b sm:border-b-0 sm:border-r border-stone-100">
                <Layers size={16} className="text-purple-500 flex-shrink-0" />
                <select className="w-full text-sm text-gray-700 focus:outline-none bg-transparent cursor-pointer">
                  <option value="">Budget range</option>
                  <option>Under KES 5M</option>
                  <option>KES 5M – 15M</option>
                  <option>KES 15M – 50M</option>
                  <option>Above KES 50M</option>
                </select>
              </div>
              <Link
                to="/properties"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-purple-700
                           text-white font-semibold text-sm hover:bg-purple-800 transition-all"
              >
                <Search size={18} />
                <span>Search</span>
              </Link>
            </div>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-8 sm:gap-12"
          >
            {[
              { n: '12,400+', l: 'Active Listings' },
              { n: '840+',    l: 'Verified Agencies' },
              { n: 'KES 2B+', l: 'Transactions Secured' },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">{s.n}</div>
                <div className="text-xs sm:text-sm text-white/60 mt-0.5">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </section>

      {/* ── PROPERTY FEED ────────────────────────────────────── */}
      <PropertyFeedSection />

      {/* ── REELS STRIP ──────────────────────────────────────── */}
      <ReelPreviewStrip />

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-purple-600 uppercase tracking-widest mb-2">
              Simple. Secure. Smart.
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">How Estate Hub Works</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {[
              {
                step: '01', icon: <Search size={24} />, title: 'Discover',
                desc: 'Browse thousands of verified listings using powerful filters — by price, location, type, and more.',
              },
              {
                step: '02', icon: <Shield size={24} />, title: 'Verify',
                desc: 'Every agency is vetted and every property can be independently verified before you commit.',
              },
              {
                step: '03', icon: <Building2 size={24} />, title: 'Book a Viewing',
                desc: 'Schedule a site visit directly through the platform. Agencies confirm in real-time.',
              },
              {
                step: '04', icon: <TrendingUp size={24} />, title: 'Transact Safely',
                desc: 'Our built-in escrow holds your deposit until all documents are verified and approved.',
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                className="relative bg-white rounded-2xl p-6 shadow-sm border border-stone-100"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
              >
                <div className="text-4xl font-bold text-stone-100 mb-4">{s.step}</div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                  {s.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AGENCY SPOTLIGHT ─────────────────────────────────── */}
      <AgencySpotlight />

      {/* ── TRUST SECTION ────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <motion.div
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-sm font-semibold text-purple-600 uppercase tracking-widest mb-2">
                Built on trust
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Your money is safe<br />with our escrow system
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                Every property transaction on Estate Hub is protected by a multi-step escrow process.
                Funds are only released after documents are verified, the property is inspected,
                and you confirm you're satisfied.
              </p>
              <div className="flex flex-col gap-3 mb-8">
                {[
                  'Funds held until all conditions are met',
                  'Legal document verification by certified reviewers',
                  'Dispute resolution team available 24/7',
                  'Full refund if anything falls through',
                ].map(p => (
                  <div key={p} className="flex items-center gap-3 text-sm text-gray-700">
                    <Shield size={14} className="text-purple-600 flex-shrink-0" />
                    {p}
                  </div>
                ))}
              </div>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                           bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-all shadow-sm"
              >
                Start Buying Safely <ArrowRight size={16} />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br from-slate-900 to-purple-950 rounded-2xl p-6 text-white shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Escrow Status</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    Active
                  </span>
                </div>
                <div className="text-3xl font-bold mb-1">KES 8,500,000</div>
                <div className="text-white/60 text-sm mb-6">Westlands, 3BR Apartment</div>

                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Funds Deposited',    done: true },
                    { label: 'Documents Verified', done: true },
                    { label: 'Buyer Confirmed',    done: true },
                    { label: 'Funds Released',     done: false },
                  ].map((step, i) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        step.done
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/10 text-white/40 border border-white/20'
                      }`}>
                        {step.done ? '✓' : i + 1}
                      </div>
                      <span className={`text-sm ${step.done ? 'text-white' : 'text-white/40'}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-purple-600 uppercase tracking-widest mb-2">
              Real stories
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Trusted by thousands</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "Found my dream apartment in Karen in under a week. The escrow process gave me total peace of mind.",
                name: "Sarah Wanjiku", role: "Homeowner, Nairobi", rating: 5,
              },
              {
                quote: "As an agency, our listing views tripled after joining Estate Hub. The dashboard analytics are exceptional.",
                name: "James Omondi", role: "Director, Omondi Properties", rating: 5,
              },
              {
                quote: "The reels feature is a game-changer. We now close deals with buyers who've toured the property virtually first.",
                name: "Amina Hassan", role: "Senior Agent, Prime Realty", rating: 5,
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={13} fill="#f59e0b" className="text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-700 flex items-center justify-center
                                  text-white text-sm font-bold flex-shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900
                       px-8 py-16 text-center"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-purple-500/30 blur-3xl rounded-full" />

            <div className="relative z-10">
              <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">
                Ready to begin?
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Your next property is<br />one click away
              </h2>
              <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
                Join over 50,000 buyers and 840 agencies already on Estate Hub.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl
                             bg-amber-500 text-white font-bold text-base hover:bg-amber-600
                             transition-all shadow-lg"
                >
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <Link
                  to="/properties"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl
                             border border-white/20 text-white font-semibold text-base
                             hover:bg-white/10 transition-all"
                >
                  Browse Listings
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}