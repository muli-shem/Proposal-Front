// ESTATE HUB - REEL PREVIEW STRIP
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Play, ArrowRight, Clapperboard } from 'lucide-react'
import api from '@/services/api'

export default function ReelPreviewStrip() {
  const { data, isLoading } = useQuery({
    queryKey: ['reels', 'preview'],
    queryFn: async () => {
      const { data } = await api.get('/reels/?page_size=6')
      return (data as any).results ?? []
    },
    staleTime: 5 * 60 * 1000,
  })
  const reels: any[] = data ?? []

  return (
    <section className="py-20 bg-swahili overflow-hidden">
      <div className="page-container">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gold mb-2">Video Tours</p>
            <h2 className="font-display text-3xl md:text-4xl text-white leading-tight">Property Reels</h2>
            <p className="text-white/60 text-sm mt-2">Short video tours from verified agencies.</p>
          </div>
          <Link to="/reels"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-white transition-colors">
            See all <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {isLoading
            ? Array(6).fill(null).map((_,i) => (
                <div key={i} className="reel-card bg-white/10 animate-pulse" />
              ))
            : reels.map((reel, i) => (
                <motion.div key={reel.id || i} whileHover={{scale:1.03}} transition={{duration:0.2}}
                  className="reel-card group cursor-pointer">
                  <Link to="/reels" className="block w-full h-full relative">
                    {reel.thumbnail_url && (
                      <img src={reel.thumbnail_url} alt={reel.title}
                        className="w-full h-full object-cover" loading="lazy" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                        <Play size={16} className="text-white ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">{reel.title}</p>
                      {reel.agency && (
                        <p className="text-white/60 text-xs mt-0.5 truncate">{reel.agency.name}</p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))
          }
        </div>

        {!isLoading && reels.length === 0 && (
          <div className="text-center py-16">
            <Clapperboard size={48} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-sm">No reels yet. Check back soon.</p>
          </div>
        )}
      </div>
    </section>
  )
}