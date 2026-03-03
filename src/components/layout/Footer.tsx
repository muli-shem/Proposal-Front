// ============================================================
// ESTATE HUB — FOOTER
// src/components/layout/Footer.tsx
// ============================================================

import { Link } from 'react-router-dom'

const footerLinks = {
  Discover: [
    { label: 'Properties For Sale', to: '/properties?listing_type=sale' },
    { label: 'Properties For Rent',  to: '/properties?listing_type=rent' },
    { label: 'Short Stay',           to: '/properties?listing_type=short_stay' },
    { label: 'Featured Listings',    to: '/properties?is_featured=true' },
  ],
  Agencies: [
    { label: 'Browse Agencies',  to: '/agencies' },
    { label: 'Top Verified',     to: '/agencies?is_verified=true' },
    { label: 'Nairobi',          to: '/agencies?city=Nairobi' },
    { label: 'Mombasa',          to: '/agencies?city=Mombasa' },
  ],
  Company: [
    { label: 'About Us',     to: '/about' },
    { label: 'Blog',         to: '/blog' },
    { label: 'Careers',      to: '/careers' },
    { label: 'Contact',      to: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Use',   to: '/terms' },
    { label: 'Cookie Policy',  to: '/cookies' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-swahili text-white mt-16">
      <div className="page-container py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-terra flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
                    fill="currentColor"/>
                </svg>
              </div>
              <span className="font-display font-semibold text-white text-lg">Estate Hub</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Kenya's premier property marketplace. Discover, verify, and transact with confidence.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-gold mb-4">
                {section}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map(({ label, to }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row
                        items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} Estate Hub Limited. All rights reserved.
          </p>
          <p className="text-sm text-white/40">
            Built for Kenya 🇰🇪
          </p>
        </div>
      </div>
    </footer>
  )
}