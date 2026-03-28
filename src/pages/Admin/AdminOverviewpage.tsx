// ============================================================
// ESTATE HUB — ADMIN OVERVIEW PAGE
// src/pages/Admin/AdminOverviewPage.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Eye, Zap, Users, Building2, Calendar,
  CreditCard, ArrowUpRight, ArrowDownRight, ChevronRight,
  Clock, CheckCircle2, AlertCircle,
} from 'lucide-react'
import api from '@/services/api'
import { formatCount, formatCurrency, timeAgo, formatDate } from '@/utils/format'
import type { AgencyAnalytics, Booking, PaymentTransaction } from '@/types'

// ── Mock ─────────────────────────────────────────────────────
const MOCK: AgencyAnalytics = {
  total_views: 14820, total_likes: 892, total_leads: 234,
  total_listings: 48, follower_count: 4820,
  views_chart: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6-i)*86400000).toLocaleDateString('en-GB',{day:'2-digit',month:'short'}),
    views: Math.floor(Math.random()*800)+400,
  })),
  leads_chart: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6-i)*86400000).toLocaleDateString('en-GB',{day:'2-digit',month:'short'}),
    leads: Math.floor(Math.random()*30)+10,
  })),
  top_listings: [],
}

const MOCK_BOOKINGS: Booking[] = [
  { id:1, property:{id:1,title:'Karen Villa 4BR',cover_image_url:'https://picsum.photos/seed/ob1/60/60',city:'Nairobi'}, agency:{id:1,name:'KF',logo_url:undefined,is_verified:true,city:'Nairobi'}, visit_date: new Date(Date.now()+2*86400000).toISOString(), status:'pending',   created_at: new Date(Date.now()-3600000).toISOString() },
  { id:2, property:{id:2,title:'Westlands Penthouse',cover_image_url:'https://picsum.photos/seed/ob2/60/60',city:'Nairobi'}, agency:{id:1,name:'KF',logo_url:undefined,is_verified:true,city:'Nairobi'}, visit_date: new Date(Date.now()+4*86400000).toISOString(), status:'confirmed', created_at: new Date(Date.now()-7200000).toISOString() },
  { id:3, property:{id:3,title:'Kilimani 3BR',cover_image_url:'https://picsum.photos/seed/ob3/60/60',city:'Nairobi'}, agency:{id:1,name:'KF',logo_url:undefined,is_verified:true,city:'Nairobi'}, visit_date: new Date(Date.now()+6*86400000).toISOString(), status:'pending',   created_at: new Date(Date.now()-10800000).toISOString() },
]

const MOCK_TXS: PaymentTransaction[] = [
  { id:1, property:{id:1,title:'Karen Villa 4BR'}, amount:68500000, currency:'KES', status:'held',      reference:'TXN-001', created_at: new Date(Date.now()-86400000).toISOString() },
  { id:2, property:{id:2,title:'Westlands Penthouse'}, amount:250000, currency:'KES', status:'released', reference:'TXN-002', created_at: new Date(Date.now()-2*86400000).toISOString() },
]

// ── Mini sparkline ────────────────────────────────────────────
function Sparkline({ data, color='#C17D3C' }: { data: number[]; color?: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 80, h = 32
  const pts = data.map((v,i) => `${(i/(data.length-1))*w},${h-((v-min)/range)*(h-4)-2}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── KPI card ─────────────────────────────────────────────────
function KpiCard({ icon:Icon, label, value, trend, sparkData, color='text-terra', bg='bg-terra-50', link }: {
  icon: React.ElementType; label: string; value: string|number
  trend?: number; sparkData?: number[]; color?: string; bg?: string; link?: string
}) {
  const card = (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
      className="bg-white rounded-2xl border border-sandDark p-5 hover:border-terra/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon size={17} className={color} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend>=0?'text-forest':'text-error'}`}>
            {trend>=0 ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>}{Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-ink-900 font-display">{value}</p>
      <div className="flex items-end justify-between mt-0.5">
        <p className="text-xs text-ink-500">{label}</p>
        {sparkData && <Sparkline data={sparkData} />}
      </div>
    </motion.div>
  )
  return link ? <Link to={link}>{card}</Link> : card
}

// ── Booking status badge ──────────────────────────────────────
function StatusBadge({ status }: { status: Booking['status'] }) {
  const cfg = {
    pending:   { cls:'bg-gold/10 text-gold-dark',  icon:Clock        },
    confirmed: { cls:'bg-forest/10 text-forest',   icon:CheckCircle2 },
    completed: { cls:'bg-swahili/10 text-swahili', icon:CheckCircle2 },
    cancelled: { cls:'bg-error/10 text-error',     icon:AlertCircle  },
    rejected:  { cls:'bg-error/10 text-error',     icon:AlertCircle  },
    no_show:   { cls:'bg-sand text-ink-500',       icon:AlertCircle  },
  }[status] ?? { cls:'bg-sand text-ink-500', icon:Clock }
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
      <Icon size={10}/>{status.charAt(0).toUpperCase()+status.slice(1)}
    </span>
  )
}

export default function AdminOverviewPage() {
  const [analytics, setAnalytics] = useState<AgencyAnalytics|null>(null)
  const [bookings,  setBookings]  = useState<Booking[]>([])
  const [txs,       setTxs]       = useState<PaymentTransaction[]>([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [ar,br,tr] = await Promise.all([
          api.get<AgencyAnalytics>('/analytics/agency/'),
          api.get('/bookings/agency/?page_size=5&ordering=-created_at'),
          api.get('/payments/escrow/agency/?page_size=5&ordering=-created_at'),
        ])
        setAnalytics(ar.data)
        setBookings(br.data.results ?? [])
        setTxs(tr.data.results ?? [])
      } catch {
        setAnalytics(MOCK)
        setBookings(MOCK_BOOKINGS)
        setTxs(MOCK_TXS)
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const a = analytics ?? MOCK

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Overview</h1>
        <p className="text-sm text-ink-500 mt-0.5">Your agency at a glance</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Eye}       label="Total views"    value={formatCount(a.total_views)}    trend={14} sparkData={a.views_chart.map(d=>d.views)} link="/admin/analytics" />
        <KpiCard icon={Zap}       label="Total leads"    value={formatCount(a.total_leads)}    trend={8}  sparkData={a.leads_chart.map(d=>d.leads)} color="text-swahili" bg="bg-swahili/10" link="/admin/analytics" />
        <KpiCard icon={Building2} label="Active listings" value={a.total_listings}             trend={3}  color="text-forest"    bg="bg-forest/10"  link="/admin/properties" />
        <KpiCard icon={Users}     label="Followers"      value={formatCount(a.follower_count)} trend={22} color="text-gold-dark" bg="bg-gold/10"     link="/admin/agency" />
      </div>

      {/* Recent bookings + Recent payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent bookings */}
        <div className="bg-white rounded-2xl border border-sandDark p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-ink-900 flex items-center gap-2">
              <Calendar size={15} className="text-terra"/> Recent Bookings
            </h2>
            <Link to="/admin/bookings" className="text-xs text-terra font-semibold hover:text-terra-600 flex items-center gap-0.5">
              View all <ChevronRight size={12}/>
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="skeleton h-14 rounded-xl"/>)}</div>
          ) : (
            <div className="space-y-2">
              {bookings.map((b,i) => (
                <motion.div key={b.id} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{delay:i*.05}}
                  className="flex items-center gap-3 p-3 bg-sand rounded-xl">
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-sandDark">
                    {b.property.cover_image_url
                      ? <img src={b.property.cover_image_url} alt="" className="w-full h-full object-cover"/>
                      : <Building2 size={14} className="text-ink-300 m-auto mt-3"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900 truncate">{b.property.title}</p>
                    <p className="text-xs text-ink-400 flex items-center gap-1">
                      <Clock size={10}/>{b.visit_date ? formatDate(b.visit_date) : '—'}
                    </p>
                  </div>
                  <StatusBadge status={b.status}/>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recent payments */}
        <div className="bg-white rounded-2xl border border-sandDark p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-ink-900 flex items-center gap-2">
              <CreditCard size={15} className="text-terra"/> Escrow Transactions
            </h2>
            <Link to="/admin/payments" className="text-xs text-terra font-semibold hover:text-terra-600 flex items-center gap-0.5">
              View all <ChevronRight size={12}/>
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2].map(i=><div key={i} className="skeleton h-14 rounded-xl"/>)}</div>
          ) : (
            <div className="space-y-2">
              {txs.map((tx,i) => (
                <motion.div key={tx.id} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{delay:i*.05}}
                  className="flex items-center gap-3 p-3 bg-sand rounded-xl">
                  <div className="w-9 h-9 rounded-xl bg-terra-50 flex items-center justify-center flex-shrink-0">
                    <CreditCard size={15} className="text-terra"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900 truncate">{tx.property.title}</p>
                    <p className="text-xs text-ink-400">{tx.reference} · {timeAgo(tx.created_at)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-ink-900">{formatCurrency(tx.amount,'KES')}</p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      tx.status==='released' ? 'bg-forest/10 text-forest' :
                      tx.status==='held'     ? 'bg-gold/10 text-gold-dark' :
                      tx.status==='disputed' ? 'bg-error/10 text-error' :
                      'bg-sand text-ink-500'
                    }`}>{tx.status}</span>
                  </div>
                </motion.div>
              ))}
              {txs.length === 0 && <p className="text-sm text-ink-400 text-center py-6">No transactions yet</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}