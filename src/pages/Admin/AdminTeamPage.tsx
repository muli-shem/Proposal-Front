// ============================================================
// ESTATE HUB — ADMIN TEAM PAGE
// src/pages/Admin/AdminTeamPage.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, UserPlus, Mail, Pencil, UserX, CheckCircle2,
  Star, Calendar, Zap, X, Loader2, Send,
} from 'lucide-react'
import api from '@/services/api'
import { getInitials} from '@/utils/format'
// import type { AgentBasic } from '@/types'
import toast from 'react-hot-toast'

const MOCK_AGENTS = [
  { id:1, user:{id:10,full_name:'James Mwangi',  avatar_url:undefined}, title:'Senior Sales Agent',          is_active:true,  bookings:24, leads:12, rating:4.8 },
  { id:2, user:{id:11,full_name:'Aisha Omondi',   avatar_url:undefined}, title:'Residential Leasing Manager', is_active:true,  bookings:18, leads:9,  rating:4.7 },
  { id:3, user:{id:12,full_name:'Brian Kipchoge', avatar_url:undefined}, title:'Commercial Property Agent',   is_active:true,  bookings:14, leads:7,  rating:4.5 },
  { id:4, user:{id:13,full_name:'Grace Wanjiku',  avatar_url:undefined}, title:'Property Consultant',         is_active:false, bookings:10, leads:5,  rating:4.9 },
]

const TITLES = ['Sales Agent','Senior Sales Agent','Leasing Manager','Residential Leasing Manager','Commercial Property Agent','Property Consultant','Investment Advisor','Branch Manager']

// ── Invite modal ──────────────────────────────────────────────
function InviteModal({ onClose, onInvite }: { onClose:()=>void; onInvite:(email:string,title:string)=>Promise<void> }) {
  const [email,   setEmail]   = useState('')
  const [title,   setTitle]   = useState(TITLES[0])
  const [loading, setLoading] = useState(false)
  const submit = async () => {
    if (!email.trim()) { toast.error('Enter an email address'); return }
    setLoading(true)
    await onInvite(email, title)
    setLoading(false)
  }
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{scale:0.95,y:10}} animate={{scale:1,y:0}} className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-ink-900">Invite Agent</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-sand text-ink-400"><X size={15}/></button>
        </div>
        <div className="space-y-4 mb-5">
          <div>
            <label className="text-xs font-semibold text-ink-700 block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"/>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="agent@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-sand border border-sandDark rounded-xl text-sm text-ink-900 placeholder-ink-300 focus:outline-none focus:border-terra transition-all"/>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-700 block mb-1.5">Role / Title</label>
            <select value={title} onChange={e=>setTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-sand border border-sandDark rounded-xl text-sm text-ink-900 focus:outline-none focus:border-terra transition-all">
              {TITLES.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <button onClick={submit} disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-terra text-white text-sm font-semibold rounded-xl hover:bg-terra-600 disabled:opacity-60 transition-colors">
          {loading ? <Loader2 size={14} className="animate-spin"/> : <Send size={14}/>} Send Invitation
        </button>
      </motion.div>
    </motion.div>
  )
}

// ── Edit agent modal ──────────────────────────────────────────
function EditModal({ agent, onClose, onSave }: {
  agent: typeof MOCK_AGENTS[0]; onClose:()=>void; onSave:(id:number,title:string)=>Promise<void>
}) {
  const [title,   setTitle]   = useState(agent.title)
  const [loading, setLoading] = useState(false)
  const save = async () => { setLoading(true); await onSave(agent.id,title); setLoading(false) }
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{scale:0.95}} animate={{scale:1}} className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-ink-900">Edit Agent</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-sand text-ink-400"><X size={15}/></button>
        </div>
        <div className="flex items-center gap-3 mb-5 p-3 bg-sand rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-terra-50 flex items-center justify-center text-sm font-bold text-terra flex-shrink-0">
            {getInitials(agent.user.full_name)}
          </div>
          <div>
            <p className="font-semibold text-ink-900 text-sm">{agent.user.full_name}</p>
            <p className="text-xs text-ink-400">Agent ID #{agent.id}</p>
          </div>
        </div>
        <div className="mb-5">
          <label className="text-xs font-semibold text-ink-700 block mb-1.5">Role / Title</label>
          <select value={title} onChange={e=>setTitle(e.target.value)}
            className="w-full px-3 py-2.5 bg-sand border border-sandDark rounded-xl text-sm text-ink-900 focus:outline-none focus:border-terra transition-all">
            {TITLES.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-ink-500 bg-sand rounded-xl">Cancel</button>
          <button onClick={save} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-terra rounded-xl hover:bg-terra-600 disabled:opacity-60">
            {loading?<Loader2 size={14} className="animate-spin"/>:null} Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function AdminTeamPage() {
  const [agents,      setAgents]      = useState(MOCK_AGENTS)
  const [loading,     setLoading]     = useState(true)
  const [showInvite,  setShowInvite]  = useState(false)
  const [editAgent,   setEditAgent]   = useState<typeof MOCK_AGENTS[0]|null>(null)
  const [togglingId,  setTogglingId]  = useState<number|null>(null)

  useEffect(()=>{
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get('/agencies/me/agents/')
        if (res.data.results?.length) setAgents(res.data.results)
      } catch {}
      finally { setLoading(false) }
    }
    load()
  },[])

  const handleInvite = async (email:string, title:string) => {
    try { await api.post('/agencies/me/invite-agent/', {email, title}) } catch {}
    toast.success(`Invitation sent to ${email}`)
    setShowInvite(false)
  }

  const handleEditSave = async (id:number, title:string) => {
    try { await api.patch(`/agencies/me/agents/${id}/`, {title}) } catch {}
    setAgents(prev=>prev.map(a=>a.id===id?{...a,title}:a))
    toast.success('Agent updated')
    setEditAgent(null)
  }

  const handleToggleActive = async (agent: typeof MOCK_AGENTS[0]) => {
    setTogglingId(agent.id)
    const newActive = !agent.is_active
    try { await api.patch(`/agencies/me/agents/${agent.id}/`, {is_active:newActive}) } catch {}
    setAgents(prev=>prev.map(a=>a.id===agent.id?{...a,is_active:newActive}:a))
    toast.success(`Agent ${newActive?'activated':'deactivated'}`)
    setTogglingId(null)
  }

  const active   = agents.filter(a=>a.is_active).length
  const inactive = agents.filter(a=>!a.is_active).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Team</h1>
          <p className="text-sm text-ink-500 mt-0.5">{active} active · {inactive} inactive</p>
        </div>
        <button onClick={()=>setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-terra text-white text-sm font-semibold rounded-xl hover:bg-terra-600 transition-colors shadow-terra">
          <UserPlus size={15}/> Invite Agent
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {label:'Total Agents', value:agents.length,      icon:Users,    cls:'text-terra',   bg:'bg-terra-50'  },
          {label:'Active',       value:active,              icon:CheckCircle2,cls:'text-forest',bg:'bg-forest/10'},
          {label:'Inactive',     value:inactive,            icon:UserX,    cls:'text-ink-400', bg:'bg-sand'      },
        ].map(({label,value,icon:Icon,cls,bg})=>(
          <div key={label} className="bg-white rounded-2xl border border-sandDark p-4">
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={15} className={cls}/>
            </div>
            <p className="text-xl font-bold text-ink-900 font-display">{value}</p>
            <p className="text-xs text-ink-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Agent cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2,3,4].map(i=><div key={i} className="skeleton h-40 rounded-2xl"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {agents.map((a,i)=>(
              <motion.div key={a.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*.05}}
                className={`bg-white rounded-2xl border p-5 transition-all ${a.is_active?'border-sandDark':'border-sandDark opacity-70'}`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-terra-50 border border-terra/15 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {a.user.avatar_url
                      ? <img src={a.user.avatar_url} alt="" className="w-full h-full object-cover"/>
                      : <span className="text-sm font-bold text-terra">{getInitials(a.user.full_name)}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink-900">{a.user.full_name}</p>
                    <p className="text-xs text-ink-500">{a.title}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${a.is_active?'bg-forest':'bg-ink-300'}`}/>
                      <span className="text-[10px] text-ink-400">{a.is_active?'Active':'Inactive'}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    {icon:Calendar, value:a.bookings, label:'Bookings'},
                    {icon:Zap,      value:a.leads,    label:'Leads'   },
                    {icon:Star,     value:a.rating,   label:'Rating'  },
                  ].map(({icon:Icon,value,label})=>(
                    <div key={label} className="text-center bg-sand rounded-lg py-2">
                      <Icon size={11} className="text-terra mx-auto mb-0.5"/>
                      <p className="text-xs font-bold text-ink-900">{value}</p>
                      <p className="text-[9px] text-ink-400">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={()=>setEditAgent(a)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-sand text-ink-700 text-xs font-semibold rounded-lg hover:bg-sandDark transition-colors">
                    <Pencil size={12}/> Edit Role
                  </button>
                  <button onClick={()=>handleToggleActive(a)} disabled={togglingId===a.id}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                      a.is_active ? 'bg-error/10 text-error hover:bg-error/20' : 'bg-forest/10 text-forest hover:bg-forest/20'
                    }`}>
                    {togglingId===a.id ? <Loader2 size={12} className="animate-spin"/> : <UserX size={12}/>}
                    {a.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showInvite && <InviteModal onClose={()=>setShowInvite(false)} onInvite={handleInvite}/>}
        {editAgent  && <EditModal agent={editAgent} onClose={()=>setEditAgent(null)} onSave={handleEditSave}/>}
      </AnimatePresence>
    </div>
  )
}