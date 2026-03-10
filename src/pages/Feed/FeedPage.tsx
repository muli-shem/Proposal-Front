// ============================================================
// ESTATE HUB — FEED PAGE
// src/pages/Feed/FeedPage.tsx
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, TrendingUp, Users, RefreshCw,
  CheckCircle2, MapPin, Play, Heart,
  UserPlus, Loader2, ChevronRight, Flame,
} from 'lucide-react'
import PropertyCard, { PropertyCardSkeleton } from '@/components/property/PropertyCard'
import api from '@/services/api'
import { useAppSelector } from '@/store/hooks'
import { getInitials, formatCount } from '@/utils/format'
import type { Property, Reel, Agency } from '@/types'

// ── Mock data ─────────────────────────────────────────────────
const MOCK_AGENCIES: Agency[] = [
  { id: 1, name: 'Knight Frank Kenya',     is_verified: true,  city: 'Nairobi', follower_count: 4820, listing_count: 134, average_rating: 4.8, review_count: 92,  is_featured: true,  is_following: false },
  { id: 2, name: 'Optiven Real Estate',    is_verified: true,  city: 'Nairobi', follower_count: 6310, listing_count: 287, average_rating: 4.7, review_count: 148, is_featured: true,  is_following: false },
  { id: 3, name: 'Hass Consult',           is_verified: true,  city: 'Nairobi', follower_count: 3940, listing_count: 98,  average_rating: 4.6, review_count: 74,  is_featured: false, is_following: true  },
  { id: 4, name: 'Pam Golding Properties', is_verified: true,  city: 'Mombasa', follower_count: 2180, listing_count: 62,  average_rating: 4.9, review_count: 55,  is_featured: false, is_following: false },
  { id: 5, name: 'Benford Homes',          is_verified: false, city: 'Kisumu',  follower_count: 870,  listing_count: 31,  average_rating: 4.3, review_count: 22,  is_featured: false, is_following: false },
]

const MOCK_REELS: Reel[] = Array.from({ length: 4 }, (_, i) => ({
  id: i + 1,
  title: ['Karen Villa Tour 🏡', 'Westlands Office Space', 'Mombasa Beach House', 'Lavington Penthouse'][i],
  description: 'Stunning property walk-through',
  video_url: `https://example.com/reel${i + 1}.mp4`,
  thumbnail_url: `https://picsum.photos/seed/reel${i + 1}/400/700`,
  property: {
    id: i + 1,
    title: ['Karen Villa', 'Westlands Office', 'Beach House', 'Penthouse'][i],
    price: [68500000, 350000, 12000, 250000][i],
    city: ['Nairobi', 'Nairobi', 'Mombasa', 'Nairobi'][i],
    listing_type: (['sale', 'rent', 'short_stay', 'rent'] as const)[i],
  },
  agency: MOCK_AGENCIES[i % MOCK_AGENCIES.length],
  like_count:    [234, 89, 412, 156][i],
  comment_count: [12, 5, 28, 9][i],
  is_liked: false,
  is_saved: false,
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
}))

const MOCK_PROPERTIES: Property[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 10,
  title: [
    '3BR Apartment, Kilimani',    'Townhouse in Lavington',
    'Studio Loft, Westlands',     '5BR Mansion, Muthaiga',
    'Serviced Apt, Upper Hill',   '2BR, Kileleshwa',
    'Commercial Unit, Gigiri',    'Beach Plot, Diani',
  ][i],
  description: 'A premium property in a prime location with exceptional finishes.',
  listing_type: (['rent','sale','rent','sale','short_stay','rent','sale','sale'] as const)[i],
  property_type: ['apartment','townhouse','studio','mansion','apartment','apartment','commercial','land'][i],
  price: [85000, 32000000, 45000, 95000000, 12000, 55000, 280000, 8500000][i],
  price_currency: 'KES',
  price_per: ([('month' as const), undefined, ('month' as const), undefined, ('night' as const), ('month' as const), ('month' as const), undefined])[i],
  is_negotiable: [false,true,false,true,false,false,true,true][i],
  bedrooms:  [3,3,0,5,1,2,0,0][i],
  bathrooms: [2,3,1,6,1,2,1,0][i],
  size: [110,220,38,580,55,90,400,5000][i],
  size_unit: 'm²',
  city: ['Nairobi','Nairobi','Nairobi','Nairobi','Nairobi','Nairobi','Nairobi','Kwale'][i],
  county: 'Nairobi',
  neighborhood: ['Kilimani','Lavington','Westlands','Muthaiga','Upper Hill','Kileleshwa','Gigiri','Diani'][i],
  is_verified: [true,true,false,true,true,false,true,false][i],
  is_featured: [false,true,false,true,false,false,false,false][i],
  status: 'published',
  cover_image_url: `https://picsum.photos/seed/feed${i+1}/800/500`,
  agency: MOCK_AGENCIES[i % MOCK_AGENCIES.length],
  like_count:    Math.floor(Math.random() * 60) + 5,
  save_count:    Math.floor(Math.random() * 30),
  comment_count: Math.floor(Math.random() * 12),
  view_count:    Math.floor(Math.random() * 200) + 20,
  is_liked: false,
  is_saved: false,
  created_at:  new Date(Date.now() - i * 86400000 * 2).toISOString(),
  updated_at:  new Date().toISOString(),
}))

// ── Feed item types ───────────────────────────────────────────
type FeedItem =
  | { type: 'property';       data: Property }
  | { type: 'reel_strip';     data: Reel[]   }
  | { type: 'agency_suggest'; data: Agency[] }

function buildFeed(properties: Property[], reels: Reel[], agencies: Agency[]): FeedItem[] {
  const items: FeedItem[] = []
  properties.forEach((p, i) => {
    items.push({ type: 'property', data: p })
    if (i === 2 && reels.length > 0)    items.push({ type: 'reel_strip',     data: reels })
    if (i === 5 && agencies.length > 0) items.push({ type: 'agency_suggest', data: agencies.slice(0, 3) })
  })
  return items
}

// ── Reel strip card ───────────────────────────────────────────
function ReelStripCard({ reels }: { reels: Reel[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 rounded-2xl overflow-hidden shadow-md"
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <Flame size={14} className="text-amber-400" />
          </div>
          <span className="text-white font-bold text-sm">Trending Reels</span>
        </div>
        <Link to="/reels"
          className="text-amber-400 text-xs font-semibold hover:text-amber-300 transition-colors flex items-center gap-0.5">
          See all <ChevronRight size={13} />
        </Link>
      </div>

      <div className="flex gap-2.5 px-4 pb-4 overflow-x-auto">
        {reels.map((reel) => (
          <Link key={reel.id} to="/reels" className="flex-shrink-0 group">
            <div className="relative w-24 rounded-xl overflow-hidden" style={{ aspectRatio: '9/16' }}>
              {reel.thumbnail_url
                ? <img src={reel.thumbnail_url} alt={reel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                : <div className="w-full h-full bg-white/10" />
              }
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play size={14} className="text-white fill-white ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                <span className="flex items-center gap-1 text-white text-[10px] font-semibold">
                  <Heart size={9} className="fill-white" /> {formatCount(reel.like_count)}
                </span>
              </div>
            </div>
            <p className="text-white/80 text-[11px] mt-1.5 line-clamp-1 w-24">{reel.title}</p>
          </Link>
        ))}
      </div>
    </motion.div>
  )
}

// ── Agency suggestion card ────────────────────────────────────
function AgencySuggestCard({ agencies }: { agencies: Agency[] }) {
  const [followed, setFollowed] = useState<number[]>([])
  const navigate = useNavigate()
  const { isAuthenticated } = useAppSelector((s) => s.auth)

  const handleFollow = async (agencyId: number) => {
    if (!isAuthenticated) { navigate('/login'); return }
    setFollowed((prev) =>
      prev.includes(agencyId) ? prev.filter((id) => id !== agencyId) : [...prev, agencyId]
    )
    try { await api.post(`/agencies/${agencyId}/follow/`) } catch { /* optimistic */ }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
            <Users size={14} className="text-purple-700" />
          </div>
          <span className="font-bold text-gray-900 text-sm">Agencies to Follow</span>
        </div>
        <Link to="/properties"
          className="text-purple-700 text-xs font-semibold hover:text-purple-900 transition-colors flex items-center gap-0.5">
          See all <ChevronRight size={13} />
        </Link>
      </div>

      <div className="px-4 pb-4 space-y-3 mt-1">
        {agencies.map((agency) => {
          const isFollowing = followed.includes(agency.id) || agency.is_following
          return (
            <div key={agency.id} className="flex items-center gap-3">
              <Link to={`/agencies/${agency.id}`} className="flex items-center gap-3 flex-1 min-w-0 group">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {agency.logo_url
                    ? <img src={agency.logo_url} alt="" className="w-full h-full object-cover" />
                    : <span className="text-xs font-bold text-purple-700">{getInitials(agency.name)}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                      {agency.name}
                    </p>
                    {agency.is_verified && <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={9} /> {agency.city}
                    <span className="text-gray-300">·</span>
                    {formatCount(agency.follower_count)} followers
                  </p>
                </div>
              </Link>

              <button
                onClick={() => handleFollow(agency.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isFollowing
                    ? 'bg-stone-100 text-gray-500 hover:bg-stone-200'
                    : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-700 hover:text-white hover:border-purple-700'
                }`}
              >
                {!isFollowing && <UserPlus size={11} />}
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ── Feed filter tabs ──────────────────────────────────────────
const FEED_TABS = [
  { value: 'all',       label: 'For You',   icon: Sparkles   },
  { value: 'following', label: 'Following', icon: Users      },
  { value: 'trending',  label: 'Trending',  icon: TrendingUp },
]

// ── Main page ─────────────────────────────────────────────────
export default function FeedPage() {
  const { isAuthenticated } = useAppSelector((s) => s.auth)
  const [activeTab,   setActiveTab]   = useState('all')
  const [feedItems,   setFeedItems]   = useState<FeedItem[]>([])
  const [loading,     setLoading]     = useState(true)
  const [refreshing,  setRefreshing]  = useState(false)
  const [page,        setPage]        = useState(1)
  const [hasMore,     setHasMore]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)

  const loadFeed = useCallback(async (tab: string, pg: number, append = false) => {
    try {
      if (!append) setLoading(true)
      else setLoadingMore(true)

      let properties: Property[] = []
      let reels: Reel[]          = []
      let agencies: Agency[]     = []

      try {
        const params: Record<string, string | number> = { page: pg, page_size: 8 }
        if (tab === 'trending') params.ordering = '-like_count'
        const [propRes, reelRes, agencyRes] = await Promise.all([
          api.get('/properties/', { params }),
          pg === 1 ? api.get('/reels/',    { params: { page_size: 4 } }) : Promise.resolve(null),
          pg === 1 ? api.get('/agencies/', { params: { page_size: 5 } }) : Promise.resolve(null),
        ])
        properties = propRes.data.results
        reels      = reelRes?.data?.results   ?? []
        agencies   = agencyRes?.data?.results ?? []
        setHasMore(!!propRes.data.next)
      } catch {
        properties = MOCK_PROPERTIES.slice((pg - 1) * 8, pg * 8)
        reels      = pg === 1 ? MOCK_REELS    : []
        agencies   = pg === 1 ? MOCK_AGENCIES : []
        setHasMore(pg < 2)
      }

      const newItems = buildFeed(properties, reels, agencies)
      setFeedItems((prev) => append ? [...prev, ...newItems] : newItems)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    setPage(1)
    setFeedItems([])
    loadFeed(activeTab, 1)
  }, [activeTab, loadFeed])

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!loaderRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const next = page + 1
          setPage(next)
          loadFeed(activeTab, next, true)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading, page, activeTab, loadFeed])

  const handleRefresh = () => {
    setRefreshing(true)
    setPage(1)
    loadFeed(activeTab, 1)
  }

  return (
    <div className="py-4 px-0 sm:px-2">

      {/* ── Feed tabs ───────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center bg-white border border-stone-200 rounded-xl p-1 gap-0.5">
          {FEED_TABS.map(({ value, label, icon: Icon }) => (
            <button key={value} onClick={() => setActiveTab(value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === value
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-stone-100'
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        <button onClick={handleRefresh} disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-gray-500 hover:text-purple-700 hover:border-purple-300 transition-all disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Not logged in banner ────────────────────────── */}
      {!isAuthenticated && activeTab === 'following' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-between gap-3"
        >
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-0.5">Follow agencies you love</p>
            <p className="text-xs text-gray-500">Sign in to see posts from agencies you follow</p>
          </div>
          <Link to="/login"
            className="flex-shrink-0 px-4 py-2 bg-purple-700 text-white text-xs font-semibold rounded-xl hover:bg-purple-800 transition-colors">
            Sign in
          </Link>
        </motion.div>
      )}

      {/* ── Feed items ──────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <PropertyCardSkeleton key={i} variant="post" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {feedItems.map((item, i) => {
              if (item.type === 'property') {
                return (
                  <motion.div key={`prop-${item.data.id}`}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.3) }}
                  >
                    <PropertyCard property={item.data} variant="post" />
                  </motion.div>
                )
              }
              if (item.type === 'reel_strip') {
                return (
                  <motion.div key="reel-strip"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <ReelStripCard reels={item.data} />
                  </motion.div>
                )
              }
              if (item.type === 'agency_suggest') {
                return (
                  <motion.div key="agency-suggest"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <AgencySuggestCard agencies={item.data} />
                  </motion.div>
                )
              }
              return null
            })}
          </AnimatePresence>

          {/* Infinite scroll sentinel */}
          <div ref={loaderRef} className="flex justify-center py-4">
            {loadingMore && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 size={16} className="animate-spin text-purple-700" />
                Loading more…
              </div>
            )}
            {!hasMore && feedItems.length > 0 && (
              <div className="flex items-center gap-3 w-full max-w-xs">
                <div className="h-px flex-1 bg-stone-200" />
                <p className="text-xs text-gray-400 font-medium whitespace-nowrap">You're all caught up</p>
                <div className="h-px flex-1 bg-stone-200" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}