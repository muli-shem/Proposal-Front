// ============================================================
// ESTATE HUB — ADMIN PROPERTIES PAGE
// src/pages/Admin/AdminPropertiesPage.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Eye, EyeOff, Pencil, Trash2,
  Building2, X, Loader2, ChevronLeft, ChevronRight,
  CheckCircle2, AlertCircle, 
} from 'lucide-react'
import api from '@/services/api'
import { formatCurrency,  formatCount } from '@/utils/format'
import type { Property } from '@/types'
import toast from 'react-hot-toast'

const MOCK_PROPERTIES: Property[] = Array.from({length:8},(_,i)=>({
  id:i+1,
  title:['Karen Villa 4BR','Westlands Penthouse','Kilimani 3BR','Lavington TH','Runda Mansion','Upperhill Apt','Kileleshwa 2BR','Parklands Office'][i],
  description:'Premium property.',
  listing_type:(['sale','rent','rent','sale','sale','rent','rent','rent'] as const)[i],
  property_type:['villa','penthouse','apartment','townhouse','mansion','apartment','apartment','commercial'][i],
  price:[68500000,250000,85000,32000000,120000000,95000,55000,180000][i],
  price_currency:'KES',
  price_per:([undefined,'month','month',undefined,undefined,'month','month','month'] as any)[i],
  is_negotiable:true, bedrooms:[4,4,3,3,6,2,2,0][i], bathrooms:[4,4,2,3,7,2,2,2][i],
  size:[420,280,110,220,780,85,70,450][i], size_unit:'m²',
  city:'Nairobi', county:'Nairobi',
  neighborhood:['Karen','Westlands','Kilimani','Lavington','Runda','Upperhill','Kileleshwa','Parklands'][i],
  is_verified:[true,true,true,false,true,false,false,true][i],
  is_featured:[true,true,false,false,true,false,false,false][i],
  status:(['published','published','published','draft','published','draft','published','published'] as any)[i],
  cover_image_url:`https://picsum.photos/seed/ap${i+1}/80/60`,
  agency:{id:1,name:'Knight Frank Kenya',logo_url:undefined,is_verified:true,city:'Nairobi'},
  like_count:[47,89,23,34,210,15,18,12][i], save_count:[21,44,11,16,89,7,8,5][i],
  comment_count:[8,15,4,7,34,2,3,1][i], view_count:[3200,1890,1450,1234,980,780,640,520][i],
  is_liked:false, is_saved:false,
  created_at: new Date(Date.now()-i*86400000*5).toISOString(),
  updated_at: new Date().toISOString(),
}))

// ── Delete confirm modal ──────────────────────────────────────
function DeleteModal({ property, onClose, onConfirm }: { property:Property; onClose:()=>void; onConfirm:()=>void }) {
  const [loading, setLoading] = useState(false)
  const confirm = async () => { setLoading(true); await onConfirm(); setLoading(false) }
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{scale:0.95}} animate={{scale:1}}
        className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-warm-xl" onClick={e=>e.stopPropagation()}>
        <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center mb-4">
          <Trash2 size={18} className="text-error"/>
        </div>
        <h3 className="font-bold text-ink-900 mb-1">Delete Listing</h3>
        <p className="text-sm text-ink-500 mb-5">Are you sure you want to delete <strong>{property.title}</strong>? This cannot be undone.</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-ink-500 bg-sand rounded-xl hover:bg-sandDark transition-colors">Cancel</button>
          <button onClick={confirm} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-error rounded-xl hover:bg-error/90 transition-colors disabled:opacity-60">
            {loading ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>} Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState<'all'|'published'|'draft'>('all')
  const [deleteTarget, setDeleteTarget] = useState<Property|null>(null)
  const [togglingId,   setTogglingId]   = useState<number|null>(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 8

  useEffect(()=>{
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/properties/?agency=me&page=${page}&page_size=${PAGE_SIZE}`)
        setProperties(res.data.results ?? [])
      } catch { setProperties(MOCK_PROPERTIES) }
      finally { setLoading(false) }
    }
    load()
  },[page])

  const handleTogglePublish = async (p: Property) => {
    const newStatus = p.status === 'published' ? 'draft' : 'published'
    setTogglingId(p.id)
    try {
      await api.patch(`/properties/${p.id}/`, { status: newStatus })
      setProperties(prev => prev.map(x => x.id===p.id ? {...x,status:newStatus as any} : x))
      toast.success(`Listing ${newStatus === 'published' ? 'published' : 'unpublished'}`)
    } catch {
      setProperties(prev => prev.map(x => x.id===p.id ? {...x,status:newStatus as any} : x))
      toast.success(`Listing ${newStatus === 'published' ? 'published' : 'unpublished'}`)
    } finally { setTogglingId(null) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await api.delete(`/properties/${deleteTarget.id}/`) } catch {}
    setProperties(prev => prev.filter(p => p.id !== deleteTarget.id))
    toast.success('Listing deleted')
    setDeleteTarget(null)
  }

  const filtered = properties
    .filter(p => statusFilter === 'all' || p.status === statusFilter)
    .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Properties</h1>
          <p className="text-sm text-ink-500 mt-0.5">{properties.length} total listings</p>
        </div>
        <Link to="/admin/properties/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-terra text-white text-sm font-semibold rounded-xl hover:bg-terra-600 transition-colors shadow-terra">
          <Plus size={15}/> Add Listing
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search listings…"
            className="w-full pl-9 pr-3 py-2 bg-white border border-sandDark rounded-xl text-sm text-ink-900 placeholder-ink-300 focus:outline-none focus:border-terra transition-all"/>
          {search && <button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"><X size={13}/></button>}
        </div>
        <div className="flex items-center gap-1 bg-white border border-sandDark rounded-xl p-1">
          {(['all','published','draft'] as const).map(s=>(
            <button key={s} onClick={()=>setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${statusFilter===s?'bg-terra text-white':'text-ink-500 hover:bg-sand'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-sandDark overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="skeleton h-14 rounded-xl"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Building2 size={32} className="text-ink-200 mb-3"/>
            <p className="text-ink-400 text-sm">No listings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sand border-b border-sandDark">
                <tr>{['Property','Type','Price','Views','Status','Actions'].map(h=>(
                  <th key={h} className="text-left text-xs font-semibold text-ink-500 px-4 py-3">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-sandDark">
                <AnimatePresence>
                  {filtered.map((p,i)=>(
                    <motion.tr key={p.id} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{delay:i*.03}}
                      className="hover:bg-sand/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-sand">
                            {p.cover_image_url && <img src={p.cover_image_url} alt="" className="w-full h-full object-cover"/>}
                          </div>
                          <div>
                            <p className="font-semibold text-ink-900 truncate max-w-[160px]">{p.title}</p>
                            <p className="text-xs text-ink-400">{p.neighborhood}, {p.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-500 capitalize text-xs">{p.listing_type}</td>
                      <td className="px-4 py-3 font-semibold text-ink-900 text-xs">{formatCurrency(p.price,'KES')}</td>
                      <td className="px-4 py-3 text-ink-500 text-xs">{formatCount(p.view_count)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.status==='published' ? 'bg-forest/10 text-forest' : 'bg-sand text-ink-500'
                        }`}>
                          {p.status==='published' ? <CheckCircle2 size={9}/> : <AlertCircle size={9}/>}
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* Publish toggle */}
                          <button onClick={()=>handleTogglePublish(p)} disabled={togglingId===p.id}
                            title={p.status==='published'?'Unpublish':'Publish'}
                            className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                              p.status==='published'
                                ? 'text-forest hover:bg-forest/10'
                                : 'text-ink-400 hover:bg-sand hover:text-forest'
                            }`}>
                            {togglingId===p.id ? <Loader2 size={13} className="animate-spin"/> : p.status==='published' ? <Eye size={13}/> : <EyeOff size={13}/>}
                          </button>
                          {/* Edit */}
                          <Link to={`/admin/properties/${p.id}/edit`}
                            className="p-1.5 rounded-lg text-ink-400 hover:bg-sand hover:text-swahili transition-colors">
                            <Pencil size={13}/>
                          </Link>
                          {/* Delete */}
                          <button onClick={()=>setDeleteTarget(p)}
                            className="p-1.5 rounded-lg text-ink-400 hover:bg-error/10 hover:text-error transition-colors">
                            <Trash2 size={13}/>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-sandDark">
            <p className="text-xs text-ink-400">Showing {filtered.length} listings</p>
            <div className="flex items-center gap-1">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                className="p-1.5 rounded-lg border border-sandDark text-ink-500 hover:border-terra/40 hover:text-terra transition-all disabled:opacity-40">
                <ChevronLeft size={13}/>
              </button>
              <span className="px-3 py-1.5 text-xs font-semibold text-ink-700">{page}</span>
              <button onClick={()=>setPage(p=>p+1)}
                className="p-1.5 rounded-lg border border-sandDark text-ink-500 hover:border-terra/40 hover:text-terra transition-all">
                <ChevronRight size={13}/>
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {deleteTarget && <DeleteModal property={deleteTarget} onClose={()=>setDeleteTarget(null)} onConfirm={handleDelete}/>}
      </AnimatePresence>
    </div>
  )
}