// ============================================================
// ESTATE HUB — ADMIN BOOKINGS PAGE
// src/pages/Admin/AdminBookingsPage.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Search, Download, X, Loader2, CheckCircle2,
  XCircle, Clock, AlertCircle, ChevronLeft, ChevronRight,
  Users
} from 'lucide-react'
import api from '@/services/api'
import { formatDate, timeAgo, getInitials } from '@/utils/format'
import type { Booking, AgentBasic } from '@/types'
import toast from 'react-hot-toast'

const STATUS_CFG = {
  pending:   { cls:'bg-gold/10 text-gold-dark',  icon:Clock,        label:'Pending'   },
  confirmed: { cls:'bg-forest/10 text-forest',   icon:CheckCircle2, label:'Confirmed' },
  completed: { cls:'bg-swahili/10 text-swahili', icon:CheckCircle2, label:'Completed' },
  cancelled: { cls:'bg-error/10 text-error',     icon:XCircle,      label:'Cancelled' },
  rejected:  { cls:'bg-error/10 text-error',     icon:XCircle,      label:'Rejected'  },
  no_show:   { cls:'bg-sand text-ink-500',       icon:AlertCircle,  label:'No Show'   },
} as const

const MOCK_BOOKINGS: Booking[] = Array.from({length:8},(_,i)=>({
  id:i+1,
  property:{id:i+1,title:['Karen Villa 4BR','Westlands Penthouse','Kilimani 3BR','Lavington TH','Runda Mansion','Upperhill Apt','Kileleshwa 2BR','Parklands Office'][i],cover_image_url:`https://picsum.photos/seed/bk${i+1}/60/60`,city:'Nairobi'},
  agency:{id:1,name:'Knight Frank Kenya',logo_url:undefined,is_verified:true,city:'Nairobi'},
  visit_date: new Date(Date.now()+(i-3)*86400000*2).toISOString(),
  status:(['pending','confirmed','pending','completed','cancelled','confirmed','pending','rejected'] as Booking['status'][])[i],
  created_at: new Date(Date.now()-i*86400000).toISOString(),
}))

const MOCK_AGENTS: AgentBasic[] = [
  {id:1,user:{id:10,full_name:'James Mwangi',avatar_url:undefined},title:'Senior Agent',is_active:true},
  {id:2,user:{id:11,full_name:'Aisha Omondi',avatar_url:undefined},title:'Leasing Manager',is_active:true},
  {id:3,user:{id:12,full_name:'Brian Kipchoge',avatar_url:undefined},title:'Commercial Agent',is_active:true},
]

// ── Assign agent modal ────────────────────────────────────────
function AssignModal({ booking, agents, onClose, onAssign }: {
  booking:Booking; agents:AgentBasic[]; onClose:()=>void; onAssign:(agentId:number)=>Promise<void>
}) {
  const [selected, setSelected] = useState<number|null>(null)
  const [loading,  setLoading]  = useState(false)
  const submit = async () => {
    if (!selected) return
    setLoading(true)
    await onAssign(selected)
    setLoading(false)
  }
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{scale:0.95}} animate={{scale:1}} className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={e=>e.stopPropagation()}>
        <h3 className="font-bold text-ink-900 mb-1">Assign Agent</h3>
        <p className="text-xs text-ink-500 mb-4">{booking.property.title}</p>
        <div className="space-y-2 mb-5">
          {agents.map(a=>(
            <button key={a.id} onClick={()=>setSelected(a.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${selected===a.id?'border-terra bg-terra-50':'border-sandDark hover:border-terra/30'}`}>
              <div className="w-8 h-8 rounded-lg bg-terra-50 flex items-center justify-center text-xs font-bold text-terra flex-shrink-0">
                {getInitials(a.user.full_name)}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-ink-900">{a.user.full_name}</p>
                <p className="text-xs text-ink-400">{a.title}</p>
              </div>
              {selected===a.id && <CheckCircle2 size={15} className="text-terra ml-auto"/>}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-ink-500 bg-sand rounded-xl">Cancel</button>
          <button onClick={submit} disabled={!selected||loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-terra rounded-xl hover:bg-terra-600 disabled:opacity-60">
            {loading?<Loader2 size={14} className="animate-spin"/>:<Users size={14}/>} Assign
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── CSV export ────────────────────────────────────────────────
function exportCSV(bookings: Booking[]) {
  const rows = bookings.map(b=>({
    id:b.id, property:b.property.title, visit_date:b.visit_date, status:b.status, created:b.created_at
  }))
  const keys = Object.keys(rows[0])
  const csv  = [keys.join(','),...rows.map(r=>keys.map(k=>JSON.stringify((r as any)[k]??'')).join(','))].join('\n')
  const a = document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='bookings.csv'; a.click()
}

export default function AdminBookingsPage() {
  const [bookings,  setBookings]  = useState<Booking[]>([])
  const [agents,    setAgents]    = useState<AgentBasic[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [assignTarget, setAssignTarget] = useState<Booking|null>(null)
  const [actionLoading, setActionLoading] = useState<{id:number;action:string}|null>(null)
  const [page, setPage] = useState(1)

  useEffect(()=>{
    const load = async () => {
      setLoading(true)
      try {
        const [br,ar] = await Promise.all([
          api.get('/bookings/agency/?ordering=-created_at'),
          api.get('/agencies/me/agents/'),
        ])
        setBookings(br.data.results ?? [])
        setAgents(ar.data.results ?? [])
      } catch {
        setBookings(MOCK_BOOKINGS)
        setAgents(MOCK_AGENTS)
      } finally { setLoading(false) }
    }
    load()
  },[])

  const doAction = async (id:number, action:'confirm'|'reject'|'cancel') => {
    setActionLoading({id,action})
    const newStatus = action==='confirm'?'confirmed':action==='reject'?'rejected':'cancelled'
    try { await api.post(`/bookings/${id}/${action}/`) } catch {}
    setBookings(prev=>prev.map(b=>b.id===id?{...b,status:newStatus as Booking['status']}:b))
    toast.success(`Booking ${action}ed`)
    setActionLoading(null)
  }

  const doAssign = async (agentId:number) => {
    if (!assignTarget) return
    try { await api.patch(`/bookings/${assignTarget.id}/`, {assigned_agent:agentId}) } catch {}
    const agent = agents.find(a=>a.id===agentId)
    toast.success(`Assigned to ${agent?.user.full_name}`)
    setAssignTarget(null)
  }

  const statuses = ['all','pending','confirmed','completed','cancelled','rejected']
  const filtered = bookings
    .filter(b=>statusFilter==='all'||b.status===statusFilter)
    .filter(b=>!search||b.property.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Bookings</h1>
          <p className="text-sm text-ink-500 mt-0.5">{bookings.length} total bookings</p>
        </div>
        <button onClick={()=>exportCSV(filtered)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-sandDark rounded-xl text-sm font-semibold text-ink-700 hover:border-terra/40 hover:text-terra transition-all">
          <Download size={14}/> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by property…"
            className="w-full pl-9 pr-3 py-2 bg-white border border-sandDark rounded-xl text-sm text-ink-900 placeholder-ink-300 focus:outline-none focus:border-terra transition-all"/>
          {search && <button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"><X size={13}/></button>}
        </div>
        <div className="flex items-center gap-1 bg-white border border-sandDark rounded-xl p-1 overflow-x-auto">
          {statuses.map(s=>(
            <button key={s} onClick={()=>setStatusFilter(s)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${statusFilter===s?'bg-terra text-white':'text-ink-500 hover:bg-sand'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-sandDark overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="skeleton h-14 rounded-xl"/>)}</div>
        ) : filtered.length===0 ? (
          <div className="flex flex-col items-center py-16">
            <Calendar size={32} className="text-ink-200 mb-3"/>
            <p className="text-sm text-ink-400">No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sand border-b border-sandDark">
                <tr>{['Property','Visit Date','Status','Actions'].map(h=>(
                  <th key={h} className="text-left text-xs font-semibold text-ink-500 px-4 py-3">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-sandDark">
                {filtered.map((b,i)=>{
                  const cfg = STATUS_CFG[b.status] ?? STATUS_CFG.pending
                  const Icon = cfg.icon
                  const busy = actionLoading?.id===b.id
                  return (
                    <motion.tr key={b.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*.03}}
                      className="hover:bg-sand/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-sand">
                            {b.property.cover_image_url && <img src={b.property.cover_image_url} alt="" className="w-full h-full object-cover"/>}
                          </div>
                          <div>
                            <p className="font-semibold text-ink-900 truncate max-w-[160px]">{b.property.title}</p>
                            <p className="text-xs text-ink-400">{timeAgo(b.created_at)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-700 text-xs">{b.visit_date?formatDate(b.visit_date):'—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.cls}`}>
                          <Icon size={9}/>{cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {b.status==='pending' && (
                            <>
                              <button onClick={()=>doAction(b.id,'confirm')} disabled={!!busy}
                                className="px-2.5 py-1 bg-forest/10 text-forest text-xs font-semibold rounded-lg hover:bg-forest/20 disabled:opacity-50 transition-colors">
                                {busy&&actionLoading?.action==='confirm'?<Loader2 size={11} className="animate-spin"/>:'Confirm'}
                              </button>
                              <button onClick={()=>doAction(b.id,'reject')} disabled={!!busy}
                                className="px-2.5 py-1 bg-error/10 text-error text-xs font-semibold rounded-lg hover:bg-error/20 disabled:opacity-50 transition-colors">
                                Reject
                              </button>
                            </>
                          )}
                          {(b.status==='pending'||b.status==='confirmed') && (
                            <button onClick={()=>doAction(b.id,'cancel')} disabled={!!busy}
                              className="px-2.5 py-1 bg-sand text-ink-500 text-xs font-semibold rounded-lg hover:bg-sandDark disabled:opacity-50 transition-colors">
                              Cancel
                            </button>
                          )}
                          <button onClick={()=>setAssignTarget(b)}
                            className="px-2.5 py-1 bg-swahili/10 text-swahili text-xs font-semibold rounded-lg hover:bg-swahili/20 transition-colors">
                            Assign
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length>0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-sandDark">
            <p className="text-xs text-ink-400">{filtered.length} bookings</p>
            <div className="flex items-center gap-1">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="p-1.5 rounded-lg border border-sandDark text-ink-500 hover:border-terra/40 disabled:opacity-40"><ChevronLeft size={13}/></button>
              <span className="px-3 py-1.5 text-xs font-semibold text-ink-700">{page}</span>
              <button onClick={()=>setPage(p=>p+1)} className="p-1.5 rounded-lg border border-sandDark text-ink-500 hover:border-terra/40"><ChevronRight size={13}/></button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {assignTarget && <AssignModal booking={assignTarget} agents={agents} onClose={()=>setAssignTarget(null)} onAssign={doAssign}/>}
      </AnimatePresence>
    </div>
  )
}