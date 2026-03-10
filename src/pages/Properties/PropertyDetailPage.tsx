// ============================================================
// ESTATE HUB — PROPERTY DETAIL PAGE
// src/pages/Properties/PropertyDetailPage.tsx
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, Bookmark, Share2, MapPin, Bed, Bath, Maximize2,
  CheckCircle2, Building2, ChevronLeft, ChevronRight,
  MessageSquare, Phone, Globe, Star, Send, X, Calendar,
  ArrowLeft, Eye, Users, Zap, ShieldCheck, ExternalLink,
  Loader2, ChevronDown, Copy, Check,
} from 'lucide-react'
import api from '@/services/api'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { toggleLiked, toggleSaved } from '@/store/slices/propertySlice'
import {
  formatCurrencyFull, formatCurrency, formatListingType,
  timeAgo, formatDate, getInitials, formatCount,
} from '@/utils/format'
import type { Property, Comment } from '@/types'
import toast from 'react-hot-toast'

// ── Mock property ─────────────────────────────────────────────
const MOCK_PROPERTY: Property = {
  id: 1,
  title: '4-Bedroom Villa with Pool — Karen, Nairobi',
  description: `This exceptional villa offers an unparalleled lifestyle in one of Nairobi's most prestigious neighbourhoods. 
Set on a lush 0.5-acre plot, the property features high-end finishes throughout, a state-of-the-art kitchen, 
and a private heated swimming pool surrounded by manicured gardens.

The master bedroom suite occupies the entire upper wing, complete with a walk-in wardrobe and an en-suite with a 
freestanding bathtub and rainfall shower. Three additional bedrooms are generously sized, each with their own en-suite.

The expansive open-plan living and dining area flows seamlessly to a covered outdoor terrace — perfect for entertaining. 
A double garage, staff quarters, solar backup system, and borehole complete this world-class offering.`,
  listing_type: 'sale',
  property_type: 'villa',
  price: 68500000,
  price_currency: 'KES',
  is_negotiable: true,
  bedrooms: 4,
  bathrooms: 4,
  size: 420,
  size_unit: 'm²',
  city: 'Nairobi',
  county: 'Nairobi',
  neighborhood: 'Karen',
  address: 'Karen Road, Off Langata Road, Nairobi',
  latitude: -1.3185,
  longitude: 36.7094,
  amenities: [
    'Swimming Pool', 'Solar Backup', 'Borehole', 'CCTV Security',
    'Electric Fence', 'DSQ / Staff Quarters', 'Double Garage',
    'Garden', 'Fibre Internet', 'Generator Backup',
  ],
  is_verified: true,
  is_featured: true,
  status: 'published',
  cover_image_url: 'https://picsum.photos/seed/villa1/1200/800',
  media: [
    { id: 1, url: 'https://picsum.photos/seed/villa1/1200/800', media_type: 'image', is_cover: true,  order: 1 },
    { id: 2, url: 'https://picsum.photos/seed/villa2/1200/800', media_type: 'image', is_cover: false, order: 2 },
    { id: 3, url: 'https://picsum.photos/seed/villa3/1200/800', media_type: 'image', is_cover: false, order: 3 },
    { id: 4, url: 'https://picsum.photos/seed/villa4/1200/800', media_type: 'image', is_cover: false, order: 4 },
    { id: 5, url: 'https://picsum.photos/seed/villa5/1200/800', media_type: 'image', is_cover: false, order: 5 },
  ],
  agency: {
    id: 1,
    name: 'Knight Frank Kenya',
    logo_url: undefined,
    is_verified: true,
    city: 'Nairobi',
  },
  like_count: 47,
  save_count: 23,
  comment_count: 8,
  view_count: 312,
  is_liked: false,
  is_saved: false,
  created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
}

const MOCK_COMMENTS: Comment[] = [
  { id: 1, user: { id: 2, full_name: 'Amara Osei',       avatar_url: undefined }, body: 'Is this property still available? Interested in a viewing this weekend.', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 2, user: { id: 3, full_name: 'Fatima Al-Hassan', avatar_url: undefined }, body: "Beautiful property! The garden looks stunning. What's the condition of the borehole?", created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 3, user: { id: 4, full_name: 'David Kamau',      avatar_url: undefined }, body: 'Viewed last Saturday — absolutely stunning property. The pool area is incredible.', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
]

// ── Image gallery ─────────────────────────────────────────────
function ImageGallery({ media }: { media: Property['media'] }) {
  const images = media?.filter((m) => m.media_type === 'image') ?? []
  const [activeIdx, setActiveIdx] = useState(0)
  const [lightbox, setLightbox]   = useState(false)

  if (images.length === 0) {
    return (
      <div className="w-full aspect-video bg-stone-100 rounded-2xl flex items-center justify-center">
        <Building2 size={48} className="text-gray-300" />
      </div>
    )
  }

  const prev = () => setActiveIdx((i) => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setActiveIdx((i) => (i === images.length - 1 ? 0 : i + 1))

  return (
    <>
      <div className="space-y-2">
        {/* Main image */}
        <div
          className="relative rounded-2xl overflow-hidden bg-stone-100 cursor-zoom-in group"
          style={{ aspectRatio: '16/9' }}
          onClick={() => setLightbox(true)}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={activeIdx}
              src={images[activeIdx].url}
              alt={`Photo ${activeIdx + 1}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />
          </AnimatePresence>

          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60">
                <ChevronLeft size={18} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60">
                <ChevronRight size={18} />
              </button>
            </>
          )}

          <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
            {activeIdx + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button key={img.id} onClick={() => setActiveIdx(i)}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all ${
                  i === activeIdx ? 'ring-2 ring-purple-600 ring-offset-1' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setLightbox(false)}
          >
            <button className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
              <X size={20} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20">
              <ChevronLeft size={22} />
            </button>
            <motion.img
              key={activeIdx}
              src={images[activeIdx].url}
              alt=""
              className="max-w-5xl max-h-[85vh] w-full object-contain px-16"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20">
              <ChevronRight size={22} />
            </button>
            <div className="absolute bottom-4 text-white/60 text-sm">{activeIdx + 1} of {images.length}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Booking modal ─────────────────────────────────────────────
function BookingModal({ property, onClose }: { property: Property; onClose: () => void }) {
  const { isAuthenticated } = useAppSelector((s) => s.auth)
  const navigate = useNavigate()
  const [form, setForm] = useState({
    booking_type: 'viewing',
    preferred_date: '',
    check_in: '',
    check_out: '',
    buyer_notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (!form.preferred_date) { toast.error('Please select a preferred date'); return }
    setLoading(true)
    try {
      await api.post('/bookings/', {
        property: property.id,
        booking_type: form.booking_type,
        preferred_date: form.preferred_date,
        ...(form.check_in    && { check_in:    form.check_in }),
        ...(form.check_out   && { check_out:   form.check_out }),
        ...(form.buyer_notes && { buyer_notes: form.buyer_notes }),
      })
      setSuccess(true)
    } catch {
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Requested!</h3>
            <p className="text-gray-500 text-sm mb-6">
              Your booking request has been sent to {property.agency.name}. They will confirm shortly.
            </p>
            <button onClick={onClose}
              className="w-full py-3 bg-purple-700 text-white font-semibold rounded-xl hover:bg-purple-800 transition-colors">
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <div>
                <h3 className="font-bold text-gray-900">Book a Viewing</h3>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{property.title}</p>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Booking type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Booking Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'viewing',     label: 'Viewing',     icon: Eye },
                    { value: 'reservation', label: 'Reservation', icon: Calendar },
                    { value: 'purchase',    label: 'Purchase',    icon: ShieldCheck },
                  ].map(({ value, label, icon: Icon }) => (
                    <button key={value} onClick={() => setForm((f) => ({ ...f, booking_type: value }))}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                        form.booking_type === value
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-stone-200 text-gray-500 hover:border-purple-300 hover:text-gray-900'
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred date */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Preferred Date <span className="text-red-500">*</span>
                </label>
                <input type="date"
                  value={form.preferred_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm((f) => ({ ...f, preferred_date: e.target.value }))}
                  className={inputCls}
                />
              </div>

              {/* Check-in / Check-out (for rent/short stay) */}
              {property.listing_type !== 'sale' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Check-in</label>
                    <input type="date" value={form.check_in}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setForm((f) => ({ ...f, check_in: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Check-out</label>
                    <input type="date" value={form.check_out}
                      min={form.check_in || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setForm((f) => ({ ...f, check_out: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Message (optional)</label>
                <textarea
                  value={form.buyer_notes}
                  onChange={(e) => setForm((f) => ({ ...f, buyer_notes: e.target.value }))}
                  placeholder="Any specific questions or requirements…"
                  rows={3}
                  className={`${inputCls} resize-none placeholder:text-gray-400`}
                />
              </div>

              <button onClick={handleSubmit} disabled={loading}
                className="w-full py-3 bg-purple-700 text-white font-semibold rounded-xl hover:bg-purple-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Sending…</>
                  : <><Calendar size={16} /> Request Booking</>
                }
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

// ── Share modal ───────────────────────────────────────────────
function ShareModal({ property, onClose }: { property: Property; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const url = window.location.href

  const copy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Share Property</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors">
            <X size={15} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 font-medium">{property.title}</p>
        <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl mb-4">
          <p className="text-xs text-gray-500 flex-1 truncate">{url}</p>
          <button onClick={copy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-white border border-stone-200 text-gray-700 hover:border-purple-400 hover:text-purple-700'
            }`}
          >
            {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'WhatsApp',  href: `https://wa.me/?text=${encodeURIComponent(property.title + ' ' + url)}`, color: 'bg-[#25D366] text-white' },
            { label: 'Twitter/X', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(property.title)}&url=${encodeURIComponent(url)}`, color: 'bg-[#1DA1F2] text-white' },
            { label: 'Facebook',  href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, color: 'bg-[#1877F2] text-white' },
          ].map(({ label, href, color }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className={`${color} py-2 rounded-xl text-xs font-semibold text-center hover:opacity-90 transition-opacity`}>
              {label}
            </a>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Comment section ───────────────────────────────────────────
function CommentSection({ propertyId, comments: initial }: { propertyId: number; comments: Comment[] }) {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth)
  const navigate = useNavigate()
  const [comments, setComments] = useState<Comment[]>(initial)
  const [body, setBody]         = useState('')
  const [loading, setLoading]   = useState(false)
  const commentsRef = useRef<HTMLDivElement>(null)

  const submit = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (!body.trim()) return
    setLoading(true)
    try {
      const res = await api.post(`/properties/${propertyId}/comments/`, { body })
      setComments((prev) => [res.data, ...prev])
      setBody('')
    } catch {
      const mock: Comment = {
        id: Date.now(),
        user: { id: user?.id ?? 0, full_name: user ? `${user.first_name} ${user.last_name}` : 'You', avatar_url: undefined },
        body: body.trim(),
        created_at: new Date().toISOString(),
      }
      setComments((prev) => [mock, ...prev])
      setBody('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={commentsRef} id="comments">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Comments <span className="text-gray-400 font-normal text-base">({comments.length})</span>
      </h3>

      {/* Input */}
      <div className="flex gap-3 mb-6">
        <div className="w-9 h-9 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-purple-700">
            {user ? getInitials(`${user.first_name} ${user.last_name}`) : '?'}
          </span>
        </div>
        <div className="flex-1">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={isAuthenticated ? 'Write a comment…' : 'Sign in to comment'}
            disabled={!isAuthenticated}
            rows={2}
            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-gray-900
                       placeholder:text-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2
                       focus:ring-purple-100 transition-all resize-none disabled:opacity-60"
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit() }}
          />
          {body.trim() && (
            <div className="flex justify-end mt-2">
              <button onClick={submit} disabled={loading}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-700 text-white text-xs font-semibold rounded-lg hover:bg-purple-800 transition-colors disabled:opacity-60"
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comment list */}
      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((c) => (
            <motion.div key={c.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {c.user.avatar_url
                  ? <img src={c.user.avatar_url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-xs font-bold text-gray-500">{getInitials(c.user.full_name)}</span>
                }
              </div>
              <div className="flex-1">
                <div className="bg-stone-50 rounded-xl px-3.5 py-2.5">
                  <p className="text-xs font-semibold text-gray-900 mb-1">{c.user.full_name}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{c.body}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1 ml-1">{timeAgo(c.created_at)}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {comments.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  )
}

// ── Map placeholder ───────────────────────────────────────────
function MapPlaceholder({ lat, lng, address }: { lat?: number; lng?: number; address?: string }) {
  const mapUrl = lat && lng
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`
    : null

  return (
    <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-100" style={{ height: 240 }}>
      {mapUrl ? (
        <iframe src={mapUrl} width="100%" height="100%" className="border-0" title="Property location" loading="lazy" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          <MapPin size={28} className="text-gray-300" />
          <p className="text-sm text-gray-400">{address || 'Location not available'}</p>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function PropertyDetailPage() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const dispatch   = useAppDispatch()
  const { isAuthenticated } = useAppSelector((s) => s.auth)
  const savedIds   = useAppSelector((s) => s.property.savedProperties)
  const likedIds   = useAppSelector((s) => s.property.likedProperties)

  const [property,      setProperty]      = useState<Property | null>(null)
  const [comments,      setComments]      = useState<Comment[]>([])
  const [loading,       setLoading]       = useState(true)
  const [likeCount,     setLikeCount]     = useState(0)
  const [showBooking,   setShowBooking]   = useState(false)
  const [showShare,     setShowShare]     = useState(false)
  const [engaging,      setEngaging]      = useState(false)
  const [startingChat,  setStartingChat]  = useState(false)
  const [showFullDesc,  setShowFullDesc]  = useState(false)

  const isSaved = property ? savedIds.includes(property.id) : false
  const isLiked = property ? likedIds.includes(property.id) : false

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [propRes, commentsRes] = await Promise.all([
          api.get<Property>(`/properties/${id}/`),
          api.get<{ results: Comment[] }>(`/properties/${id}/comments/`),
        ])
        setProperty(propRes.data)
        setLikeCount(propRes.data.like_count ?? 0)
        setComments(commentsRes.data.results ?? [])
      } catch {
        setProperty(MOCK_PROPERTY)
        setLikeCount(MOCK_PROPERTY.like_count ?? 0)
        setComments(MOCK_COMMENTS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleLike = async () => {
    if (!isAuthenticated) { toast('Sign in to like'); return }
    if (!property) return
    dispatch(toggleLiked(property.id))
    setLikeCount((prev) => isLiked ? prev - 1 : prev + 1)
    try { await api.post(`/properties/${property.id}/like/`) } catch { dispatch(toggleLiked(property.id)) }
  }

  const handleSave = async () => {
    if (!isAuthenticated) { toast('Sign in to save'); return }
    if (!property) return
    dispatch(toggleSaved(property.id))
    try { await api.post(`/properties/${property.id}/save/`) } catch { dispatch(toggleSaved(property.id)) }
  }

  const handleEngage = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (!property) return
    setEngaging(true)
    try {
      await api.post(`/properties/${property.id}/engage/`)
      toast.success('Agency has been notified of your interest!')
    } catch {
      toast.success('Agency has been notified of your interest!')
    } finally {
      setEngaging(false)
    }
  }

  const handleStartChat = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (!property) return
    setStartingChat(true)
    try {
      const res = await api.post('/messaging/conversations/start/', {
        agency_id:   property.agency.id,
        property_id: property.id,
      })
      navigate(`/messages/${res.data.id}`)
    } catch {
      navigate('/messages')
    } finally {
      setStartingChat(false)
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="w-full aspect-video bg-stone-200 rounded-2xl animate-pulse" />
            <div className="h-7 bg-stone-200 rounded w-3/4 animate-pulse" />
            <div className="h-5 bg-stone-200 rounded w-1/2 animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-stone-200 rounded-2xl animate-pulse" />
            <div className="h-32 bg-stone-200 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!property) return null

  const descLines   = property.description?.split('\n\n') ?? []
  const descPreview = descLines.slice(0, 2).join('\n\n')
  const hasMore     = descLines.length > 2

  // Shared utility strings
  const cardCls   = "bg-white rounded-2xl border border-stone-200 p-5"
  const actionBtn = "w-full flex items-center justify-center gap-2 py-2.5 bg-stone-50 border border-stone-200 text-gray-700 text-sm font-semibold rounded-xl hover:border-purple-400 hover:text-purple-700 transition-all"

  return (
    <div className="min-h-screen bg-stone-50 pb-16">

      {/* ── Back nav ─────────────────────────────────────── */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to listings</span>
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-500 truncate">{property.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ── Left column (main content) ─────────────── */}
          <div className="lg:col-span-2 space-y-6">

            <ImageGallery media={property.media} />

            {/* Title + badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  property.listing_type === 'sale' ? 'bg-slate-100 text-slate-700' :
                  property.listing_type === 'rent' ? 'bg-purple-50 text-purple-700' :
                                                     'bg-amber-50 text-amber-700'
                }`}>
                  {formatListingType(property.listing_type)}
                </span>
                {property.is_verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                    <CheckCircle2 size={11} /> Verified
                  </span>
                )}
                {property.is_featured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                    ★ Featured
                  </span>
                )}
                {property.is_negotiable && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-gray-500">
                    Negotiable
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-2">
                {property.title}
              </h1>

              <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
                <MapPin size={14} className="text-purple-600 flex-shrink-0" />
                <span>
                  {[property.address, property.neighborhood, property.city, property.county].filter(Boolean).join(', ')}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><Eye size={13} />{formatCount(property.view_count ?? 0)} views</span>
                <span className="flex items-center gap-1.5"><Heart size={13} />{formatCount(likeCount)} likes</span>
                <span className="flex items-center gap-1.5"><MessageSquare size={13} />{property.comment_count} comments</span>
                <span className="flex items-center gap-1.5 text-gray-400 text-xs">Listed {timeAgo(property.created_at)}</span>
              </div>
            </div>

            {/* Price + specs */}
            <div className={cardCls}>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5 font-medium uppercase tracking-wide">Asking Price</p>
                  <p className="text-3xl font-bold text-purple-700">
                    {formatCurrencyFull(property.price, property.price_currency)}
                    {property.price_per && (
                      <span className="text-base text-gray-500 font-normal ml-1">/{property.price_per}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleLike}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all ${
                      isLiked
                        ? 'bg-purple-50 border-purple-300 text-purple-700'
                        : 'bg-white border-stone-200 text-gray-500 hover:border-purple-300 hover:text-purple-700'
                    }`}
                  >
                    <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
                    {likeCount > 0 ? likeCount : 'Like'}
                  </button>
                  <button onClick={handleSave}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all ${
                      isSaved
                        ? 'bg-slate-50 border-slate-300 text-slate-700'
                        : 'bg-white border-stone-200 text-gray-500 hover:border-slate-300 hover:text-slate-700'
                    }`}
                  >
                    <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                  <button onClick={() => setShowShare(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-gray-500 hover:border-purple-300 hover:text-purple-700 text-sm font-semibold transition-all">
                    <Share2 size={15} /> Share
                  </button>
                </div>
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Bed,       label: 'Bedrooms',  value: property.bedrooms  > 0 ? property.bedrooms  : '—' },
                  { icon: Bath,      label: 'Bathrooms', value: property.bathrooms > 0 ? property.bathrooms : '—' },
                  { icon: Maximize2, label: 'Size',      value: property.size ? `${property.size.toLocaleString()} ${property.size_unit ?? 'm²'}` : '—' },
                  { icon: Building2, label: 'Type',      value: property.property_type },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-stone-50 rounded-xl">
                    <Icon size={18} className="text-purple-600" />
                    <p className="text-lg font-bold text-gray-900 capitalize">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className={cardCls}>
              <h2 className="text-lg font-bold text-gray-900 mb-3">About this property</h2>
              <div className="text-sm text-gray-700 leading-relaxed space-y-3 whitespace-pre-line">
                {showFullDesc || !hasMore ? property.description : descPreview}
              </div>
              {hasMore && (
                <button onClick={() => setShowFullDesc((v) => !v)}
                  className="mt-3 flex items-center gap-1 text-purple-700 text-sm font-semibold hover:text-purple-900 transition-colors">
                  {showFullDesc ? 'Show less' : 'Read more'}
                  <ChevronDown size={14} className={`transition-transform ${showFullDesc ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className={cardCls}>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Amenities & Features</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span key={a}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      <CheckCircle2 size={11} /> {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            <div className={cardCls}>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Location</h2>
              <MapPlaceholder lat={property.latitude} lng={property.longitude} address={property.address} />
              {property.address && (
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                  <MapPin size={14} className="text-purple-600" />
                  {property.address}
                  {property.latitude && property.longitude && (
                    <a href={`https://maps.google.com/?q=${property.latitude},${property.longitude}`}
                      target="_blank" rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 text-purple-700 text-xs font-semibold hover:underline">
                      Open in Maps <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Comments */}
            <div className={cardCls}>
              <CommentSection propertyId={property.id} comments={comments} />
            </div>
          </div>

          {/* ── Right column (actions sidebar) ─────────── */}
          <div className="space-y-4 lg:sticky lg:top-20">

            {/* Price card (mobile) */}
            <div className="lg:hidden bg-white rounded-2xl border border-stone-200 p-4">
              <p className="text-2xl font-bold text-purple-700">
                {formatCurrency(property.price, property.price_currency)}
                {property.price_per && (
                  <span className="text-sm text-gray-500 font-normal ml-1">/{property.price_per}</span>
                )}
              </p>
            </div>

            {/* CTA actions */}
            <div className={`${cardCls} space-y-3`}>
              <button onClick={() => setShowBooking(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-purple-700 text-white font-semibold rounded-xl hover:bg-purple-800 transition-all shadow-sm text-sm">
                <Calendar size={16} /> Book a Viewing
              </button>
              <button onClick={handleEngage} disabled={engaging}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-900 transition-all text-sm disabled:opacity-60">
                {engaging ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                {engaging ? 'Sending…' : 'Engage Agency'}
              </button>
              <button onClick={handleStartChat} disabled={startingChat}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-purple-200 text-purple-700 font-semibold rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all text-sm disabled:opacity-60">
                {startingChat ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                Start a Chat
              </button>
            </div>

            {/* Agency card */}
            <div className={cardCls}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Listed by</p>
              <Link to={`/agencies/${property.agency.id}`} className="flex items-center gap-3 mb-4 group">
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {property.agency.logo_url
                    ? <img src={property.agency.logo_url} alt="" className="w-full h-full object-cover" />
                    : <span className="text-sm font-bold text-purple-700">{getInitials(property.agency.name)}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-gray-900 text-sm group-hover:text-purple-700 transition-colors truncate">
                      {property.agency.name}
                    </p>
                    {property.agency.is_verified && (
                      <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {property.agency.city}
                  </p>
                </div>
              </Link>
              <div className="space-y-2">
                <a href="tel:+254700000000" className={actionBtn}><Phone size={14} /> Call Agency</a>
                <Link to={`/agencies/${property.agency.id}`} className={actionBtn}><Globe size={14} /> View Profile</Link>
              </div>
            </div>

            {/* Safety tip */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
              <div className="flex items-start gap-2.5">
                <ShieldCheck size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-emerald-700 mb-1">Safe Transaction Tip</p>
                  <p className="text-xs text-emerald-700/80 leading-relaxed">
                    Always use Estate Hub's escrow system to protect your payment. Never pay directly without verification.
                  </p>
                </div>
              </div>
            </div>

            {/* Property stats */}
            <div className={cardCls}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Property Stats</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Views',     value: formatCount(property.view_count    ?? 0), icon: Eye      },
                  { label: 'Saves',     value: formatCount(property.save_count    ?? 0), icon: Bookmark },
                  { label: 'Likes',     value: formatCount(likeCount),                   icon: Heart    },
                  { label: 'Enquiries', value: formatCount(property.comment_count ?? 0), icon: Users    },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl">
                    <Icon size={13} className="text-purple-600" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{value}</p>
                      <p className="text-xs text-gray-500">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────── */}
      <AnimatePresence>
        {showBooking && <BookingModal property={property} onClose={() => setShowBooking(false)} />}
        {showShare   && <ShareModal   property={property} onClose={() => setShowShare(false)}   />}
      </AnimatePresence>
    </div>
  )
}