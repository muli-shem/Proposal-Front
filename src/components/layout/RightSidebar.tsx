// ============================================================
// ESTATE HUB — RIGHT SIDEBAR
// src/components/layout/RightSidebar.tsx
// ============================================================

import { Link } from 'react-router-dom'
import { CheckCircle2, TrendingUp, MapPin } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { getInitials } from '@/utils/format'
import type { Agency } from '@/types'

export default function RightSidebar() {
  const { data: agencies } = useQuery({
    queryKey: ['agencies', 'featured', 'sidebar'],
    queryFn:  async () => {
      const { data } = await api.get('/agencies/?is_featured=true&page_size=4')
      return data.results as Agency[]
    },
    staleTime: 10 * 60 * 1000,
  })

  return (
    <div className="flex flex-col gap-4">

      {/* Suggested Agencies */}
      <div className="card p-4">
        <h3 className="text-sm font-bold text-ink-900 mb-3">Suggested Agencies</h3>
        <div className="flex flex-col gap-3">
          {(agencies ?? Array(3).fill(null)).map((agency: Agency | null, i) => (
            agency ? (
              <Link
                key={agency.id}
                to={`/agencies/${agency.id}`}
                className="flex items-center gap-3 group"
              >
                <div className="avatar-sm flex-shrink-0">
                  {agency.logo_url
                    ? <img src={agency.logo_url} alt={agency.name} className="w-full h-full object-cover" />
                    : <span className="text-xs">{getInitials(agency.name)}</span>
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-semibold text-ink-900 truncate
                                   group-hover:text-terra transition-colors">
                      {agency.name}
                    </p>
                    {agency.is_verified && <CheckCircle2 size={11} className="text-forest flex-shrink-0" />}
                  </div>
                  {agency.city && (
                    <p className="text-xs text-ink-500 flex items-center gap-0.5 mt-0.5">
                      <MapPin size={9} />
                      {agency.city}
                    </p>
                  )}
                </div>
                <button className="flex-shrink-0 text-xs font-semibold text-terra
                                   hover:text-terra-600 transition-colors">
                  Follow
                </button>
              </Link>
            ) : (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full skeleton" />
                <div className="flex-1 flex flex-col gap-1">
                  <div className="skeleton h-3 rounded w-3/4" />
                  <div className="skeleton h-2.5 rounded w-1/2" />
                </div>
              </div>
            )
          ))}
        </div>
        <Link
          to="/properties"
          className="mt-3 block text-xs font-semibold text-terra hover:text-terra-600 transition-colors"
        >
          See all agencies →
        </Link>
      </div>

      {/* Market Tip */}
      <div className="card-terra p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={15} className="text-terra" />
          <h3 className="text-sm font-bold text-terra">Market Insight</h3>
        </div>
        <p className="text-xs text-ink-700 leading-relaxed">
          Nairobi property prices rose <strong>8.2%</strong> in Q1 2025.
          Westlands and Karen remain top investment zones.
        </p>
        <Link
          to="/properties?city=Nairobi"
          className="mt-3 inline-block text-xs font-semibold text-terra hover:text-terra-600 transition-colors"
        >
          Browse Nairobi listings →
        </Link>
      </div>

      {/* Quick stats */}
      <div className="card p-4">
        <h3 className="text-sm font-bold text-ink-900 mb-3">Platform Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Listings',  value: '12.4K' },
            { label: 'Agencies',  value: '840+' },
            { label: 'Cities',    value: '47' },
            { label: 'Verified',  value: '98%' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-sand rounded-lg px-3 py-2.5">
              <p className="text-sm font-mono font-bold text-terra">{value}</p>
              <p className="text-xs text-ink-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer links */}
      <div className="px-1">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {['About', 'Terms', 'Privacy', 'Help', 'Advertise'].map((link) => (
            <a key={link} href="#" className="text-xs text-ink-300 hover:text-ink-500 transition-colors">
              {link}
            </a>
          ))}
        </div>
        <p className="text-xs text-ink-300 mt-2">
          © {new Date().getFullYear()} Estate Hub
        </p>
      </div>
    </div>
  )
}