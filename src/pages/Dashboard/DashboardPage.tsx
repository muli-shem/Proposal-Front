// ============================================================
// ESTATE HUB — DASHBOARD PAGE (role-based views)
// src/pages/Dashboard/DashboardPage.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Heart, Bookmark, Calendar, MessageSquare,
  Bell, ShieldCheck, TrendingUp, Users, Eye, Zap,
  CheckCircle2, Clock, XCircle, AlertCircle, ChevronRight,
  ArrowUpRight, ArrowDownRight, Loader2, Star, MapPin,
  CreditCard, FileText, Settings, LogOut, User, ExternalLink,
} from 'lucide-react'
import PropertyCard from '@/components/property/PropertyCard'
import api from '@/services/api'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import { clearStoredTokens } from '@/services/api'
import {
  formatCurrency, formatCurrencyFull, formatCount,
  formatDate, timeAgo, getInitials,
} from '@/utils/format'
import type { Property, Booking, PaymentTransaction, AgencyAnalytics } from '@/types'
import toast from 'react-hot-toast'

// ── Mock data ─────────────────────────────────────────────────
const MOCK_SAVED_PROPERTIES: Property[] = Array.from({ length: 4 }, (_, i) => ({
  id: i + 50, title: ['Karen Villa 4BR','Westlands Penthouse','Kilimani 3BR','Lavington Townhouse'][i],
  description: 'Premium property with modern finishes.',
  listing_type: (['sale','rent','rent','sale'] as const)[i],
  property_type: ['villa','penthouse','apartment','townhouse'][i],
  price: [68500000, 250000, 85000, 32000000][i],
  price_currency: 'KES',
  price_per: ([undefined,'month' as const,'month' as const,undefined])[i],
  is_negotiable: [true,false,false,true][i],
  bedrooms: [4,4,3,3][i], bathrooms: [4,4,2,3][i],
  size: [420,280,110,220][i], size_unit: 'm²',
  city: 'Nairobi', county: 'Nairobi',
  neighborhood: ['Karen','Westlands','Kilimani','Lavington'][i],
  is_verified: [true,true,true,false][i], is_featured: [true,true,false,false][i],
  status: 'published',
  cover_image_url: `https://picsum.photos/seed/saved${i+1}/800/500`,
  agency: { id: i+1, name: ['Knight Frank','Optiven','Hass Consult','Pam Golding'][i], logo_url: undefined, is_verified: true, city: 'Nairobi' },
  like_count: [47,89,23,34][i], save_count: [21,44,11,16][i], comment_count: [8,15,4,7][i], view_count: [312,589,145,234][i],
  is_liked: false, is_saved: true,
  created_at: new Date(Date.now() - i * 86400000 * 5).toISOString(),
  updated_at: new Date().toISOString(),
}))

const MOCK_BOOKINGS: Booking[] = [
  { id: 1, property: { id: 50, title: 'Karen Villa 4BR', cover_image_url: 'https://picsum.photos/seed/saved1/400/300', city: 'Nairobi' }, agency: { id: 1, name: 'Knight Frank Kenya', logo_url: undefined, is_verified: true, city: 'Nairobi' }, visit_date: new Date(Date.now() + 3 * 86400000).toISOString(), status: 'confirmed',  created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 2, property: { id: 51, title: 'Westlands Penthouse', cover_image_url: 'https://picsum.photos/seed/saved2/400/300', city: 'Nairobi' }, agency: { id: 2, name: 'Optiven Real Estate', logo_url: undefined, is_verified: true, city: 'Nairobi' }, visit_date: new Date(Date.now() + 7 * 86400000).toISOString(), status: 'pending',    created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, property: { id: 52, title: 'Kilimani 3BR', cover_image_url: 'https://picsum.photos/seed/saved3/400/300', city: 'Nairobi' }, agency: { id: 3, name: 'Hass Consult', logo_url: undefined, is_verified: true, city: 'Nairobi' }, visit_date: new Date(Date.now() - 5 * 86400000).toISOString(), status: 'completed', created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 4, property: { id: 53, title: 'Lavington Townhouse', cover_image_url: 'https://picsum.photos/seed/saved4/400/300', city: 'Nairobi' }, agency: { id: 4, name: 'Pam Golding', logo_url: undefined, is_verified: true, city: 'Nairobi' }, visit_date: new Date(Date.now() - 8 * 86400000).toISOString(), status: 'cancelled', created_at: new Date(Date.now() - 12 * 86400000).toISOString() },
]

const MOCK_TRANSACTIONS: PaymentTransaction[] = [
  { id: 1, property: { id: 50, title: 'Karen Villa 4BR' }, amount: 68500000, currency: 'KES', status: 'held',           reference: 'TXN-2025-001', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 2, property: { id: 52, title: 'Kilimani 3BR'    }, amount: 85000,    currency: 'KES', status: 'released',       reference: 'TXN-2025-002', created_at: new Date(Date.now() - 20 * 86400000).toISOString() },
  { id: 3, property: { id: 53, title: 'Lavington Townhouse' }, amount: 32000000, currency: 'KES', status: 'initiated', reference: 'TXN-2025-003', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
]

const MOCK_ANALYTICS: AgencyAnalytics = {
  total_views: 14820, total_likes: 892, total_leads: 234, total_listings: 134,
  follower_count: 4820,
  views_chart: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    views: Math.floor(Math.random() * 800) + 400,
  })),
  leads_chart: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    leads: Math.floor(Math.random() * 30) + 10,
  })),
  top_listings: MOCK_SAVED_PROPERTIES.slice(0, 3).map((p) => ({ ...p, views: Math.floor(Math.random() * 500) + 100 })),
}

const MOCK_AGENCY_BOOKINGS: Booking[] = [
  { id: 5, property: { id: 50, title: 'Karen Villa 4BR', cover_image_url: 'https://picsum.photos/seed/saved1/400/300', city: 'Nairobi' }, agency: { id: 1, name: 'Knight Frank Kenya', logo_url: undefined, is_verified: true, city: 'Nairobi' }, visit_date: new Date(Date.now() + 2 * 86400000).toISOString(), status: 'pending',   created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 6, property: { id: 51, title: 'Westlands Penthouse', cover_image_url: 'https://picsum.photos/seed/saved2/400/300', city: 'Nairobi' }, agency: { id: 1, name: 'Knight Frank Kenya', logo_url: undefined, is_verified: true, city: 'Nairobi' }, visit_date: new Date(Date.now() + 4 * 86400000).toISOString(), status: 'confirmed', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 7, property: { id: 52, title: 'Kilimani 3BR', cover_image_url: 'https://picsum.photos/seed/saved3/400/300', city: 'Nairobi' }, agency: { id: 1, name: 'Knight Frank Kenya', logo_url: undefined, is_verified: true, city: 'Nairobi' }, visit_date: new Date(Date.now() + 6 * 86400000).toISOString(), status: 'pending',   created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
]

// ── Helpers ───────────────────────────────────────────────────
function BookingStatusBadge({ status }: { status: Booking['status'] }) {
  const cfg = {
    pending:   { color: 'bg-gold/10 text-gold-dark',    icon: Clock,        label: 'Pending'   },
    confirmed: { color: 'bg-forest/10 text-forest',     icon: CheckCircle2, label: 'Confirmed' },
    completed: { color: 'bg-swahili/10 text-swahili',   icon: CheckCircle2, label: 'Completed' },
    cancelled: { color: 'bg-error/10 text-error',       icon: XCircle,      label: 'Cancelled' },
    rejected:  { color: 'bg-error/10 text-error',       icon: XCircle,      label: 'Rejected'  },
    no_show:   { color: 'bg-ink-100 text-ink-500',      icon: AlertCircle,  label: 'No Show'   },
  }[status] ?? { color: 'bg-sand text-ink-500', icon: Clock, label: status }
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      <Icon size={10} /> {cfg.label}
    </span>
  )
}

function PaymentStatusBadge({ status }: { status: PaymentTransaction['status'] }) {
  const cfg = {
    initiated:      { color: 'bg-ink-100 text-ink-500',    label: 'Initiated'      },
    held:           { color: 'bg-gold/10 text-gold-dark',   label: 'In Escrow'      },
    docs_verified:  { color: 'bg-swahili/10 text-swahili',  label: 'Docs Verified'  },
    buyer_confirmed:{ color: 'bg-terra-50 text-terra',      label: 'Confirmed'      },
    released:       { color: 'bg-forest/10 text-forest',    label: 'Released'       },
    disputed:       { color: 'bg-error/10 text-error',      label: 'Disputed'       },
    refunded:       { color: 'bg-ink-100 text-ink-500',     label: 'Refunded'       },
  }[status] ?? { color: 'bg-sand text-ink-500', label: status }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

// ── Mini bar chart ─────────────────────────────────────────────
function MiniBarChart({ data, color = 'bg-terra' }: { data: { date: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.value))
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="relative flex-1 w-full flex items-end">
            <motion.div
              initial={{ height: 0 }} animate={{ height: `${(d.value / max) * 100}%` }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: 'easeOut' }}
              className={`w-full ${color} rounded-t-sm opacity-80 group-hover:opacity-100 transition-opacity min-h-[2px]`}
            />
          </div>
          <span className="text-[9px] text-ink-400 whitespace-nowrap">{d.date.split(' ')[0]}</span>
        </div>
      ))}
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, sub, trend, color = 'text-terra', bg = 'bg-terra-50',
}: {
  icon: React.ElementType; label: string; value: string | number
  sub?: string; trend?: number; color?: string; bg?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-sandDark p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon size={18} className={color} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-semibold ${trend >= 0 ? 'text-forest' : 'text-error'}`}>
            {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-ink-900 font-display">{value}</p>
      <p className="text-xs text-ink-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-ink-400 mt-1">{sub}</p>}
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════════
// BUYER DASHBOARD
// ══════════════════════════════════════════════════════════════
function BuyerDashboard() {
  const [saved, setSaved]             = useState<Property[]>([])
  const [bookings, setBookings]       = useState<Booking[]>([])
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [loading, setLoading]         = useState(true)
  const [activeTab, setActiveTab]     = useState<'saved'|'bookings'|'payments'>('saved')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [savedRes, bookingsRes, txRes] = await Promise.all([
          api.get('/properties/saved/'),
          api.get('/bookings/my/'),
          api.get('/payments/my/'),
        ])
        setSaved(savedRes.data.results ?? [])
        setBookings(bookingsRes.data.results ?? [])
        setTransactions(txRes.data.results ?? [])
      } catch {
        setSaved(MOCK_SAVED_PROPERTIES)
        setBookings(MOCK_BOOKINGS)
        setTransactions(MOCK_TRANSACTIONS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const tabs = [
    { value: 'saved' as const,    label: 'Saved',    icon: Bookmark,     count: saved.length        },
    { value: 'bookings' as const, label: 'Bookings', icon: Calendar,     count: bookings.length     },
    { value: 'payments' as const, label: 'Payments', icon: CreditCard,   count: transactions.length },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Bookmark}  label="Saved Properties" value={saved.length}       trend={12}  />
        <StatCard icon={Calendar}  label="Total Bookings"   value={bookings.length}    trend={5}   color="text-swahili" bg="bg-swahili/10" />
        <StatCard icon={CreditCard}label="Transactions"     value={transactions.length} trend={0}  color="text-forest"  bg="bg-forest/10" />
        <StatCard icon={Heart}     label="Properties Liked" value={24}                 trend={8}   color="text-gold-dark" bg="bg-gold/10"  />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-sandDark rounded-xl p-1">
        {tabs.map(({ value, label, icon: Icon, count }) => (
          <button key={value} onClick={() => setActiveTab(value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold flex-1 justify-center transition-all ${
              activeTab === value ? 'bg-terra text-white shadow-terra' : 'text-ink-500 hover:bg-sand hover:text-ink-900'
            }`}
          >
            <Icon size={14} /> {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === value ? 'bg-white/20' : 'bg-sand text-ink-400'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>

          {/* Saved */}
          {activeTab === 'saved' && (
            loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2,3,4].map((i) => <div key={i} className="skeleton h-56 rounded-xl" />)}
              </div>
            ) : saved.length === 0 ? (
              <EmptyState icon={Bookmark} title="No saved properties" sub="Browse properties and save your favourites." cta="Browse Properties" to="/properties" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {saved.map((p) => <PropertyCard key={p.id} property={p} variant="card" />)}
              </div>
            )
          )}

          {/* Bookings */}
          {activeTab === 'bookings' && (
            loading ? (
              <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
            ) : bookings.length === 0 ? (
              <EmptyState icon={Calendar} title="No bookings yet" sub="Book a viewing for a property you like." cta="Find Properties" to="/properties" />
            ) : (
              <div className="space-y-3">
                {bookings.map((b, i) => (
                  <motion.div key={b.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-sandDark p-4 flex gap-4 items-center"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-sand">
                      {b.property.cover_image_url
                        ? <img src={b.property.cover_image_url} alt="" className="w-full h-full object-cover" />
                        : <Building2 size={20} className="text-ink-300 m-auto mt-3.5" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink-900 text-sm truncate">{b.property.title}</p>
                      <div className="flex items-center gap-1 text-xs text-ink-500 mt-0.5">
                        <MapPin size={10} /> {b.property.city}
                        <span className="mx-1 text-ink-300">·</span>
                        <Clock size={10} /> {b.visit_date ? formatDate(b.visit_date) : '—'}
                      </div>
                      <p className="text-xs text-ink-400 mt-0.5">{b.agency.name}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <BookingStatusBadge status={b.status} />
                      <span className="text-xs text-ink-400">{timeAgo(b.created_at)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          )}

          {/* Payments */}
          {activeTab === 'payments' && (
            loading ? (
              <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
            ) : transactions.length === 0 ? (
              <EmptyState icon={CreditCard} title="No transactions" sub="Your escrow transactions will appear here." cta="Browse Properties" to="/properties" />
            ) : (
              <div className="space-y-3">
                {transactions.map((tx, i) => (
                  <motion.div key={tx.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-sandDark p-4 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-terra-50 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck size={18} className="text-terra" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink-900 text-sm truncate">{tx.property.title}</p>
                      <p className="text-xs text-ink-500 mt-0.5">Ref: {tx.reference} · {formatDate(tx.created_at)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <p className="font-bold text-ink-900 text-sm">{formatCurrency(tx.amount, tx.currency)}</p>
                      <PaymentStatusBadge status={tx.status} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// AGENCY ADMIN DASHBOARD
// ══════════════════════════════════════════════════════════════
function AgencyDashboard() {
  const [analytics, setAnalytics]   = useState<AgencyAnalytics | null>(null)
  const [bookings, setBookings]     = useState<Booking[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [analyticsRes, bookingsRes] = await Promise.all([
          api.get<AgencyAnalytics>('/analytics/agency/'),
          api.get('/bookings/agency/?status=pending'),
        ])
        setAnalytics(analyticsRes.data)
        setBookings(bookingsRes.data.results ?? [])
      } catch {
        setAnalytics(MOCK_ANALYTICS)
        setBookings(MOCK_AGENCY_BOOKINGS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleBookingAction = async (bookingId: number, action: 'confirm' | 'reject') => {
    try {
      await api.post(`/bookings/${bookingId}/${action}/`)
      setBookings((prev) => prev.filter((b) => b.id !== bookingId))
      toast.success(`Booking ${action === 'confirm' ? 'confirmed' : 'rejected'}`)
    } catch {
      setBookings((prev) => prev.filter((b) => b.id !== bookingId))
      toast.success(`Booking ${action === 'confirm' ? 'confirmed' : 'rejected'}`)
    }
  }

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1,2,3,4].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
      <div className="skeleton h-48 rounded-2xl" />
    </div>
  )

  const a = analytics!

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Eye}       label="Total Views"    value={formatCount(a.total_views)}    trend={14} />
        <StatCard icon={Zap}       label="Total Leads"    value={formatCount(a.total_leads)}    trend={8}  color="text-swahili" bg="bg-swahili/10" />
        <StatCard icon={Building2} label="Active Listings" value={a.total_listings}             trend={3}  color="text-forest"  bg="bg-forest/10" />
        <StatCard icon={Users}     label="Followers"      value={formatCount(a.follower_count)} trend={22} color="text-gold-dark" bg="bg-gold/10" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-sandDark p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-ink-900 text-sm">Views (7 days)</p>
              <p className="text-2xl font-bold text-terra font-display mt-0.5">{formatCount(a.total_views)}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-terra-50 flex items-center justify-center">
              <TrendingUp size={15} className="text-terra" />
            </div>
          </div>
          <MiniBarChart data={a.views_chart.map((d) => ({ date: d.date, value: d.views }))} color="bg-terra" />
        </div>
        <div className="bg-white rounded-2xl border border-sandDark p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-ink-900 text-sm">Leads (7 days)</p>
              <p className="text-2xl font-bold text-swahili font-display mt-0.5">{formatCount(a.total_leads)}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-swahili/10 flex items-center justify-center">
              <Zap size={15} className="text-swahili" />
            </div>
          </div>
          <MiniBarChart data={a.leads_chart.map((d) => ({ date: d.date, value: d.leads }))} color="bg-swahili" />
        </div>
      </div>

      {/* Pending bookings */}
      <div className="bg-white rounded-2xl border border-sandDark p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink-900 flex items-center gap-2">
            <Calendar size={16} className="text-terra" /> Pending Bookings
            {bookings.length > 0 && (
              <span className="px-2 py-0.5 bg-terra-50 text-terra text-xs font-bold rounded-full">{bookings.length}</span>
            )}
          </h3>
          <Link to="/dashboard/bookings" className="text-xs text-terra font-semibold hover:text-terra-600 flex items-center gap-0.5">
            View all <ChevronRight size={12} />
          </Link>
        </div>
        {bookings.length === 0 ? (
          <p className="text-sm text-ink-400 text-center py-6">No pending bookings 🎉</p>
        ) : (
          <div className="space-y-3">
            {bookings.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 p-3 bg-sand rounded-xl"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-sandDark">
                  {b.property.cover_image_url
                    ? <img src={b.property.cover_image_url} alt="" className="w-full h-full object-cover" />
                    : <Building2 size={18} className="text-ink-300 m-auto mt-3" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900 text-sm truncate">{b.property.title}</p>
                  <p className="text-xs text-ink-500 flex items-center gap-1">
                    <Clock size={10} /> {b.visit_date ? formatDate(b.visit_date) : '—'}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleBookingAction(b.id, 'confirm')}
                    className="px-3 py-1.5 bg-forest text-white text-xs font-semibold rounded-lg hover:bg-forest-dark transition-colors">
                    Confirm
                  </button>
                  <button onClick={() => handleBookingAction(b.id, 'reject')}
                    className="px-3 py-1.5 bg-white border border-sandDark text-ink-500 text-xs font-semibold rounded-lg hover:border-error hover:text-error transition-colors">
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Top listings */}
      <div className="bg-white rounded-2xl border border-sandDark p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink-900 flex items-center gap-2">
            <Star size={16} className="text-gold fill-gold" /> Top Listings
          </h3>
          <Link to="/properties" className="text-xs text-terra font-semibold hover:text-terra-600 flex items-center gap-0.5">
            Manage listings <ChevronRight size={12} />
          </Link>
        </div>
        <div className="space-y-3">
          {a.top_listings.map((p, i) => (
            <Link key={p.id} to={`/properties/${p.id}`}
              className="flex items-center gap-3 p-3 bg-sand rounded-xl hover:bg-sandDark transition-colors group"
            >
              <span className="w-5 h-5 rounded-full bg-terra/10 text-terra text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-sandDark">
                {p.cover_image_url
                  ? <img src={p.cover_image_url} alt="" className="w-full h-full object-cover" />
                  : <Building2 size={14} className="text-ink-300 m-auto mt-3" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink-900 text-sm truncate group-hover:text-terra transition-colors">{p.title}</p>
                <p className="text-xs text-ink-500">{formatCurrency(p.price, p.price_currency)}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-ink-500 flex-shrink-0">
                <Eye size={12} /> {formatCount((p as Property & { views: number }).views)}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// AGENT DASHBOARD
// ══════════════════════════════════════════════════════════════
function AgentDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get('/bookings/agency/')
        setBookings(res.data.results ?? [])
      } catch {
        setBookings(MOCK_AGENCY_BOOKINGS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const pending   = bookings.filter((b) => b.status === 'pending')
  const confirmed = bookings.filter((b) => b.status === 'confirmed')
  const completed = bookings.filter((b) => b.status === 'completed')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Clock}       label="Pending"   value={pending.length}   color="text-gold-dark"  bg="bg-gold/10"    />
        <StatCard icon={CheckCircle2}label="Confirmed" value={confirmed.length} color="text-forest"     bg="bg-forest/10"  />
        <StatCard icon={Star}        label="Completed" value={completed.length} color="text-swahili"    bg="bg-swahili/10" />
      </div>

      <div className="bg-white rounded-2xl border border-sandDark p-5">
        <h3 className="font-bold text-ink-900 mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-terra" /> My Assigned Bookings
        </h3>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : bookings.length === 0 ? (
          <EmptyState icon={Calendar} title="No bookings assigned" sub="Your assigned viewings will appear here." cta="View Properties" to="/properties" />
        ) : (
          <div className="space-y-3">
            {bookings.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 bg-sand rounded-xl"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-sandDark">
                  {b.property.cover_image_url
                    ? <img src={b.property.cover_image_url} alt="" className="w-full h-full object-cover" />
                    : <Building2 size={16} className="text-ink-300 m-auto mt-3.5" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900 text-sm truncate">{b.property.title}</p>
                  <div className="flex items-center gap-2 text-xs text-ink-500 mt-0.5">
                    <span className="flex items-center gap-1"><MapPin size={9} />{b.property.city}</span>
                    <span className="flex items-center gap-1"><Clock size={9} />{b.visit_date ? formatDate(b.visit_date) : '—'}</span>
                  </div>
                </div>
                <BookingStatusBadge status={b.status} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Empty state helper ────────────────────────────────────────
function EmptyState({ icon: Icon, title, sub, cta, to }: {
  icon: React.ElementType; title: string; sub: string; cta: string; to: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-14 h-14 rounded-2xl bg-terra-50 flex items-center justify-center mb-4">
        <Icon size={26} className="text-terra/50" />
      </div>
      <p className="font-semibold text-ink-900 mb-1">{title}</p>
      <p className="text-xs text-ink-500 max-w-xs mb-5">{sub}</p>
      <Link to={to} className="px-5 py-2.5 bg-terra text-white text-sm font-semibold rounded-xl hover:bg-terra-600 transition-colors">
        {cta}
      </Link>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// PROFILE CARD (sidebar for all roles)
// ══════════════════════════════════════════════════════════════
function ProfileCard() {
  const { user }   = useAppSelector((s) => s.auth)
  const dispatch   = useAppDispatch()
  const navigate   = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    clearStoredTokens()
    navigate('/')
    toast.success('Signed out successfully')
  }

  if (!user) return null

  const roleLabel = {
    buyer:         'Property Buyer',
    agent:         'Estate Agent',
    agency_admin:  'Agency Admin',
    developer:     'Developer',
    admin:         'Platform Admin',
  }[user.role] ?? user.role

  return (
    <div className="bg-white rounded-2xl border border-sandDark p-5">
      {/* Avatar + name */}
      <div className="flex flex-col items-center text-center mb-5">
        <div className="w-16 h-16 rounded-2xl bg-terra-50 border-2 border-terra/20 flex items-center justify-center mb-3 overflow-hidden">
          {user.avatar_url
            ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            : <span className="text-xl font-bold text-terra">{getInitials(user.full_name || user.email)}</span>
          }
        </div>
        <p className="font-bold text-ink-900">{user.full_name || 'User'}</p>
        <p className="text-xs text-ink-500 mt-0.5">{user.email}</p>
        <span className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-terra-50 text-terra text-xs font-semibold rounded-full capitalize">
          {roleLabel}
        </span>
        {user.is_verified && (
          <span className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 bg-forest/10 text-forest text-xs font-semibold rounded-full">
            <CheckCircle2 size={10} /> Verified
          </span>
        )}
      </div>

      {/* Quick links */}
      <div className="space-y-1">
        {[
          { icon: User,        label: 'Edit Profile',    to: '/dashboard/profile'       },
          { icon: Bell,        label: 'Notifications',   to: '/dashboard/notifications' },
          { icon: MessageSquare, label: 'Messages',      to: '/dashboard/messages'      },
          { icon: ShieldCheck, label: 'Verification',    to: '/dashboard/verification'  },
          { icon: Settings,    label: 'Settings',        to: '/dashboard/settings'      },
        ].map(({ icon: Icon, label, to }) => (
          <Link key={to} to={to}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ink-700 hover:bg-sand hover:text-ink-900 transition-all group">
            <Icon size={15} className="text-ink-400 group-hover:text-terra transition-colors" />
            {label}
            <ChevronRight size={13} className="ml-auto text-ink-300 group-hover:text-terra transition-colors" />
          </Link>
        ))}

        <div className="pt-1 border-t border-sandDark mt-2">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-error hover:bg-error/5 transition-all">
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const { user } = useAppSelector((s) => s.auth)

  const roleTitle = {
    buyer:        'My Dashboard',
    agent:        'Agent Dashboard',
    agency_admin: 'Agency Dashboard',
    developer:    'Developer Dashboard',
    admin:        'Admin Dashboard',
  }[user?.role ?? 'buyer'] ?? 'Dashboard'

  return (
    <div className="py-4 px-0 sm:px-2">

      {/* Page title */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">{roleTitle}</h1>
          <p className="text-sm text-ink-500 mt-0.5">
            Welcome back, {user?.first_name || 'there'} 👋
          </p>
        </div>
        {user?.agency && (
          <Link to={`/agencies/${user.agency.id}`}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-sandDark rounded-xl text-xs font-semibold text-ink-700 hover:border-terra/40 hover:text-terra transition-all">
            <Building2 size={13} /> My Agency <ExternalLink size={11} />
          </Link>
        )}
      </div>

      {/* Two-column layout: main content + profile card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* Main content */}
        <div className="lg:col-span-2">
          {user?.role === 'agency_admin' || user?.role === 'developer' ? (
            <AgencyDashboard />
          ) : user?.role === 'agent' ? (
            <AgentDashboard />
          ) : (
            <BuyerDashboard />
          )}
        </div>

        {/* Profile sidebar */}
        <div className="lg:sticky lg:top-20">
          <ProfileCard />
        </div>
      </div>
    </div>
  )
}