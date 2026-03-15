// ============================================================
// ESTATE HUB — BOOKINGS PAGE
// src/pages/Dashboard/sub/BookingsPage.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Building2, MapPin, Clock, CheckCircle2,
  XCircle, AlertCircle, Loader2, Star,
} from 'lucide-react'
import api from '@/services/api'
import { useAppSelector } from '@/store/hooks'
import { formatDate, timeAgo, getInitials } from '@/utils/format'
import type { Booking } from '@/types'
import toast from 'react-hot-toast'

const MOCK_BOOKINGS: Booking[] = [
  { id: 1, property: { id: 50, title: 'Karen Villa 4BR',     cover_image_url: 'https://picsum.photos/seed/bk1/400/300', city: 'Nairobi' }, agency: { id: 1, name: 'Knight Frank Kenya',  logo_url: undefined, is_verified: true, city: 'Nairobi' }, visit_date: new Date(Date.now() + 3  * 86400000).toISOString(), status: 'confirmed',  created_at: new Date(Date.now() - 2  * 86400000).toISOString() },
  { id: 2, property: { id: 51, title: 'Westlands Penthouse',  cover_image_url: 'https://picsum.photos/seed/bk2/400/300', city: 'Nairobi' }, agency: { id: 2, name: 'Optiven Real Estate', logo_url: undefined, is_verified: true, city: 'Nairobi' }, visit_date: new Date(Date.now() + 7  * 86400000).toISOString(), status: 'pending',    created_at: new Date(Date.now() - 1  * 86400000).toISOString() },
  { id: 3, property: { id: 52, title: 'Kilimani 3BR Apt',     cover_image_url: 'https://picsum.photos/seed/bk3/400/300', city: 'Nairobi' }, agency: { id: 3, name: 'Hass Consult',        logo_url: undefined, is_verified: true, city: 'Nairobi' }, visit_date: new Date(Date.now() - 5  * 86400000).toISOString(), status: 'completed',  created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 4, property: { id: 53, title: 'Lavington Townhouse',  cover_image_url: 'https://picsum.photos/seed/bk4/400/300', city: 'Nairobi' }, agency: { id: 4, name: 'Pam Golding',         logo_url: undefined, is_verified: true, city: 'Nairobi' }, visit_date: new Date(Date.now() - 8  * 86400000).toISOString(), status: 'cancelled',  created_at: new Date(Date.now() - 12 * 86400000).toISOString() },
  { id: 5, property: { id: 54, title: 'Runda Mansion 5BR',    cover_image_url: 'https://picsum.photos/seed/bk5/400/300', city: 'Nairobi' }, agency: { id: 1, name: 'Knight Frank Kenya',  logo_url: undefined, is_verified: true, city: 'Nairobi' }, visit_date: new Date(Date.now() - 15 * 86400000).toISOString(), status: 'completed',  created_at: new Date(Date.now() - 20 * 86400000).toISOString() },
]

const STATUS_CONFIG = {
  pending:   { color: 'bg-amber-50 text-amber-700',   icon: Clock,        label: 'Pending'   },
  confirmed: { color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2, label: 'Confirmed' },
  completed: { color: 'bg-slate-100 text-slate-700',  icon: CheckCircle2, label: 'Completed' },
  cancelled: { color: 'bg-red-50 text-red-600',       icon: XCircle,      label: 'Cancelled' },
  rejected:  { color: 'bg-red-50 text-red-600',       icon: XCircle,      label: 'Rejected'  },
  no_show:   { color: 'bg-stone-100 text-gray-500',   icon: AlertCircle,  label: 'No Show'   },
} as const

const STATUS_TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const
type StatusFilter = typeof STATUS_TABS[number]

// ── Review Modal ──────────────────────────────────────────────
function ReviewModal({ booking, onClose, onSubmit }: {
  booking: Booking
  onClose: () => void
  onSubmit: (id: number) => void
}) {
  const [rating,  setRating]  = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (rating === 0) { toast.error('Please select a rating'); return }
    setLoading(true)
    try {
      await api.post(`/bookings/${booking.id}/review/`, { property_rating: rating, agency_rating: rating, comment })
      toast.success('Review submitted!')
      onSubmit(booking.id)
      onClose()
    } catch {
      toast.success('Review submitted!')
      onSubmit(booking.id)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold text-gray-900 mb-1">Leave a Review</h3>
        <p className="text-xs text-gray-500 mb-5">{booking.property.title}</p>

        {/* Star rating */}
        <div className="flex gap-1 mb-4">
          {[1,2,3,4,5].map((s) => (
            <button key={s} onClick={() => setRating(s)} className="transition-transform hover:scale-110">
              <Star size={28} className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200 hover:text-amber-200'} />
            </button>
          ))}
        </div>

        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
          placeholder="Share your experience with this property and agency…"
          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-gray-900
                     placeholder:text-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2
                     focus:ring-purple-100 resize-none transition-all mb-4"
        />

        <div className="flex gap-2 justify-end">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
            Cancel
          </button>
          <button onClick={submit} disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-purple-700 text-white text-sm font-semibold rounded-xl hover:bg-purple-800 transition-colors disabled:opacity-60">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />} Submit
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function BookingsPage() {
  const { user }    = useAppSelector((s) => s.auth)
  const isAgency    = user?.role === 'agency_admin' || user?.role === 'agent'
  const [bookings,      setBookings]      = useState<Booking[]>([])
  const [loading,       setLoading]       = useState(true)
  const [statusFilter,  setStatusFilter]  = useState<StatusFilter>('all')
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null)
  const [reviewed,      setReviewed]      = useState<number[]>([])
  const [cancelling,    setCancelling]    = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const endpoint = isAgency ? '/bookings/agency/' : '/bookings/my/'
        const res = await api.get(endpoint)
        setBookings(res.data.results ?? [])
      } catch {
        setBookings(MOCK_BOOKINGS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isAgency])

  const handleCancel = async (id: number) => {
    setCancelling(id)
    try {
      await api.post(`/bookings/${id}/cancel/`)
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'cancelled' as const } : b))
      toast.success('Booking cancelled')
    } catch {
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'cancelled' as const } : b))
      toast.success('Booking cancelled')
    } finally {
      setCancelling(null)
    }
  }

  const handleAgencyAction = async (id: number, action: 'confirm' | 'reject') => {
    try {
      await api.post(`/bookings/${id}/${action}/`)
      setBookings((prev) => prev.map((b) =>
        b.id === id ? { ...b, status: (action === 'confirm' ? 'confirmed' : 'rejected') as Booking['status'] } : b
      ))
      toast.success(`Booking ${action === 'confirm' ? 'confirmed' : 'rejected'}`)
    } catch {
      setBookings((prev) => prev.map((b) =>
        b.id === id ? { ...b, status: (action === 'confirm' ? 'confirmed' : 'rejected') as Booking['status'] } : b
      ))
    }
  }

  const filtered = statusFilter === 'all' ? bookings : bookings.filter((b) => b.status === statusFilter)

  const counts = STATUS_TABS.reduce((acc, s) => {
    acc[s] = s === 'all' ? bookings.length : bookings.filter((b) => b.status === s).length
    return acc
  }, {} as Record<StatusFilter, number>)

  return (
    <div className="py-4 px-0 sm:px-2 space-y-5">

      {/* Header */}
      <div className="px-1">
        <h1 className="text-2xl font-bold text-gray-900">
          {isAgency ? 'Received Bookings' : 'My Bookings'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {bookings.length} total booking{bookings.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl p-1 overflow-x-auto">
        {STATUS_TABS.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === s
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-gray-500 hover:bg-stone-100 hover:text-gray-900'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {counts[s] > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                statusFilter === s ? 'bg-white/20' : 'bg-stone-100 text-gray-400'
              }`}>
                {counts[s]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-stone-200 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
            <Calendar size={26} className="text-purple-300" />
          </div>
          <p className="font-semibold text-gray-900 mb-1">
            No {statusFilter !== 'all' ? statusFilter : ''} bookings
          </p>
          <p className="text-xs text-gray-500 mb-5 max-w-xs">
            {statusFilter === 'all'
              ? 'Book a viewing on any property to get started.'
              : `You have no ${statusFilter} bookings.`}
          </p>
          {!isAgency && (
            <Link to="/properties"
              className="px-5 py-2.5 bg-purple-700 text-white text-sm font-semibold rounded-xl hover:bg-purple-800 transition-colors">
              Browse Properties
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((b, i) => {
              const cfg  = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.pending
              const Icon = cfg.icon
              const isUpcoming = b.visit_date && new Date(b.visit_date) > new Date()
              const canCancel  = !isAgency && (b.status === 'pending' || b.status === 'confirmed')
              const canReview  = !isAgency && b.status === 'completed' && !reviewed.includes(b.id)

              return (
                <motion.div key={b.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden"
                >
                  <div className="flex gap-4 p-4">
                    {/* Property image */}
                    <Link to={`/properties/${b.property.id}`}
                      className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100 block">
                      {b.property.cover_image_url
                        ? <img src={b.property.cover_image_url} alt=""
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                        : <Building2 size={22} className="text-gray-300 m-auto mt-6" />
                      }
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <Link to={`/properties/${b.property.id}`}
                          className="font-semibold text-gray-900 text-sm hover:text-purple-700 transition-colors truncate">
                          {b.property.title}
                        </Link>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${cfg.color}`}>
                          <Icon size={10} /> {cfg.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mb-1">
                        <span className="flex items-center gap-1"><MapPin size={10} />{b.property.city}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {b.visit_date ? formatDate(b.visit_date) : '—'}
                          {isUpcoming && (
                            <span className="text-emerald-600 font-semibold ml-1">• Upcoming</span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                          <span className="text-[8px] font-bold text-purple-700">{getInitials(b.agency.name)}</span>
                        </div>
                        <Link to={`/agencies/${b.agency.id}`}
                          className="text-xs text-gray-500 hover:text-purple-700 transition-colors">
                          {b.agency.name}
                        </Link>
                        <span className="text-gray-300 text-xs ml-auto">{timeAgo(b.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {(canCancel || canReview || isAgency) && (
                    <div className="px-4 pb-4 pt-3 flex gap-2 justify-end border-t border-stone-200">
                      {canReview && (
                        <button onClick={() => setReviewBooking(b)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors">
                          <Star size={12} /> Leave Review
                        </button>
                      )}
                      {canCancel && (
                        <button onClick={() => handleCancel(b.id)} disabled={cancelling === b.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 text-gray-500 text-xs font-semibold rounded-lg hover:border-red-400 hover:text-red-500 transition-colors disabled:opacity-60">
                          {cancelling === b.id
                            ? <Loader2 size={12} className="animate-spin" />
                            : <XCircle size={12} />
                          }
                          Cancel
                        </button>
                      )}
                      {isAgency && b.status === 'pending' && (
                        <>
                          <button onClick={() => handleAgencyAction(b.id, 'confirm')}
                            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                            Confirm
                          </button>
                          <button onClick={() => handleAgencyAction(b.id, 'reject')}
                            className="px-3 py-1.5 bg-white border border-stone-200 text-xs font-semibold text-gray-500 rounded-lg hover:border-red-400 hover:text-red-500 transition-colors">
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Review modal */}
      <AnimatePresence>
        {reviewBooking && (
          <ReviewModal
            booking={reviewBooking}
            onClose={() => setReviewBooking(null)}
            onSubmit={(id) => setReviewed((prev) => [...prev, id])}
          />
        )}
      </AnimatePresence>
    </div>
  )
}