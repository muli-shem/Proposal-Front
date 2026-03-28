// ============================================================
// ESTATE HUB — ADMIN SETTINGS PAGE
// src/pages/Admin/AdminSettingsPage.tsx
// ============================================================

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Lock, Eye, EyeOff, Loader2, Check, X, AlertTriangle, Trash2 } from 'lucide-react'
import api from '@/services/api'
import toast from 'react-hot-toast'

function Toggle({ checked, onChange }: { checked:boolean; onChange:(v:boolean)=>void }) {
  return (
    <button onClick={()=>onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${checked?'bg-terra':'bg-ink-200'}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${checked?'left-5':'left-1'}`}/>
    </button>
  )
}

function Row({ label, sub, children }: { label:string; sub?:string; children:React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-sandDark last:border-0">
      <div>
        <p className="text-sm font-medium text-ink-900">{label}</p>
        {sub && <p className="text-xs text-ink-400 mt-0.5">{sub}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

export default function AdminSettingsPage() {
  const [notifs, setNotifs] = useState({
    new_booking:     true,
    booking_cancel:  true,
    new_payment:     true,
    payment_dispute: true,
    new_follower:    false,
    weekly_report:   true,
    new_review:      true,
    agent_activity:  false,
  })
  const [pwForm, setPwForm] = useState({ current:'', new_password:'', confirm:'' })
  const [showPw, setShowPw] = useState({ current:false, new_password:false, confirm:false })
  const [savingNotifs, setSavingNotifs] = useState(false)
  const [savingPw,     setSavingPw]     = useState(false)
  const [showDelete,   setShowDelete]   = useState(false)
  const [deleteText,   setDeleteText]   = useState('')

  const setN = (k:keyof typeof notifs) => (v:boolean) => setNotifs(p=>({...p,[k]:v}))

  const saveNotifs = async () => {
    setSavingNotifs(true)
    try { await api.patch('/agencies/me/', {notification_preferences:notifs}) } catch {}
    toast.success('Notification settings saved')
    setSavingNotifs(false)
  }

  const savePw = async () => {
    if (pwForm.new_password !== pwForm.confirm) { toast.error('Passwords do not match'); return }
    if (pwForm.new_password.length < 8) { toast.error('Minimum 8 characters'); return }
    setSavingPw(true)
    try {
      await api.post('/auth/password/change/', {old_password:pwForm.current, new_password:pwForm.new_password})
      toast.success('Password updated')
      setPwForm({current:'',new_password:'',confirm:''})
    } catch { toast.error('Current password is incorrect') }
    finally { setSavingPw(false) }
  }

  const inputCls = "w-full px-3.5 py-2.5 bg-sand border border-sandDark rounded-xl text-sm text-ink-900 placeholder-ink-300 focus:outline-none focus:border-terra focus:ring-2 focus:ring-terra/10 transition-all"

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink-900">Settings</h1>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-sandDark overflow-hidden">
        <div className="px-5 py-4 border-b border-sandDark">
          <h2 className="font-bold text-ink-900 flex items-center gap-2"><Bell size={15} className="text-terra"/> Notifications</h2>
          <p className="text-xs text-ink-500 mt-0.5">Control which events send you alerts</p>
        </div>
        <Row label="New Booking"            sub="When a buyer books a viewing">           <Toggle checked={notifs.new_booking}     onChange={setN('new_booking')}/></Row>
        <Row label="Booking Cancellation"   sub="When a booking is cancelled">            <Toggle checked={notifs.booking_cancel}  onChange={setN('booking_cancel')}/></Row>
        <Row label="New Payment"            sub="Escrow payment initiated or updated">   <Toggle checked={notifs.new_payment}     onChange={setN('new_payment')}/></Row>
        <Row label="Payment Dispute"        sub="When a buyer raises a dispute">          <Toggle checked={notifs.payment_dispute} onChange={setN('payment_dispute')}/></Row>
        <Row label="New Follower"           sub="When someone follows your agency">       <Toggle checked={notifs.new_follower}    onChange={setN('new_follower')}/></Row>
        <Row label="Weekly Report"          sub="Summary email every Monday morning">    <Toggle checked={notifs.weekly_report}   onChange={setN('weekly_report')}/></Row>
        <Row label="New Review"             sub="When a client leaves a review">          <Toggle checked={notifs.new_review}     onChange={setN('new_review')}/></Row>
        <Row label="Agent Activity"         sub="When agents complete actions">           <Toggle checked={notifs.agent_activity}  onChange={setN('agent_activity')}/></Row>
        <div className="px-5 py-4">
          <button onClick={saveNotifs} disabled={savingNotifs}
            className="flex items-center gap-2 px-4 py-2 bg-terra text-white text-xs font-semibold rounded-xl hover:bg-terra-600 disabled:opacity-60 transition-colors">
            {savingNotifs?<Loader2 size={12} className="animate-spin"/>:<Check size={12}/>} Save
          </button>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-sandDark p-5">
        <h2 className="font-bold text-ink-900 flex items-center gap-2 mb-5"><Lock size={15} className="text-terra"/> Change Password</h2>
        <div className="space-y-4 mb-5">
          {(['current','new_password','confirm'] as const).map(k=>(
            <div key={k}>
              <label className="text-xs font-semibold text-ink-700 block mb-1.5">
                {k==='current'?'Current Password':k==='new_password'?'New Password':'Confirm New Password'}
              </label>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"/>
                <input type={showPw[k]?'text':'password'} value={pwForm[k]}
                  onChange={e=>setPwForm(f=>({...f,[k]:e.target.value}))} placeholder="••••••••"
                  className={inputCls+' pl-9 pr-10'}/>
                <button type="button" onClick={()=>setShowPw(s=>({...s,[k]:!s[k]}))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">
                  {showPw[k]?<EyeOff size={13}/>:<Eye size={13}/>}
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={savePw} disabled={savingPw||!pwForm.current||!pwForm.new_password}
          className="flex items-center gap-2 px-5 py-2.5 bg-swahili text-white text-sm font-semibold rounded-xl hover:bg-swahili-light disabled:opacity-60 transition-colors">
          {savingPw?<Loader2 size={14} className="animate-spin"/>:<Lock size={14}/>} Update Password
        </button>
      </div>

      {/* Danger zone */}
      <div className="bg-error/5 rounded-2xl border border-error/20 p-5">
        <h2 className="font-bold text-error mb-1">Danger Zone</h2>
        <p className="text-xs text-ink-500 mb-4">Irreversible actions — proceed with caution</p>
        <div className="flex items-start justify-between gap-4 p-4 bg-white rounded-xl border border-error/20">
          <div>
            <p className="text-sm font-semibold text-ink-900">Delete Agency Account</p>
            <p className="text-xs text-ink-500 mt-0.5">Permanently removes the agency, all listings, agents, and data.</p>
          </div>
          <button onClick={()=>setShowDelete(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-error text-white text-xs font-semibold rounded-xl hover:bg-error/90 flex-shrink-0 transition-colors">
            <Trash2 size={12}/> Delete
          </button>
        </div>
      </div>

      {/* Delete modal */}
      <AnimatePresence>
        {showDelete && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setShowDelete(false)}>
            <motion.div initial={{scale:0.95}} animate={{scale:1}} className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e=>e.stopPropagation()}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={18} className="text-error"/>
                </div>
                <div>
                  <h3 className="font-bold text-ink-900">Delete Agency</h3>
                  <p className="text-xs text-ink-500 mt-0.5">This is permanent and cannot be reversed.</p>
                </div>
                <button onClick={()=>setShowDelete(false)} className="ml-auto p-1 rounded-lg hover:bg-sand text-ink-400"><X size={14}/></button>
              </div>
              <p className="text-xs font-semibold text-ink-700 mb-2">Type <span className="text-error font-mono">DELETE</span> to confirm</p>
              <input value={deleteText} onChange={e=>setDeleteText(e.target.value)} placeholder="DELETE"
                className="w-full px-3.5 py-2.5 bg-sand border border-sandDark rounded-xl text-sm font-mono text-ink-900 focus:outline-none focus:border-error mb-4 transition-all"/>
              <div className="flex gap-2">
                <button onClick={()=>setShowDelete(false)} className="flex-1 py-2.5 text-sm font-semibold bg-sand text-ink-500 rounded-xl">Cancel</button>
                <button disabled={deleteText!=='DELETE'}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-error rounded-xl hover:bg-error/90 disabled:opacity-50 transition-colors">
                  Delete Agency
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}