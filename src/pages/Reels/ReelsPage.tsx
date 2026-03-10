// ============================================================
// ESTATE HUB — REELS PAGE (TikTok-style full-screen vertical)
// src/pages/Reels/ReelsPage.tsx
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, MessageSquare, Bookmark, Share2, Volume2, VolumeX,
  Play, Pause, CheckCircle2, MapPin, ArrowLeft, ChevronUp,
  ChevronDown, X, Send, Loader2, ExternalLink,
} from 'lucide-react'
import api from '@/services/api'
import { useAppSelector } from '@/store/hooks'
import { getInitials, formatCount, formatCurrency, timeAgo } from '@/utils/format'
import type { Reel, Comment } from '@/types'
import toast from 'react-hot-toast'

// ── Mock reels ────────────────────────────────────────────────
const MOCK_REELS: Reel[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  title: [
    'Karen Villa with Pool 🏊 — KES 68.5M',
    'Modern Penthouse, Upperhill ✨',
    'Beachfront Cottage, Diani 🌊',
    '3BR Townhouse, Lavington 🌿',
    'Westlands Office Space 🏢',
    'Muthaiga Mansion Tour 👑',
    'Kilimani Apartment — Ready to Move In',
    'Ngong Hills Eco Retreat 🌄',
  ][i],
  description: [
    'Luxury living at its finest. 4 beds, heated pool, double garage on half an acre in Karen.',
    'Stunning panoramic views of Nairobi skyline. 4 beds, 4 baths, rooftop terrace.',
    'Wake up to ocean views every morning. 2 beds, private beach access, fully furnished.',
    'Family home in a leafy suburb. 3 beds, 3 baths, landscaped garden.',
    'Grade A office space in the heart of Westlands. 450 sqm, flexible layout.',
    'Old money elegance meets modern luxury. 5 beds, 6 baths, staff quarters.',
    'Brand new 3BR apartment. Modern kitchen, backup power, secure parking.',
    'Off-grid luxury retreat on 2 acres. Solar powered, borehole, mountain views.',
  ][i],
  video_url: '',
  thumbnail_url: `https://picsum.photos/seed/reel${i + 1}/720/1280`,
  property: {
    id: i + 1,
    title: ['Karen Villa','Upperhill Penthouse','Diani Cottage','Lavington Townhouse','Westlands Office','Muthaiga Mansion','Kilimani Apt','Ngong Retreat'][i],
    price: [68500000, 250000, 12000, 120000, 350000, 95000000, 85000, 45000][i],
    city: ['Nairobi','Nairobi','Kwale','Nairobi','Nairobi','Nairobi','Nairobi','Kajiado'][i],
    listing_type: (['sale','rent','short_stay','rent','rent','sale','rent','short_stay'] as const)[i],
  },
  agency: {
    id: (i % 4) + 1,
    name: ['Knight Frank Kenya','Optiven Real Estate','Hass Consult','Pam Golding'][i % 4],
    logo_url: undefined,
    is_verified: true,
    city: 'Nairobi',
  },
  like_count:    [234, 892, 1240, 456, 89, 2100, 334, 178][i],
  comment_count: [12, 34, 67, 18, 5, 98, 22, 9][i],
  is_liked: false,
  is_saved: false,
  created_at: new Date(Date.now() - i * 86400000 * 2).toISOString(),
}))

const MOCK_COMMENTS: Comment[] = [
  { id: 1, user: { id: 2, full_name: 'Amara Osei',       avatar_url: undefined }, body: 'Absolutely stunning! Is this still available?',    created_at: new Date(Date.now() - 3600000).toISOString()  },
  { id: 2, user: { id: 3, full_name: 'David Kamau',      avatar_url: undefined }, body: 'Viewed last week — the pool area is 🔥',            created_at: new Date(Date.now() - 7200000).toISOString()  },
  { id: 3, user: { id: 4, full_name: 'Fatima Al-Hassan', avatar_url: undefined }, body: "What's the service charge per month?",              created_at: new Date(Date.now() - 86400000).toISOString() },
]

// ── Comment drawer ────────────────────────────────────────────
function CommentDrawer({ reel, onClose }: { reel: Reel; onClose: () => void }) {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth)
  const navigate = useNavigate()
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS)
  const [body, setBody]         = useState('')
  const [loading, setLoading]   = useState(false)

  const submit = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (!body.trim()) return
    setLoading(true)
    try {
      const res = await api.post(`/reels/${reel.id}/comments/`, { body })
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
    <motion.div
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="absolute inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl"
      style={{ maxHeight: '75vh' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Handle */}
      <div className="flex justify-center pt-3 pb-2">
        <div className="w-10 h-1 rounded-full bg-stone-200" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-3 border-b border-stone-200">
        <h3 className="font-bold text-gray-900">
          Comments <span className="text-gray-400 font-normal">({reel.comment_count})</span>
        </h3>
        <button onClick={onClose}
          className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors">
          <X size={15} className="text-gray-500" />
        </button>
      </div>

      {/* Comment list */}
      <div className="overflow-y-auto px-5 py-3 space-y-4" style={{ maxHeight: 'calc(75vh - 160px)' }}>
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-purple-700">{getInitials(c.user.full_name)}</span>
            </div>
            <div className="flex-1">
              <div className="bg-stone-50 rounded-xl px-3 py-2">
                <p className="text-xs font-semibold text-gray-900 mb-0.5">{c.user.full_name}</p>
                <p className="text-sm text-gray-700">{c.body}</p>
              </div>
              <p className="text-xs text-gray-400 mt-1 ml-1">{timeAgo(c.created_at)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 p-4 border-t border-stone-200">
        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-purple-700">
            {user ? getInitials(`${user.first_name} ${user.last_name}`) : '?'}
          </span>
        </div>
        <div className="flex-1 flex gap-2">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Add a comment…"
            className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-gray-900
                       placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
          />
          <button onClick={submit} disabled={loading || !body.trim()}
            className="w-9 h-9 rounded-xl bg-purple-700 flex items-center justify-center disabled:opacity-40 hover:bg-purple-800 transition-colors flex-shrink-0"
          >
            {loading
              ? <Loader2 size={14} className="text-white animate-spin" />
              : <Send size={14} className="text-white" />
            }
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Individual reel slide ──────────────────────────────────────
function ReelSlide({
  reel, isActive, onNext, onPrev, isFirst, isLast,
}: {
  reel: Reel
  isActive: boolean
  onNext: () => void
  onPrev: () => void
  isFirst: boolean
  isLast: boolean
}) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAppSelector((s) => s.auth)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [playing,      setPlaying]      = useState(false)
  const [muted,        setMuted]        = useState(true)
  const [liked,        setLiked]        = useState(reel.is_liked ?? false)
  const [saved,        setSaved]        = useState(reel.is_saved ?? false)
  const [likeCount,    setLikeCount]    = useState(reel.like_count)
  const [showComments, setShowComments] = useState(false)
  const [showDesc,     setShowDesc]     = useState(false)

  useEffect(() => {
    if (!videoRef.current) return
    if (isActive) {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    } else {
      videoRef.current.pause()
      setPlaying(false)
      setShowComments(false)
    }
  }, [isActive])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (playing) { videoRef.current.pause(); setPlaying(false) }
    else         { videoRef.current.play();  setPlaying(true)  }
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) { toast('Sign in to like'); return }
    setLiked((v) => !v)
    setLikeCount((n) => liked ? n - 1 : n + 1)
    try { await api.post(`/reels/${reel.id}/like/`) } catch { /* optimistic */ }
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) { toast('Sign in to save'); return }
    setSaved((v) => !v)
    try { await api.post(`/reels/${reel.id}/save/`) } catch { /* optimistic */ }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/reels`
    if (navigator.share) {
      await navigator.share({ title: reel.title, url })
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied!')
    }
  }

  const desc          = reel.description ?? ''
  const descTruncated = desc.length > 80 ? desc.slice(0, 80) + '…' : desc

  return (
    <div className="relative w-full h-full bg-black select-none">

      {/* Video / Image background */}
      {reel.video_url ? (
        <video
          ref={videoRef}
          src={reel.video_url}
          muted={muted}
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onClick={togglePlay}
        />
      ) : (
        <div className="absolute inset-0 cursor-pointer" onClick={togglePlay}>
          {reel.thumbnail_url && (
            <img src={reel.thumbnail_url} alt={reel.title} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
        </div>
      )}

      {/* Play/Pause indicator */}
      <AnimatePresence>
        {!playing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <Play size={28} className="text-white fill-white ml-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 pt-4 pb-8
                      bg-gradient-to-b from-black/60 to-transparent">
        <Link to="/properties" onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 text-white/90 text-sm font-semibold hover:text-white transition-colors">
          <ArrowLeft size={18} />
          <span className="font-bold text-base tracking-wide">Estate Hub</span>
        </Link>
        <button onClick={(e) => { e.stopPropagation(); setMuted((v) => !v) }}
          className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-colors">
          {muted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-white" />}
        </button>
      </div>

      {/* Swipe nav hints (desktop) */}
      {!isFirst && (
        <button onClick={(e) => { e.stopPropagation(); onPrev() }}
          className="absolute top-1/2 -translate-y-1/2 left-3 z-20 w-8 h-8 rounded-full bg-white/10 hidden md:flex items-center justify-center hover:bg-white/20 transition-colors">
          <ChevronUp size={18} className="text-white" />
        </button>
      )}
      {!isLast && (
        <button onClick={(e) => { e.stopPropagation(); onNext() }}
          className="absolute top-1/2 -translate-y-1/2 right-3 z-20 w-8 h-8 rounded-full bg-white/10 hidden md:flex items-center justify-center hover:bg-white/20 transition-colors">
          <ChevronDown size={18} className="text-white" />
        </button>
      )}

      {/* Right action buttons */}
      <div className="absolute right-3 bottom-32 z-20 flex flex-col items-center gap-5"
           onClick={(e) => e.stopPropagation()}>

        {/* Agency avatar */}
        <Link to={`/agencies/${reel.agency.id}`}
          className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center overflow-hidden hover:border-white transition-colors">
          {reel.agency.logo_url
            ? <img src={reel.agency.logo_url} alt="" className="w-full h-full object-cover" />
            : <span className="text-xs font-bold text-white">{getInitials(reel.agency.name)}</span>
          }
        </Link>

        {/* Like */}
        <motion.button whileTap={{ scale: 0.8 }} onClick={handleLike}
          className="flex flex-col items-center gap-1">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
            liked ? 'bg-red-500/80' : 'bg-white/15 hover:bg-white/25'
          }`}>
            <Heart size={20} className="text-white" fill={liked ? 'white' : 'none'} />
          </div>
          <span className="text-white text-xs font-semibold">{formatCount(likeCount)}</span>
        </motion.button>

        {/* Comment */}
        <motion.button whileTap={{ scale: 0.8 }}
          onClick={(e) => { e.stopPropagation(); setShowComments(true) }}
          className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center backdrop-blur-sm transition-all">
            <MessageSquare size={20} className="text-white" />
          </div>
          <span className="text-white text-xs font-semibold">{formatCount(reel.comment_count)}</span>
        </motion.button>

        {/* Save */}
        <motion.button whileTap={{ scale: 0.8 }} onClick={handleSave}
          className="flex flex-col items-center gap-1">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
            saved ? 'bg-amber-400/70' : 'bg-white/15 hover:bg-white/25'
          }`}>
            <Bookmark size={20} className="text-white" fill={saved ? 'white' : 'none'} />
          </div>
          <span className="text-white text-xs font-semibold">Save</span>
        </motion.button>

        {/* Share */}
        <motion.button whileTap={{ scale: 0.8 }} onClick={handleShare}
          className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center backdrop-blur-sm transition-all">
            <Share2 size={20} className="text-white" />
          </div>
          <span className="text-white text-xs font-semibold">Share</span>
        </motion.button>
      </div>

      {/* Bottom info bar */}
      <div className="absolute bottom-0 inset-x-0 z-20 px-4 pb-6 pt-16
                      bg-gradient-to-t from-black/85 via-black/40 to-transparent"
           onClick={(e) => e.stopPropagation()}>

        {/* Agency name */}
        <Link to={`/agencies/${reel.agency.id}`}
          className="flex items-center gap-2 mb-2 w-fit hover:opacity-90 transition-opacity">
          <span className="text-white font-semibold text-sm">{reel.agency.name}</span>
          {reel.agency.is_verified && <CheckCircle2 size={13} className="text-emerald-400" />}
        </Link>

        {/* Title */}
        <h2 className="text-white font-bold text-base leading-snug mb-1">{reel.title}</h2>

        {/* Description */}
        {desc && (
          <p className="text-white/80 text-sm leading-relaxed mb-3">
            {showDesc ? desc : descTruncated}
            {desc.length > 80 && (
              <button onClick={() => setShowDesc((v) => !v)}
                className="text-white font-semibold ml-1 hover:text-amber-400 transition-colors">
                {showDesc ? ' less' : ' more'}
              </button>
            )}
          </p>
        )}

        {/* Property pill */}
        {reel.property && (
          <Link
            to={`/properties/${reel.property.id}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/10 backdrop-blur-sm
                       border border-white/20 rounded-full hover:bg-white/20 transition-all"
          >
            <MapPin size={12} className="text-amber-400 flex-shrink-0" />
            <span className="text-white text-xs font-semibold truncate max-w-[180px]">
              {reel.property.title}
            </span>
            <span className="text-amber-400 text-xs font-bold flex-shrink-0">
              {formatCurrency(reel.property.price, 'KES')}
            </span>
            <ExternalLink size={11} className="text-white/60 flex-shrink-0" />
          </Link>
        )}
      </div>

      {/* Comment drawer */}
      <AnimatePresence>
        {showComments && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black"
              onClick={() => setShowComments(false)}
            />
            <CommentDrawer reel={reel} onClose={() => setShowComments(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Progress dots ─────────────────────────────────────────────
function ProgressDots({ total, current }: { total: number; current: number }) {
  const visible = Math.min(total, 7)
  const start   = Math.max(0, Math.min(current - 3, total - visible))
  const dots    = Array.from({ length: visible }, (_, i) => start + i)

  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5">
      {dots.map((i) => (
        <div key={i}
          className={`rounded-full transition-all duration-300 ${
            i === current ? 'w-1.5 h-5 bg-white' : 'w-1.5 h-1.5 bg-white/40'
          }`}
        />
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function ReelsPage() {
  const [reels,     setReels]     = useState<Reel[]>([])
  const [loading,   setLoading]   = useState(true)
  const [activeIdx, setActiveIdx] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY  = useRef<number | null>(null)
  const isScrolling  = useRef(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get('/reels/', { params: { page_size: 20 } })
        const results = res.data?.results ?? res.data
        setReels(Array.isArray(results) && results.length > 0 ? results : MOCK_REELS)
      } catch {
        setReels(MOCK_REELS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const goTo   = useCallback((idx: number) => { if (reels && idx >= 0 && idx < reels.length) setActiveIdx(idx) }, [reels])
  const goNext = useCallback(() => goTo(activeIdx + 1), [activeIdx, goTo])
  const goPrev = useCallback(() => goTo(activeIdx - 1), [activeIdx, goTo])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev])

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY }
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchStartY.current === null || isScrolling.current) return
    const delta = touchStartY.current - e.changedTouches[0].clientY
    if (Math.abs(delta) > 50) { if (delta > 0) goNext(); else goPrev() }
    touchStartY.current = null
  }

  // Mouse wheel
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (isScrolling.current) return
    isScrolling.current = true
    if (e.deltaY > 0) goNext(); else goPrev()
    setTimeout(() => { isScrolling.current = false }, 800)
  }, [goNext, goPrev])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          <p className="text-white/60 text-sm">Loading reels…</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 overflow-hidden"
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <ProgressDots total={reels?.length ?? 0} current={activeIdx} />

      <div className="w-full h-full">
        <AnimatePresence mode="wait" initial={false}>
          {reels[activeIdx] && (
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, y: activeIdx > 0 ? '8%' : '-8%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full h-full"
            >
              <ReelSlide
                reel={reels[activeIdx]}
                isActive={true}
                onNext={goNext}
                onPrev={goPrev}
                isFirst={activeIdx === 0}
                isLast={activeIdx === (reels?.length ?? 1) - 1}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Swipe hint — fades out after 2.5s */}
      <motion.div
        initial={{ opacity: 1 }} animate={{ opacity: 0 }}
        transition={{ delay: 2.5, duration: 0.8 }}
        className="absolute bottom-24 inset-x-0 flex justify-center pointer-events-none z-30"
      >
        <div className="flex flex-col items-center gap-1.5 text-white/60">
          <ChevronUp size={16} className="animate-bounce" />
          <p className="text-xs">Swipe up for next</p>
        </div>
      </motion.div>

      {/* Reel counter */}
      <div className="absolute top-4 right-14 z-20">
        <span className="text-white/60 text-xs font-medium">
          {activeIdx + 1} / {reels?.length ?? 0}
        </span>
      </div>
    </div>
  )
}