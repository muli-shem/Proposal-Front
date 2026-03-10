// ESTATE HUB - AGENCY SPOTLIGHT
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CheckCircle2, MapPin, Star, ArrowRight } from 'lucide-react'
import api from '@/services/api'
import { getInitials } from '@/utils/format'

export default function AgencySpotlight() {
  const { data, isLoading } = useQuery({
    queryKey: ['agencies', 'featured'],
    queryFn: async () => {
      const { data } = await api.get('/agencies/?is_featured=true&page_size=4')
      return data
    },
    staleTime: 10 * 60 * 1000,
  })
  const agencies = (data as any)?.results ?? []

  return (
    <section className="py-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-2">
            Trusted Partners
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Featured Agencies</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array(4).fill(null).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-stone-200 p-5 animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-stone-200 mb-4" />
                  <div className="h-4 bg-stone-200 rounded w-24 mb-2" />
                  <div className="h-8 bg-stone-200 rounded w-full mt-4" />
                </div>
              ))
            : agencies.map((agency: any, i: number) => (
                <motion.div
                  key={agency.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {agency.logo_url
                        ? <img src={agency.logo_url} alt={agency.name} className="w-full h-full object-cover" />
                        : <span className="text-base font-bold text-purple-700">{getInitials(agency.name)}</span>
                      }
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="text-sm font-bold text-gray-900 truncate">{agency.name}</h3>
                        {agency.is_verified && (
                          <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                        )}
                      </div>
                      {agency.city && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin size={10} />{agency.city}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span className="font-semibold">{agency.listing_count ?? 0} listings</span>
                    <span className="flex items-center gap-1">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      {agency.average_rating?.toFixed(1) ?? '4.8'}
                    </span>
                  </div>

                  <Link
                    to={'/agencies/' + agency.id}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg
                               text-xs font-semibold text-purple-700 border border-purple-200
                               hover:bg-purple-50 transition-all"
                  >
                    View Profile <ArrowRight size={12} />
                  </Link>
                </motion.div>
              ))
          }
        </div>
      </div>
    </section>
  )
}