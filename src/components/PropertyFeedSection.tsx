// ESTATE HUB - PROPERTY FEED SECTION
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import api from '@/services/api'
import PropertyCard, { PropertyCardSkeleton } from '@/components/property/PropertyCard'
import type { Property, PaginatedResponse } from '@/types'

const FILTERS = [
  { label: 'All',        value: ''           },
  { label: 'For Sale',   value: 'sale'       },
  { label: 'For Rent',   value: 'rent'       },
  { label: 'Short Stay', value: 'short_stay' },
  { label: 'Featured',   value: 'featured'   },
]

export default function PropertyFeedSection() {
  const [activeFilter, setActiveFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['properties', 'home', activeFilter],
    queryFn: async () => {
      const params: Record<string, string> = { page_size: '8' }
      if (activeFilter === 'featured') params.is_featured = 'true'
      else if (activeFilter) params.listing_type = activeFilter
      const { data } = await api.get('/properties/', { params })
      return data as PaginatedResponse<Property>
    },
    staleTime: 5 * 60 * 1000,
  })

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-2">
              Live Listings
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Latest Properties</h2>
          </div>
          <Link to="/properties"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-gray-700 hover:border-purple-500 hover:text-purple-700 transition-all">
            View all <ArrowRight size={15} />
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          {FILTERS.map(({ label, value }) => (
            <button key={value} onClick={() => setActiveFilter(value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeFilter === value
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'bg-stone-100 text-gray-600 hover:bg-stone-200 hover:text-gray-900'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array(8).fill(null).map((_, i) => <PropertyCardSkeleton key={i} variant="card" />)
            : (data?.results ?? []).map((property, i) => (
                <motion.div key={property.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}>
                  <PropertyCard property={property} variant="card" />
                </motion.div>
              ))
          }
        </div>

        <div className="text-center mt-10">
          <Link to="/properties"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-purple-700 text-white font-bold text-base hover:bg-purple-800 transition-all shadow-md">
            Browse All Properties <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  )
}