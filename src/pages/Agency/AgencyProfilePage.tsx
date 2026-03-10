// ============================================================
// ESTATE HUB — AGENCY PROFILE PAGE
// src/pages/Agency/AgencyProfilePage.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, MapPin, Phone, Globe, Mail, Star,
  UserPlus, Users, Building2, Play, Heart, MessageSquare,
  ArrowLeft, Loader2, Send, ChevronRight, Award,
  Bookmark, ExternalLink, TrendingUp, Calendar,
} from 'lucide-react'
import PropertyCard, { PropertyCardSkeleton } from '@/components/property/PropertyCard'
import api from '@/services/api'
import { useAppSelector } from '@/store/hooks'
import {
  getInitials, formatCount, formatCurrency,
  formatDate, timeAgo,
} from '@/utils/format'
import type { Agency, AgentBasic, Property, Reel } from '@/types'
import toast from 'react-hot-toast'

// ── Mock data ─────────────────────────────────────────────────
const MOCK_AGENCY: Agency = {
  id: 1,
  name: 'Knight Frank Kenya',
  description: `Knight Frank Kenya is one of East Africa's leading property consultancies, offering a comprehensive range of residential and commercial property services.

Founded in 1896, Knight Frank has grown to become a truly global real estate brand with over 500 offices worldwide. Our Nairobi office has been at the forefront of Kenya's property market for over two decades, specialising in sales, lettings, valuations, property management, and investment advisory.

We pride ourselves on our deep local knowledge, global reach, and unwavering commitment to delivering exceptional results for our clients — whether they're buying their first home or managing a commercial portfolio.`,
  phone: '+254 20 423 1000',
  email: 'kenya@knightfrank.com',
  website: 'https://www.knightfrank.co.ke',
  address: 'The Oval, Ring Road Parklands, Nairobi',
  city: 'Nairobi',
  county: 'Nairobi County',
  logo_url: undefined,
  cover_image_url: 'https://picsum.photos/seed/agencyhero/1400/400',
  is_verified: true,
  is_featured: true,
  follower_count: 4820,
  listing_count: 134,
  average_rating: 4.8,
  review_count: 92,
  is_following: false,
}

const MOCK_AGENTS: AgentBasic[] = [
  { id: 1, user: { id: 10, full_name: 'James Mwangi',   avatar_url: undefined }, title: 'Senior Sales Agent',          is_active: true },
  { id: 2, user: { id: 11, full_name: 'Aisha Omondi',   avatar_url: undefined }, title: 'Residential Leasing Manager', is_active: true },
  { id: 3, user: { id: 12, full_name: 'Brian Kipchoge', avatar_url: undefined }, title: 'Commercial Property Agent',   is_active: true },
  { id: 4, user: { id: 13, full_name: 'Grace Wanjiku',  avatar_url: undefined }, title: 'Property Consultant',         is_active: true },
  { id: 5, user: { id: 14, full_name: 'Samuel Ochieng', avatar_url: undefined }, title: 'Investment Advisor',          is_active: false },
]

const MOCK_REVIEWS = [
  { id: 1, user: { full_name: 'David Kimani',  avatar_url: undefined }, rating: 5, comment: 'Exceptional service from start to finish. James helped us find our dream home in Karen within 3 weeks. Highly recommend Knight Frank!', created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 2, user: { full_name: 'Sarah Njoroge', avatar_url: undefined }, rating: 5, comment: 'Professional, responsive, and knowledgeable. Aisha guided us through every step of the rental process. Outstanding communication.', created_at: new Date(Date.now() - 14 * 86400000).toISOString() },
  { id: 3, user: { full_name: 'Michael Otieno',avatar_url: undefined }, rating: 4, comment: 'Very good experience overall. The team is well-organised and their market knowledge is impressive. Would use them again.', created_at: new Date(Date.now() - 21 * 86400000).toISOString() },
  { id: 4, user: { full_name: 'Priya Sharma',  avatar_url: undefined }, rating: 5, comment: 'Bought a commercial property through Knight Frank. The entire process was smooth and transparent. Great team!', created_at: new Date(Date.now() - 30 * 86400000).toISOString() },
]

const MOCK_PROPERTIES: Property[] = Array.from({ length: 6 }, (_, i) => ({
  id: i + 20,
  title: ['4BR Villa, Karen', 'Penthouse Suite, Upperhill', '3BR Apt, Kilimani', 'Townhouse, Lavington', 'Commercial Space, Westlands', '2BR, Kileleshwa'][i],
  description: 'Premium property with exceptional finishes in a prime Nairobi location.',
  listing_type: (['sale','rent','rent','sale','rent','rent'] as const)[i],
  property_type: ['villa','penthouse','apartment','townhouse','commercial','apartment'][i],
  price: [68500000, 250000, 85000, 32000000, 180000, 55000][i],
  price_currency: 'KES',
  price_per: ([undefined, 'month' as const, 'month' as const, undefined, 'month' as const, 'month' as const])[i],
  is_negotiable: [true,false,false,true,false,false][i],
  bedrooms: [4,4,3,3,0,2][i],
  bathrooms: [4,4,2,3,2,2][i],
  size: [420,280,110,220,450,90][i],
  size_unit: 'm²',
  city: 'Nairobi',
  county: 'Nairobi',
  neighborhood: ['Karen','Upperhill','Kilimani','Lavington','Westlands','Kileleshwa'][i],
  is_verified: [true,true,true,false,true,false][i],
  is_featured: [true,true,false,false,false,false][i],
  status: 'published',
  cover_image_url: `https://picsum.photos/seed/agency-prop${i+1}/800/500`,
  agency: { id: 1, name: 'Knight Frank Kenya', logo_url: undefined, is_verified: true, city: 'Nairobi' },
  like_count: [47,89,23,34,12,18][i],
  save_count: [21,44,11,16,5,8][i],
  comment_count: [8,15,4,7,2,3][i],
  view_count: [312,589,145,234,87,123][i],
  is_liked: false,
  is_saved: false,
  created_at: new Date(Date.now() - i * 86400000 * 5).toISOString(),
  updated_at: new Date().toISOString(),
}))

const MOCK_REELS: Reel[] = Array.from({ length: 4 }, (_, i) => ({
  id: i + 10,
  title: ['Karen Villa Walkthrough', 'Upperhill Penthouse Tour', 'Kilimani Apartment', 'Lavington Townhouse'][i],
  video_url: '',
  thumbnail_url: `https://picsum.photos/seed/agency-reel${i+1}/400/700`,
  property: { id: i + 20, title: MOCK_PROPERTIES[i].title, price: MOCK_PROPERTIES[i].price, city: 'Nairobi', listing_type: MOCK_PROPERTIES[i].listing_type },
  agency: { id: 1, name: 'Knight Frank Kenya', logo_url: undefined, is_verified: true, city: 'Nairobi' },
  like_count: [234, 892, 456, 189][i],
  comment_count: [12, 34, 18, 9][i],
  is_liked: false,
  is_saved: false,
  created_at: new Date(Date.now() - i * 86400000 * 3).toISOString(),
}))

// ── Star rating display ───────────────────────────────────────
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size}
          className={s <= Math.round(rating) ? 'text-gold fill-gold' : 'text-ink-200'}
        />
      ))}
    </div>
  )
}

// ── Tab types ─────────────────────────────────────────────────
type Tab = 'properties' | 'reels' | 'reviews' | 'team'

const TABS: { value: Tab; label: string; icon: React.ElementType }[] = [
  { value: 'properties', label: 'Properties', icon: Building2 },
  { value: 'reels',      label: 'Reels',      icon: Play      },
  { value: 'reviews',    label: 'Reviews',    icon: Star      },
  { value: 'team',       label: 'Team',       icon: Users     },
]

// ── Main page ─────────────────────────────────────────────────
export default function AgencyProfilePage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAppSelector((s) => s.auth)

  const [agency, setAgency]       = useState<Agency | null>(null)
  const [agents, setAgents]       = useState<AgentBasic[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [reels, setReels]         = useState<Reel[]>([])
  const [reviews, setReviews]     = useState(MOCK_REVIEWS)
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('properties')
  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' })
  const [submitingReview, setSubmitingReview] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [agencyRes, agentsRes, propsRes] = await Promise.all([
          api.get<Agency>(`/agencies/${id}/`),
          api.get<{ results: AgentBasic[] }>(`/agencies/${id}/agents/`),
          api.get<{ results: Property[] }>(`/properties/?agency=${id}&page_size=6`),
        ])
        setAgency(agencyRes.data)
        setFollowing(agencyRes.data.is_following ?? false)
        setAgents(agentsRes.data.results)
        setProperties(propsRes.data.results)

        try {
          const reelsRes = await api.get<{ results: Reel[] }>(`/reels/?agency=${id}&page_size=8`)
          setReels(reelsRes.data.results)
        } catch {
          setReels(MOCK_REELS)
        }
      } catch {
        setAgency(MOCK_AGENCY)
        setFollowing(MOCK_AGENCY.is_following ?? false)
        setAgents(MOCK_AGENTS)
        setProperties(MOCK_PROPERTIES)
        setReels(MOCK_REELS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleFollow = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    setFollowLoading(true)
    setFollowing((v) => !v)
    try {
      await api.post(`/agencies/${id}/follow/`)
    } catch {
      setFollowing((v) => !v) // revert
    } finally {
      setFollowLoading(false)
    }
  }

  const handleReviewSubmit = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (reviewForm.rating === 0) { toast.error('Please select a rating'); return }
    if (!reviewForm.comment.trim()) { toast.error('Please write a comment'); return }
    setSubmitingReview(true)
    try {
      await api.post(`/agencies/${id}/reviews/`, reviewForm)
    } catch { /* optimistic */ }
    const newReview = {
      id: Date.now(),
      user: { full_name: 'You', avatar_url: undefined },
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      created_at: new Date().toISOString(),
    }
    setReviews((prev) => [newReview, ...prev])
    setReviewForm({ rating: 0, comment: '' })
    setShowReviewForm(false)
    toast.success('Review submitted!')
    setSubmitingReview(false)
  }

  // ── Loading skeleton ────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-canvas">
        <div className="skeleton w-full h-48" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-12 relative z-10">
          <div className="flex items-end gap-4 mb-6">
            <div className="skeleton w-24 h-24 rounded-2xl border-4 border-white flex-shrink-0" />
            <div className="flex-1 pb-2 space-y-2">
              <div className="skeleton h-6 rounded w-48" />
              <div className="skeleton h-4 rounded w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <PropertyCardSkeleton key={i} variant="card" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!agency) return null

  const descParagraphs = (agency.description ?? '').split('\n\n')
  const descPreview    = descParagraphs.slice(0, 1).join('\n\n')
  const hasMoreDesc    = descParagraphs.length > 1

  return (
    <div className="min-h-screen bg-canvas pb-16">

      {/* ── Cover image ──────────────────────────────────── */}
      <div className="relative w-full overflow-hidden bg-swahili-dark" style={{ height: 220 }}>
        {agency.cover_image_url
          ? <img src={agency.cover_image_url} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-swahili to-swahili-dark" />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center gap-1.5 text-white/90 text-sm font-semibold
                     bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-xl hover:bg-black/50 transition-colors">
          <ArrowLeft size={15} /> Back
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* ── Profile header ─────────────────────────────── */}
        <div className="relative -mt-14 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">

            {/* Logo */}
            <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-warm-md
                            flex items-center justify-center flex-shrink-0 overflow-hidden">
              {agency.logo_url
                ? <img src={agency.logo_url} alt={agency.name} className="w-full h-full object-cover" />
                : <span className="text-2xl font-bold text-terra font-display">
                    {getInitials(agency.name)}
                  </span>
              }
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0 sm:pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-display text-2xl font-bold text-ink-900">{agency.name}</h1>
                {agency.is_verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-forest/10 text-forest text-xs font-semibold rounded-full">
                    <CheckCircle2 size={11} /> Verified
                  </span>
                )}
                {agency.is_featured && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold/10 text-gold-dark text-xs font-semibold rounded-full">
                    <Award size={11} /> Featured
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
                {agency.city && (
                  <span className="flex items-center gap-1"><MapPin size={11} />{agency.city}{agency.county ? `, ${agency.county}` : ''}</span>
                )}
                {agency.address && (
                  <span className="flex items-center gap-1 truncate max-w-xs"><Building2 size={11} />{agency.address}</span>
                )}
              </div>
            </div>

            {/* Follow button */}
            <div className="flex items-center gap-2 sm:pb-1">
              <button onClick={handleFollow} disabled={followLoading}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 ${
                  following
                    ? 'bg-sand border border-sandDark text-ink-700 hover:bg-sandDark'
                    : 'bg-terra text-white shadow-terra hover:bg-terra-600'
                }`}
              >
                {followLoading
                  ? <Loader2 size={15} className="animate-spin" />
                  : following ? <Users size={15} /> : <UserPlus size={15} />
                }
                {following ? 'Following' : 'Follow'}
              </button>

              {agency.email && (
                <a href={`mailto:${agency.email}`}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-sandDark text-sm font-semibold text-ink-700 hover:border-terra/40 hover:text-terra transition-all">
                  <Mail size={14} /> Email
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats bar ──────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { icon: Building2,   label: 'Listings',  value: formatCount(agency.listing_count) },
            { icon: Users,       label: 'Followers', value: formatCount(agency.follower_count) },
            { icon: Star,        label: 'Rating',    value: agency.average_rating.toFixed(1)   },
            { icon: TrendingUp,  label: 'Reviews',   value: formatCount(agency.review_count)   },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-sandDark p-3 text-center">
              <Icon size={16} className="text-terra mx-auto mb-1" />
              <p className="font-bold text-ink-900 text-lg leading-none">{value}</p>
              <p className="text-xs text-ink-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Contact strip ───────────────────────────────── */}
        <div className="bg-white rounded-xl border border-sandDark px-4 py-3 mb-6 flex flex-wrap gap-4">
          {agency.phone && (
            <a href={`tel:${agency.phone}`} className="flex items-center gap-2 text-sm text-ink-700 hover:text-terra transition-colors">
              <Phone size={14} className="text-terra" /> {agency.phone}
            </a>
          )}
          {agency.email && (
            <a href={`mailto:${agency.email}`} className="flex items-center gap-2 text-sm text-ink-700 hover:text-terra transition-colors">
              <Mail size={14} className="text-terra" /> {agency.email}
            </a>
          )}
          {agency.website && (
            <a href={agency.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-terra font-medium hover:text-terra-600 transition-colors">
              <Globe size={14} /> {agency.website.replace(/^https?:\/\//, '')}
              <ExternalLink size={11} />
            </a>
          )}
        </div>

        {/* ── Description ─────────────────────────────────── */}
        {agency.description && (
          <div className="bg-white rounded-xl border border-sandDark p-5 mb-6">
            <h2 className="font-display font-bold text-ink-900 mb-3">About {agency.name}</h2>
            <div className="text-sm text-ink-700 leading-relaxed whitespace-pre-line">
              {showFullDesc ? agency.description : descPreview}
            </div>
            {hasMoreDesc && (
              <button onClick={() => setShowFullDesc((v) => !v)}
                className="mt-2 text-terra text-sm font-semibold hover:text-terra-600 transition-colors flex items-center gap-1">
                {showFullDesc ? 'Show less' : 'Read more'}
                <ChevronRight size={14} className={`transition-transform ${showFullDesc ? 'rotate-90' : ''}`} />
              </button>
            )}
          </div>
        )}

        {/* ── Tabs ───────────────────────────────────────── */}
        <div className="flex items-center gap-1 bg-white border border-sandDark rounded-xl p-1 mb-6 overflow-x-auto scrollbar-hide">
          {TABS.map(({ value, label, icon: Icon }) => (
            <button key={value} onClick={() => setActiveTab(value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all flex-1 justify-center ${
                activeTab === value
                  ? 'bg-terra text-white shadow-terra'
                  : 'text-ink-500 hover:text-ink-900 hover:bg-sand'
              }`}
            >
              <Icon size={14} /> {label}
              {value === 'properties' && properties.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === value ? 'bg-white/20 text-white' : 'bg-sand text-ink-500'
                }`}>{properties.length}</span>
              )}
              {value === 'reviews' && reviews.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === value ? 'bg-white/20 text-white' : 'bg-sand text-ink-500'
                }`}>{reviews.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab content ────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >

            {/* PROPERTIES TAB */}
            {activeTab === 'properties' && (
              <div>
                {properties.length === 0 ? (
                  <div className="text-center py-16">
                    <Building2 size={36} className="text-ink-200 mx-auto mb-3" />
                    <p className="text-ink-500 text-sm">No listings yet</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {properties.map((p, i) => (
                        <motion.div key={p.id}
                          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <PropertyCard property={p} variant="card" />
                        </motion.div>
                      ))}
                    </div>
                    <div className="flex justify-center mt-6">
                      <Link to={`/properties?agency=${id}`}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white border border-sandDark text-sm font-semibold text-ink-700 rounded-xl hover:border-terra/40 hover:text-terra transition-all">
                        View all {agency.listing_count} listings <ChevronRight size={14} />
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* REELS TAB */}
            {activeTab === 'reels' && (
              <div>
                {reels.length === 0 ? (
                  <div className="text-center py-16">
                    <Play size={36} className="text-ink-200 mx-auto mb-3" />
                    <p className="text-ink-500 text-sm">No reels yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {reels.map((reel, i) => (
                      <motion.div key={reel.id}
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <Link to="/reels" className="block group">
                          <div className="relative rounded-2xl overflow-hidden bg-sand" style={{ aspectRatio: '9/16' }}>
                            {reel.thumbnail_url
                              ? <img src={reel.thumbnail_url} alt={reel.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              : <div className="w-full h-full bg-swahili/20" />
                            }
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20
                                            flex flex-col justify-between p-3">
                              <div />
                              <div>
                                {/* Play button */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                                w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm
                                                flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                  <Play size={16} className="text-white fill-white ml-0.5" />
                                </div>
                                <p className="text-white text-xs font-semibold line-clamp-2 leading-tight mb-1.5">
                                  {reel.title}
                                </p>
                                <div className="flex items-center gap-2 text-white/70 text-xs">
                                  <span className="flex items-center gap-1">
                                    <Heart size={10} fill="currentColor" /> {formatCount(reel.like_count)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MessageSquare size={10} /> {formatCount(reel.comment_count)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {reel.property && (
                            <p className="text-xs text-ink-500 mt-1.5 truncate">
                              {reel.property.title} · <span className="text-terra font-semibold">
                                {formatCurrency(reel.property.price, 'KES')}
                              </span>
                            </p>
                          )}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-white rounded-2xl border border-sandDark p-5 flex flex-col sm:flex-row gap-6 items-center">
                  <div className="text-center flex-shrink-0">
                    <p className="font-display text-5xl font-bold text-ink-900">{agency.average_rating.toFixed(1)}</p>
                    <StarRating rating={agency.average_rating} size={18} />
                    <p className="text-xs text-ink-500 mt-1">{agency.review_count} reviews</p>
                  </div>
                  <div className="flex-1 w-full space-y-1.5">
                    {[5,4,3,2,1].map((star) => {
                      const pct = star === 5 ? 72 : star === 4 ? 18 : star === 3 ? 7 : star === 2 ? 2 : 1
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="text-ink-500 w-4 text-right">{star}</span>
                          <Star size={10} className="text-gold fill-gold flex-shrink-0" />
                          <div className="flex-1 h-1.5 bg-sand rounded-full overflow-hidden">
                            <div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-ink-400 w-6">{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                  <button onClick={() => setShowReviewForm((v) => !v)}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-terra text-white text-sm font-semibold rounded-xl hover:bg-terra-600 transition-colors shadow-terra">
                    <Star size={14} /> Write a Review
                  </button>
                </div>

                {/* Review form */}
                <AnimatePresence>
                  {showReviewForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white rounded-2xl border border-terra/20 overflow-hidden"
                    >
                      <div className="p-5 space-y-4">
                        <h3 className="font-bold text-ink-900">Your Review</h3>

                        {/* Star picker */}
                        <div>
                          <p className="text-xs font-semibold text-ink-700 mb-2">Rating</p>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map((s) => (
                              <button key={s} onClick={() => setReviewForm((f) => ({ ...f, rating: s }))}
                                className="transition-transform hover:scale-110">
                                <Star size={28} className={s <= reviewForm.rating ? 'text-gold fill-gold' : 'text-ink-200 hover:text-gold/50'} />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Comment */}
                        <div>
                          <p className="text-xs font-semibold text-ink-700 mb-2">Comment</p>
                          <textarea
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                            placeholder="Share your experience with this agency…"
                            rows={4}
                            className="w-full px-3.5 py-2.5 bg-sand border border-sandDark rounded-xl text-sm text-ink-900 placeholder-ink-300 focus:outline-none focus:border-terra focus:ring-2 focus:ring-terra/10 transition-all resize-none"
                          />
                        </div>

                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setShowReviewForm(false)}
                            className="px-4 py-2 text-sm font-semibold text-ink-500 hover:text-ink-900 transition-colors">
                            Cancel
                          </button>
                          <button onClick={handleReviewSubmit} disabled={submitingReview}
                            className="flex items-center gap-2 px-5 py-2 bg-terra text-white text-sm font-semibold rounded-xl hover:bg-terra-600 transition-colors disabled:opacity-60">
                            {submitingReview ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            Submit
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Review list */}
                {reviews.map((review, i) => (
                  <motion.div key={review.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-sandDark p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-terra-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-terra">{getInitials(review.user.full_name)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-ink-900 text-sm">{review.user.full_name}</p>
                          <span className="text-xs text-ink-400 flex items-center gap-1">
                            <Calendar size={10} /> {formatDate(review.created_at)}
                          </span>
                        </div>
                        <StarRating rating={review.rating} size={12} />
                        <p className="text-sm text-ink-700 leading-relaxed mt-2">{review.comment}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* TEAM TAB */}
            {activeTab === 'team' && (
              <div>
                {agents.length === 0 ? (
                  <div className="text-center py-16">
                    <Users size={36} className="text-ink-200 mx-auto mb-3" />
                    <p className="text-ink-500 text-sm">No team members listed</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agents.map((agent, i) => (
                      <motion.div key={agent.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="bg-white rounded-2xl border border-sandDark p-5 flex items-start gap-4"
                      >
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-xl bg-terra-50 border border-terra/15 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {agent.user.avatar_url
                            ? <img src={agent.user.avatar_url} alt="" className="w-full h-full object-cover" />
                            : <span className="text-lg font-bold text-terra">{getInitials(agent.user.full_name)}</span>
                          }
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-semibold text-ink-900 text-sm truncate">{agent.user.full_name}</p>
                            {!agent.is_active && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-sand text-ink-400 rounded-full font-medium flex-shrink-0">
                                Away
                              </span>
                            )}
                          </div>
                          {agent.title && (
                            <p className="text-xs text-ink-500 mb-3">{agent.title}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${agent.is_active ? 'bg-forest' : 'bg-ink-300'}`} />
                            <span className="text-xs text-ink-400">{agent.is_active ? 'Available' : 'Unavailable'}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  )
}