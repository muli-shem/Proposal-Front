// ============================================================
// ESTATE HUB — SAVED PROPERTIES PAGE
// src/pages/Dashboard/sub/SavedPage.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, Building2, X } from 'lucide-react'
import PropertyCard, { PropertyCardSkeleton } from '@/components/property/PropertyCard'
import api from '@/services/api'
import type { Property } from '@/types'

const MOCK_SAVED: Property[] = Array.from({ length: 6 }, (_, i) => ({
  id: i + 50,
  title: ['Karen Villa 4BR','Westlands Penthouse','Kilimani 3BR','Lavington Townhouse','Upperhill Apt','Runda Mansion'][i],
  description: 'Premium property with modern finishes.',
  listing_type: (['sale','rent','rent','sale','rent','sale'] as const)[i],
  property_type: ['villa','penthouse','apartment','townhouse','apartment','mansion'][i],
  price: [68500000,250000,85000,32000000,95000,120000000][i],
  price_currency: 'KES',
  price_per: ([undefined,'month' as const,'month' as const,undefined,'month' as const,undefined])[i],
  is_negotiable: [true,false,false,true,false,true][i],
  bedrooms: [4,4,3,3,2,6][i], bathrooms: [4,4,2,3,2,7][i],
  size: [420,280,110,220,85,780][i], size_unit: 'm²',
  city: 'Nairobi', county: 'Nairobi',
  neighborhood: ['Karen','Westlands','Kilimani','Lavington','Upperhill','Runda'][i],
  is_verified: [true,true,true,false,true,true][i],
  is_featured: [true,true,false,false,false,true][i],
  status: 'published',
  cover_image_url: `https://picsum.photos/seed/sv${i+1}/800/500`,
  agency: { id: i+1, name: ['Knight Frank','Optiven','Hass Consult','Pam Golding','Benford','Suraya'][i], logo_url: undefined, is_verified: true, city: 'Nairobi' },
  like_count: [47,89,23,34,15,210][i], save_count: [21,44,11,16,7,89][i],
  comment_count: [8,15,4,7,2,34][i], view_count: [312,589,145,234,78,1240][i],
  is_liked: false, is_saved: true,
  created_at: new Date(Date.now() - i * 86400000 * 5).toISOString(),
  updated_at: new Date().toISOString(),
}))

const FILTER_TYPES = [
  { value: '',           label: 'All'        },
  { value: 'sale',       label: 'For Sale'   },
  { value: 'rent',       label: 'For Rent'   },
  { value: 'short_stay', label: 'Short Stay' },
]

export default function SavedPage() {
  const [saved,   setSaved]   = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get('/properties/saved/')
        setSaved(res.data.results ?? [])
      } catch {
        setSaved(MOCK_SAVED)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = filter ? saved.filter((p) => p.listing_type === filter) : saved

  return (
    <div className="py-4 px-0 sm:px-2 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Properties</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {saved.length} saved listing{saved.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/properties"
          className="flex items-center gap-2 px-4 py-2 bg-purple-700 text-white text-sm font-semibold rounded-xl hover:bg-purple-800 transition-colors shadow-sm">
          <Building2 size={14} /> Browse More
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl p-1 w-fit">
        {FILTER_TYPES.map((t) => (
          <button key={t.value} onClick={() => setFilter(t.value)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === t.value
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-gray-500 hover:bg-stone-100 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
        {filter && (
          <button onClick={() => setFilter('')}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} variant="card" />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
            <Bookmark size={28} className="text-purple-300" />
          </div>
          <p className="font-semibold text-gray-900 mb-1">
            {filter ? 'No saved properties in this category' : 'No saved properties yet'}
          </p>
          <p className="text-xs text-gray-500 max-w-xs mb-5">
            Browse properties and tap Save to add them here.
          </p>
          <Link to="/properties"
            className="px-5 py-2.5 bg-purple-700 text-white text-sm font-semibold rounded-xl hover:bg-purple-800 transition-colors">
            Browse Properties
          </Link>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <motion.div key={p.id} layout
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}>
                <PropertyCard property={p} variant="card" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}