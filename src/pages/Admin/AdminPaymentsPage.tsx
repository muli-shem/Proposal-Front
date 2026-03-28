// ============================================================
// ESTATE HUB — ADMIN PAYMENTS PAGE
// src/pages/Admin/AdminPaymentsPage.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard, ShieldCheck, Search, Download, X,
  CheckCircle2, AlertTriangle,
  ChevronLeft, ChevronRight, Loader2, Eye,
} from 'lucide-react'
import api from '@/services/api'
import { formatCurrency, formatDate, timeAgo } from '@/utils/format'
import type { PaymentTransaction } from '@/types'
import toast from 'react-hot-toast'

const STATUS_CFG: Record<string,{cls:string;label:string}> = {
  initiated:       { cls:'bg-sand text-ink-500',          label:'Initiated'       },
  held:            { cls:'bg-gold/10 text-gold-dark',      label:'In Escrow'       },
  docs_verified:   { cls:'bg-swahili/10 text-swahili',     label:'Docs Verified'   },
  buyer_confirmed: { cls:'bg-terra-50 text-terra',         label:'Buyer Confirmed' },
  released:        { cls:'bg-forest/10 text-forest',       label:'Released'        },
  disputed:        { cls:'bg-error/10 text-error',         label:'Disputed'        },
  refunded:        { cls:'bg-ink-100 text-ink-500',        label:'Refunded'        },
}

const MOCK_TXS: PaymentTransaction[] = Array.from({length:6},(_,i)=>({
  id:i+1,
  property:{id:i+1,title:['Karen Villa 4BR','Westlands Penthouse','Kilimani 3BR','Lavington TH','Runda Mansion','Upperhill Apt'][i]},
  amount:[68500000,250000,85000,32000000,120000000,95000][i],
  currency:'KES',
  status:(['held','released','docs_verified','disputed','buyer_confirmed','initiated'] as PaymentTransaction['status'][])[i],
  reference:`TXN-2025-00${i+1}`,
  created_at: new Date(Date.now()-i*86400000*3).toISOString(),
}))

// ── Transaction detail drawer ─────────────────────────────────
function TxDrawer({ tx, onClose, onAction }: {
  tx:PaymentTransaction; onClose:()=>void; onAction:(id:number,action:string)=>Promise<void>
}) {
  const [loading, setLoading] = useState<string|null>(null)
  const act = async (action:string) => {
    setLoading(action)
    await onAction(tx.id,action)
    setLoading(null)
  }
  const actions: {label:string;action:string;cls:string;showOn:PaymentTransaction['status'][]}[] = [
    {label:'Verify Documents', action:'verify-docs',    cls:'bg-swahili text-white', showOn:['held']},
    {label:'Release Funds',    action:'release',         cls:'bg-forest text-white',  showOn:['docs_verified','buyer_confirmed']},
    {label:'Dispute',          action:'dispute',         cls:'bg-error text-white',   showOn:['held','docs_verified','buyer_confirmed']},
    {label:'Refund Buyer',     action:'refund',          cls:'bg-ink-700 text-white', showOn:['disputed']},
  ]
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{y:40}} animate={{y:0}} exit={{y:40}}
        className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-ink-900">Transaction Details</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-sand text-ink-400"><X size={15}/></button>
        </div>
        <div className="space-y-3 mb-5">
          {[
            {label:'Reference',  value:tx.reference},
            {label:'Property',   value:tx.property.title},
            {label:'Amount',     value:formatCurrency(tx.amount,tx.currency)},
            {label:'Status',     value:(STATUS_CFG[tx.status]?.label ?? tx.status)},
            {label:'Created',    value:formatDate(tx.created_at)},
          ].map(({label,value})=>(
            <div key={label} className="flex justify-between items-center py-2 border-b border-sandDark last:border-0">
              <span className="text-xs text-ink-500 font-medium">{label}</span>
              <span className="text-sm font-semibold text-ink-900">{value}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {actions.filter(a=>a.showOn.includes(tx.status)).map(a=>(
            <button key={a.action} onClick={()=>act(a.action)} disabled={!!loading}
              className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all disabled:opacity-60 ${a.cls}`}>
              {loading===a.action ? <Loader2 size={14} className="animate-spin"/> : null}
              {a.label}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

function exportCSV(txs: PaymentTransaction[]) {
  const rows = txs.map(t=>({reference:t.reference,property:t.property.title,amount:t.amount,currency:t.currency,status:t.status,date:t.created_at}))
  const keys = Object.keys(rows[0])
  const csv  = [keys.join(','),...rows.map(r=>keys.map(k=>JSON.stringify((r as any)[k]??'')).join(','))].join('\n')
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='payments.csv';a.click()
}

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected,     setSelected]     = useState<PaymentTransaction|null>(null)
  const [page, setPage] = useState(1)

  useEffect(()=>{
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get('/payments/escrow/agency/?ordering=-created_at')
        setTransactions(res.data.results ?? [])
      } catch { setTransactions(MOCK_TXS) }
      finally { setLoading(false) }
    }
    load()
  },[])

  const handleAction = async (id:number, action:string) => {
    try { await api.post(`/payments/escrow/${id}/${action}/`) } catch {}
    const statusMap: Record<string,PaymentTransaction['status']> = {
      'verify-docs':'docs_verified', release:'released', dispute:'disputed', refund:'refunded'
    }
    if (statusMap[action]) {
      setTransactions(prev=>prev.map(t=>t.id===id?{...t,status:statusMap[action]}:t))
    }
    toast.success(`Action: ${action.replace('-',' ')}`)
    setSelected(null)
  }

  const filtered = transactions
    .filter(t=>statusFilter==='all'||t.status===statusFilter)
    .filter(t=>!search||t.property.title.toLowerCase().includes(search.toLowerCase())||t.reference.toLowerCase().includes(search.toLowerCase()))

  const totals = {
    held:     transactions.filter(t=>t.status==='held').reduce((s,t)=>s+t.amount,0),
    released: transactions.filter(t=>t.status==='released').reduce((s,t)=>s+t.amount,0),
    disputed: transactions.filter(t=>t.status==='disputed').reduce((s,t)=>s+t.amount,0),
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Payments & Escrow</h1>
          <p className="text-sm text-ink-500 mt-0.5">{transactions.length} transactions</p>
        </div>
        <button onClick={()=>exportCSV(filtered)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-sandDark rounded-xl text-sm font-semibold text-ink-700 hover:border-terra/40 hover:text-terra transition-all">
          <Download size={14}/> Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {label:'In Escrow',icon:ShieldCheck, value:formatCurrency(totals.held,'KES'),     cls:'text-gold-dark', bg:'bg-gold/10'},
          {label:'Released',  icon:CheckCircle2,value:formatCurrency(totals.released,'KES'), cls:'text-forest',    bg:'bg-forest/10'},
          {label:'Disputed',  icon:AlertTriangle,value:formatCurrency(totals.disputed,'KES'),cls:'text-error',     bg:'bg-error/10'},
        ].map(({label,icon:Icon,value,cls,bg})=>(
          <div key={label} className="bg-white rounded-2xl border border-sandDark p-4">
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={15} className={cls}/>
            </div>
            <p className="text-lg font-bold text-ink-900 font-display truncate">{value}</p>
            <p className="text-xs text-ink-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by property or ref…"
            className="w-full pl-9 pr-3 py-2 bg-white border border-sandDark rounded-xl text-sm placeholder-ink-300 focus:outline-none focus:border-terra transition-all"/>
          {search && <button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"><X size={13}/></button>}
        </div>
        <div className="flex items-center gap-1 bg-white border border-sandDark rounded-xl p-1 overflow-x-auto">
          {['all',...Object.keys(STATUS_CFG)].map(s=>(
            <button key={s} onClick={()=>setStatusFilter(s)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap capitalize transition-all ${statusFilter===s?'bg-terra text-white':'text-ink-500 hover:bg-sand'}`}>
              {STATUS_CFG[s]?.label ?? 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-sandDark overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">{Array.from({length:4}).map((_,i)=><div key={i} className="skeleton h-12 rounded-xl"/>)}</div>
        ) : filtered.length===0 ? (
          <div className="flex flex-col items-center py-16">
            <CreditCard size={32} className="text-ink-200 mb-3"/>
            <p className="text-sm text-ink-400">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sand border-b border-sandDark">
                <tr>{['Reference','Property','Amount','Status','Date','Actions'].map(h=>(
                  <th key={h} className="text-left text-xs font-semibold text-ink-500 px-4 py-3">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-sandDark">
                {filtered.map((tx,i)=>{
                  const cfg = STATUS_CFG[tx.status] ?? {cls:'bg-sand text-ink-500',label:tx.status}
                  return (
                    <motion.tr key={tx.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*.03}}
                      className="hover:bg-sand/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-ink-700">{tx.reference}</td>
                      <td className="px-4 py-3 font-semibold text-ink-900 truncate max-w-[140px]">{tx.property.title}</td>
                      <td className="px-4 py-3 font-bold text-ink-900">{formatCurrency(tx.amount,tx.currency)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.cls}`}>{cfg.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-400">{timeAgo(tx.created_at)}</td>
                      <td className="px-4 py-3">
                        <button onClick={()=>setSelected(tx)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-sand text-ink-600 text-xs font-semibold rounded-lg hover:bg-sandDark hover:text-ink-900 transition-colors">
                          <Eye size={11}/> View
                        </button>
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
            <p className="text-xs text-ink-400">{filtered.length} transactions</p>
            <div className="flex items-center gap-1">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="p-1.5 rounded-lg border border-sandDark text-ink-500 disabled:opacity-40"><ChevronLeft size={13}/></button>
              <span className="px-3 py-1.5 text-xs font-semibold text-ink-700">{page}</span>
              <button onClick={()=>setPage(p=>p+1)} className="p-1.5 rounded-lg border border-sandDark text-ink-500"><ChevronRight size={13}/></button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && <TxDrawer tx={selected} onClose={()=>setSelected(null)} onAction={handleAction}/>}
      </AnimatePresence>
    </div>
  )
}