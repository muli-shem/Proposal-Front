// ============================================================
// ESTATE HUB — HOME PAGE
// src/pages/Home/HomePage.tsx
// ============================================================

import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Search, MapPin, TrendingUp, Shield, Play, ArrowRight, ChevronRight, Star, Building2, Home, Layers } from 'lucide-react'
import PropertyFeedSection from './components/PropertyFeedSection'
import StatsBar from './components/StatsBar'
import AgencySpotlight from './components/AgencySpotlight'
import ReelPreviewStrip from './components/ReelPreviewStrip'

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY     = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <div className="home">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="hero" ref={heroRef}>
        {/* Parallax background */}
        <motion.div className="hero__bg" style={{ y: heroY }}>
          <div className="hero__bg-image" />
          <div className="hero__bg-overlay" />
          <div className="hero__bg-grain" />
        </motion.div>

        {/* Floating accent orbs */}
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />

        <motion.div className="hero__content" style={{ opacity: heroOpacity }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hero__badge"
          >
            <span className="hero__badge-dot" />
            Africa's Premier Property Marketplace
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="hero__title"
          >
            Find Your
            <span className="hero__title-accent"> Dream</span>
            <br />Property in Kenya
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="hero__subtitle"
          >
            Verified listings, trusted agencies, and a secure escrow system —
            all in one beautifully designed platform.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="hero__search"
          >
            <div className="search-bar">
              <div className="search-bar__tabs">
                {['Buy', 'Rent', 'Short Stay'].map((t, i) => (
                  <button key={t} className={`search-bar__tab ${i === 0 ? 'search-bar__tab--active' : ''}`}>{t}</button>
                ))}
              </div>
              <div className="search-bar__fields">
                <div className="search-bar__field">
                  <MapPin size={16} className="search-bar__icon" />
                  <input type="text" placeholder="City or neighborhood…" className="search-bar__input" />
                </div>
                <div className="search-bar__divider" />
                <div className="search-bar__field">
                  <Home size={16} className="search-bar__icon" />
                  <select className="search-bar__input search-bar__select">
                    <option value="">Property type</option>
                    <option>Apartment</option>
                    <option>House</option>
                    <option>Villa</option>
                    <option>Land</option>
                    <option>Commercial</option>
                  </select>
                </div>
                <div className="search-bar__divider" />
                <div className="search-bar__field">
                  <Layers size={16} className="search-bar__icon" />
                  <select className="search-bar__input search-bar__select">
                    <option value="">Budget range</option>
                    <option>Under KES 5M</option>
                    <option>KES 5M – 15M</option>
                    <option>KES 15M – 50M</option>
                    <option>Above KES 50M</option>
                  </select>
                </div>
                <Link to="/properties" className="search-bar__btn">
                  <Search size={18} />
                  <span>Search</span>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="hero__quick-stats"
          >
            {[
              { n: '12,400+', l: 'Active Listings' },
              { n: '840+',    l: 'Verified Agencies' },
              { n: 'KES 2B+', l: 'Transactions Secured' },
            ].map(s => (
              <div key={s.l} className="hero__stat">
                <span className="hero__stat-num">{s.n}</span>
                <span className="hero__stat-label">{s.l}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="hero__scroll"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="hero__scroll-line" />
        </motion.div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────── */}
      <StatsBar />

      {/* ── PROPERTY FEED ────────────────────────────────────── */}
      <PropertyFeedSection />

      {/* ── REELS STRIP ──────────────────────────────────────── */}
      <ReelPreviewStrip />

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="hiw">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Simple. Secure. Smart.</p>
            <h2 className="section-title">How Estate Hub Works</h2>
          </div>
          <div className="hiw__steps">
            {[
              {
                step: '01',
                icon: <Search size={24} />,
                title: 'Discover',
                desc: 'Browse thousands of verified listings using powerful filters — by price, location, type, and more.',
              },
              {
                step: '02',
                icon: <Shield size={24} />,
                title: 'Verify',
                desc: 'Every agency is vetted and every property can be independently verified before you commit.',
              },
              {
                step: '03',
                icon: <Building2 size={24} />,
                title: 'Book a Viewing',
                desc: 'Schedule a site visit directly through the platform. Agencies confirm in real-time.',
              },
              {
                step: '04',
                icon: <TrendingUp size={24} />,
                title: 'Transact Safely',
                desc: 'Our built-in escrow holds your deposit until all documents are verified and approved.',
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                className="hiw__step"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
              >
                <div className="hiw__step-num">{s.step}</div>
                <div className="hiw__step-icon">{s.icon}</div>
                <h3 className="hiw__step-title">{s.title}</h3>
                <p className="hiw__step-desc">{s.desc}</p>
                {i < 3 && <div className="hiw__step-connector" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AGENCY SPOTLIGHT ─────────────────────────────────── */}
      <AgencySpotlight />

      {/* ── TRUST SECTION ────────────────────────────────────── */}
      <section className="trust">
        <div className="container">
          <div className="trust__grid">
            <motion.div
              className="trust__copy"
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="section-label">Built on trust</p>
              <h2 className="section-title section-title--left">
                Your money is safe<br />with our escrow system
              </h2>
              <p className="trust__body">
                Every property transaction on Estate Hub is protected by a
                multi-step escrow process. Funds are only released after
                documents are verified, the property is inspected, and you
                confirm you're satisfied.
              </p>
              <div className="trust__points">
                {[
                  'Funds held until all conditions are met',
                  'Legal document verification by certified reviewers',
                  'Dispute resolution team available 24/7',
                  'Full refund if anything falls through',
                ].map(p => (
                  <div key={p} className="trust__point">
                    <Shield size={14} className="trust__point-icon" />
                    {p}
                  </div>
                ))}
              </div>
              <Link to="/register" className="btn-gold">
                Start Buying Safely <ArrowRight size={16} />
              </Link>
            </motion.div>

            <motion.div
              className="trust__visual"
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="escrow-card">
                <div className="escrow-card__header">
                  <span className="escrow-card__label">Escrow Status</span>
                  <span className="escrow-card__badge">Active</span>
                </div>
                <div className="escrow-card__amount">KES 8,500,000</div>
                <div className="escrow-card__prop">Westlands, 3BR Apartment</div>
                <div className="escrow-card__steps">
                  {[
                    { label: 'Funds Deposited',     done: true },
                    { label: 'Documents Verified',  done: true },
                    { label: 'Buyer Confirmed',      done: true },
                    { label: 'Funds Released',       done: false },
                  ].map((step, i) => (
                    <div key={step.label} className={`escrow-step ${step.done ? 'escrow-step--done' : ''}`}>
                      <div className="escrow-step__dot">{step.done ? '✓' : i + 1}</div>
                      <span className="escrow-step__label">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Real stories</p>
            <h2 className="section-title">Trusted by thousands</h2>
          </div>
          <div className="testimonials__grid">
            {[
              {
                quote: "Found my dream apartment in Karen in under a week. The escrow process gave me total peace of mind.",
                name: "Sarah Wanjiku",
                role: "Homeowner, Nairobi",
                rating: 5,
              },
              {
                quote: "As an agency, our listing views tripled after joining Estate Hub. The dashboard analytics are exceptional.",
                name: "James Omondi",
                role: "Director, Omondi Properties",
                rating: 5,
              },
              {
                quote: "The reels feature is a game-changer. We now close deals with buyers who've toured the property virtually first.",
                name: "Amina Hassan",
                role: "Senior Agent, Prime Realty",
                rating: 5,
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                className="testimonial-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="testimonial-card__stars">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={13} fill="currentColor" />
                  ))}
                </div>
                <p className="testimonial-card__quote">"{t.quote}"</p>
                <div className="testimonial-card__author">
                  <div className="testimonial-card__avatar">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="testimonial-card__name">{t.name}</p>
                    <p className="testimonial-card__role">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="cta">
        <div className="container">
          <motion.div
            className="cta__card"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="cta__glow" />
            <p className="section-label">Ready to begin?</p>
            <h2 className="cta__title">Your next property is<br />one click away</h2>
            <p className="cta__subtitle">
              Join over 50,000 buyers and 840 agencies already on Estate Hub.
            </p>
            <div className="cta__buttons">
              <Link to="/register" className="btn-gold btn-gold--lg">
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link to="/properties" className="btn-ghost btn-ghost--lg">
                Browse Listings
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}