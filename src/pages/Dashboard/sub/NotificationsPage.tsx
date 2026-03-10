// ============================================================
// ESTATE HUB — NOTIFICATIONS PAGE
// src/pages/Dashboard/sub/NotificationsPage.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Calendar, CreditCard, MessageSquare, CheckCircle2,
  Building2, Star, Users, Trash2, Check, Loader2,
} from 'lucide-react'
import api from '@/services/api'
import { timeAgo } from '@/utils/format'
import type { Notification } from '@/types'
import toast from 'react-hot-toast'

const ICON_MAP: Record<string, React.ElementType> = {
  booking_new:       Calendar,
  booking_confirmed: Calendar,
  booking_cancelled: Calendar,
  booking_completed: Calendar,
  booking_rejected:  Calendar,
  payment_held:      CreditCard,
  payment_released:  CreditCard,
  payment_disputed:  CreditCard,
  payment_refunded:  CreditCard,
  new_message:       MessageSquare,
  new_engagement:    Building2,
  property_verified: CheckCircle2,
  agency_verified:   CheckCircle2,
  new_follower:      Users,
  new_review:        Star,
  system:            Bell,
}

const COLOR_MAP: Record<string, string> = {
  booking_new:       'bg-swahili/10 text-swahili',
  booking_confirmed: 'bg-forest/10 text-forest',
  booking_cancelled: 'bg-error/10 text-error',
  booking_completed: 'bg-forest/10 text-forest',
  booking_rejected:  'bg-error/10 text-error',
  payment_held:      'bg-gold/10 text-gold-dark',
  payment_released:  'bg-forest/10 text-forest',
  payment_disputed:  'bg-error/10 text-error',
  payment_refunded:  'bg-ink-100 text-ink-500',
  new_message:       'bg-terra-50 text-terra',
  new_engagement:    'bg-swahili/10 text-swahili',
  property_verified: 'bg-forest/10 text-forest',
  agency_verified:   'bg-forest/10 text-forest',
  new_follower:      'bg-terra-50 text-terra',
  new_review:        'bg-gold/10 text-gold-dark',
  system:            'bg-sand text-ink-500',
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1,  type: 'booking_confirmed', title: 'Booking Confirmed',       body: 'Knight Frank Kenya confirmed your viewing of Karen Villa on 15 Dec.',         is_read: false, link: '/dashboard/bookings', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 2,  type: 'new_message',       title: 'New Message',             body: 'James Mwangi sent you a message about Karen Villa 4BR.',                       is_read: false, link: '/dashboard/messages', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 3,  type: 'payment_held',      title: 'Escrow Payment Held',     body: 'Your payment of KES 68.5M for Karen Villa is now held in escrow.',             is_read: false, link: '/dashboard', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 4,  type: 'new_engagement',    title: 'Property Engaged',        body: 'A buyer just engaged Westlands Penthouse — Knight Frank Kenya was notified.',  is_read: true,  link: '/properties/51', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 5,  type: 'new_follower',      title: 'New Follower',            body: 'David Kimani started following your agency.',                                  is_read: true,  link: '/dashboard', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 6,  type: 'property_verified', title: 'Property Verified',       body: 'Your listing "Kilimani 3BR" has been verified by the Estate Hub team.',       is_read: true,  link: '/properties/52', created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 7,  type: 'new_review',        title: 'New Review',              body: 'Sarah Njoroge left a 5-star review for Knight Frank Kenya.',                   is_read: true,  link: '/agencies/1', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 8,  type: 'booking_completed', title: 'Viewing Completed',       body: 'Your viewing of Lavington Townhouse has been marked as completed.',            is_read: true,  link: '/dashboard/bookings', created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 9,  type: 'system',            title: 'Welcome to Estate Hub!',  body: 'Your account is set up. Start browsing properties or list your first one.',   is_read: true,  link: '/properties', created_at: new Date(Date.now() - 14 * 86400000).toISOString() },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<'all' | 'unread'>('all')
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get('/notifications/')
        setNotifications(res.data.results ?? [])
      } catch {
        setNotifications(MOCK_NOTIFICATIONS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const markRead = async (id: number) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
    try { await api.post(`/notifications/${id}/read/`) } catch { /* optimistic */ }
  }

  const markAllRead = async () => {
    setMarkingAll(true)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    try { await api.post('/notifications/read-all/') } catch { /* optimistic */ }
    toast.success('All notifications marked as read')
    setMarkingAll(false)
  }

  const deleteNotification = async (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    try { await api.delete(`/notifications/${id}/delete/`) } catch { /* optimistic */ }
  }

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications
  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="py-4 px-0 sm:px-2 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-terra text-white text-xs font-bold rounded-full">{unreadCount}</span>
            )}
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">{notifications.length} total</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} disabled={markingAll}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-sandDark text-sm font-semibold text-ink-700 rounded-xl hover:border-terra/40 hover:text-terra transition-all disabled:opacity-60">
            {markingAll ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-white border border-sandDark rounded-xl p-1 w-fit">
        {(['all', 'unread'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
              filter === f ? 'bg-terra text-white shadow-terra' : 'text-ink-500 hover:bg-sand hover:text-ink-900'
            }`}
          >
            {f} {f === 'unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-terra-50 flex items-center justify-center mb-4">
            <Bell size={26} className="text-terra/50" />
          </div>
          <p className="font-semibold text-ink-900 mb-1">
            {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
          </p>
          <p className="text-xs text-ink-500 max-w-xs">
            {filter === 'unread' ? 'You have no unread notifications.' : 'Notifications about your bookings, messages and more will appear here.'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((n, i) => {
              const Icon  = ICON_MAP[n.type] ?? Bell
              const color = COLOR_MAP[n.type] ?? 'bg-sand text-ink-500'
              return (
                <motion.div key={n.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`group flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                    n.is_read ? 'bg-white border-sandDark' : 'bg-terra-50/50 border-terra/20'
                  }`}
                  onClick={() => { if (!n.is_read) markRead(n.id) }}
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon size={16} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${n.is_read ? 'font-medium text-ink-700' : 'font-bold text-ink-900'}`}>
                        {n.title}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {!n.is_read && <div className="w-2 h-2 rounded-full bg-terra flex-shrink-0" />}
                        <button onClick={(e) => { e.stopPropagation(); deleteNotification(n.id) }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-error/10 hover:text-error text-ink-400 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">{n.body}</p>
                    <p className="text-[10px] text-ink-400 mt-1.5">{timeAgo(n.created_at)}</p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}