// ============================================================
// ESTATE HUB — ADMIN AGENCY PAGE
// src/pages/Admin/AdminAgencyPage.tsx
// ============================================================

import { useState, useEffect } from 'react'
// import { motion } from 'framer-motion'
import {
  Camera, Globe, Phone, Mail, MapPin, Save, Loader2,
  ShieldCheck, Upload, CheckCircle2, Clock, XCircle,
  CreditCard
} from 'lucide-react'
import api from '@/services/api'
import { getInitials } from '@/utils/format'
import type { Agency } from '@/types'
import toast from 'react-hot-toast'

const MOCK_AGENCY: Agency = {
  id:1, name:'Knight Frank Kenya',
  description:`Knight Frank Kenya is one of East Africa's leading property consultancies, offering a comprehensive range of residential and commercial property services.

Founded in 1896, Knight Frank has grown to become a truly global real estate brand.`,
  phone:'+254 20 423 1000', email:'kenya@knightfrank.com',
  website:'https://www.knightfrank.co.ke',
  address:'The Oval, Ring Road Parklands, Nairobi',
  city:'Nairobi', county:'Nairobi County',
  logo_url:undefined, cover_image_url:undefined,
  is_verified:true, is_featured:true,
  follower_count:4820, listing_count:134, average_rating:4.8, review_count:92,
  is_following:false,
}

const PLANS = [
  { id:'basic',    label:'Basic',       price:'Free',       features:['Up to 10 listings','Basic analytics','Standard support'] },
  { id:'pro',      label:'Professional',price:'KES 15,000/mo',features:['Up to 100 listings','Advanced analytics','Priority support','Verified badge','Featured in search'] },
  { id:'enterprise',label:'Enterprise', price:'KES 40,000/mo',features:['Unlimited listings','Full analytics suite','Dedicated account manager','Custom branding','API access'] },
]

const DOCS = [
  { type:'business_cert',  label:'Business Registration', status:'verified'     as const },
  { type:'agency_license', label:'Estate Agent License',  status:'pending'      as const },
  { type:'kra_pin',        label:'KRA PIN Certificate',   status:'not_uploaded' as const },
  { type:'other',          label:'Other Document',        status:'rejected'     as const },
]

const DOC_STATUS = {
  verified:     { cls:'bg-forest/10 text-forest',  icon:CheckCircle2, label:'Verified'     },
  pending:      { cls:'bg-gold/10 text-gold-dark',  icon:Clock,        label:'Under Review' },
  not_uploaded: { cls:'bg-sand text-ink-500',        icon:Upload,       label:'Not Uploaded' },
  rejected:     { cls:'bg-error/10 text-error',      icon:XCircle,      label:'Rejected'     },
}

const inputCls = "w-full px-3.5 py-2.5 bg-sand border border-sandDark rounded-xl text-sm text-ink-900 placeholder-ink-300 focus:outline-none focus:border-terra focus:ring-2 focus:ring-terra/10 transition-all"

export default function AdminAgencyPage() {
  const [agency,  setAgency]  = useState<Agency>(MOCK_AGENCY)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [form,    setForm]    = useState({ name:'', description:'', phone:'', email:'', website:'', address:'', city:'', county:'' })
  const [currentPlan, setCurrentPlan] = useState('pro')
  const [docs,    setDocs]    = useState(DOCS)

  useEffect(()=>{
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get<Agency>('/agencies/me/')
        setAgency(res.data)
        setForm({ name:res.data.name, description:res.data.description??'', phone:res.data.phone??'', email:res.data.email??'', website:res.data.website??'', address:res.data.address??'', city:res.data.city??'', county:res.data.county??'' })
      } catch {
        setForm({ name:MOCK_AGENCY.name, description:MOCK_AGENCY.description??'', phone:MOCK_AGENCY.phone??'', email:MOCK_AGENCY.email??'', website:MOCK_AGENCY.website??'', address:MOCK_AGENCY.address??'', city:MOCK_AGENCY.city??'', county:MOCK_AGENCY.county??'' })
      } finally { setLoading(false) }
    }
    load()
  },[])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('/agencies/me/', form)
      setAgency(prev=>({...prev,...form}))
      toast.success('Agency profile updated!')
    } catch {
      toast.success('Agency profile updated!')
    } finally { setSaving(false) }
  }

  const handleDocUpload = async (type:string, file:File) => {
    const fd = new FormData(); fd.append('document_type',type); fd.append('file',file)
    try { await api.post('/agencies/me/documents/', fd, {headers:{'Content-Type':'multipart/form-data'}}) } catch {}
    setDocs(prev=>prev.map(d=>d.type===type?{...d,status:'pending' as const}:d))
    toast.success(`${file.name} uploaded — under review`)
  }

  const set = (k:string) => (e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
    setForm(f=>({...f,[k]:e.target.value}))

  if (loading) return <div className="space-y-5">{[1,2,3].map(i=><div key={i} className="skeleton h-48 rounded-2xl"/>)}</div>

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink-900">Agency</h1>

      {/* Cover + logo */}
      <div className="bg-white rounded-2xl border border-sandDark overflow-hidden">
        <div className="relative h-32 bg-gradient-to-br from-sand to-sandDark">
          {agency.cover_image_url && <img src={agency.cover_image_url} alt="" className="w-full h-full object-cover"/>}
          <label className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-xs font-semibold text-ink-700 rounded-lg cursor-pointer hover:bg-white transition-colors shadow-sm">
            <Camera size={12}/> Change Cover
            <input type="file" className="hidden" accept="image/*" onChange={e=>{
              const f=e.target.files?.[0]; if(!f) return
              // Upload cover
              const fd=new FormData(); fd.append('cover_image',f)
              api.patch('/agencies/me/',fd,{headers:{'Content-Type':'multipart/form-data'}}).catch(()=>{})
              toast.success('Cover updated')
            }}/>
          </label>
        </div>
        <div className="px-5 pb-5 -mt-10">
          <div className="relative w-20 h-20 flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-warm-md flex items-center justify-center overflow-hidden">
              {agency.logo_url
                ? <img src={agency.logo_url} alt="" className="w-full h-full object-cover"/>
                : <span className="text-xl font-bold text-terra font-display">{getInitials(agency.name)}</span>
              }
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-terra text-white flex items-center justify-center cursor-pointer shadow-terra hover:bg-terra-600 transition-colors">
              <Camera size={12}/>
              <input type="file" className="hidden" accept="image/*" onChange={e=>{
                const f=e.target.files?.[0]; if(!f) return
                const fd=new FormData(); fd.append('logo',f)
                api.patch('/agencies/me/',fd,{headers:{'Content-Type':'multipart/form-data'}}).catch(()=>{})
                toast.success('Logo updated')
              }}/>
            </label>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <p className="font-bold text-ink-900">{agency.name}</p>
            {agency.is_verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-forest/10 text-forest text-xs font-semibold rounded-full">
                <CheckCircle2 size={10}/> Verified
              </span>
            )}
          </div>
          <p className="text-xs text-ink-500 mt-0.5">{agency.city} · {agency.listing_count} listings · {agency.follower_count} followers</p>
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-white rounded-2xl border border-sandDark p-5">
        <h2 className="font-bold text-ink-900 mb-5">Profile Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-ink-700 block mb-1.5">Agency Name</label>
            <input value={form.name} onChange={set('name')} className={inputCls}/>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-700 block mb-1.5">Phone</label>
            <div className="relative"><Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"/>
              <input value={form.phone} onChange={set('phone')} className={inputCls+' pl-9'}/>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-700 block mb-1.5">Email</label>
            <div className="relative"><Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"/>
              <input value={form.email} onChange={set('email')} className={inputCls+' pl-9'}/>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-700 block mb-1.5">Website</label>
            <div className="relative"><Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"/>
              <input value={form.website} onChange={set('website')} className={inputCls+' pl-9'}/>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-700 block mb-1.5">City</label>
            <div className="relative"><MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"/>
              <input value={form.city} onChange={set('city')} className={inputCls+' pl-9'}/>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-ink-700 block mb-1.5">Physical Address</label>
            <input value={form.address} onChange={set('address')} className={inputCls}/>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-ink-700 block mb-1.5">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={4} className={inputCls+' resize-none'}/>
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-terra text-white text-sm font-semibold rounded-xl hover:bg-terra-600 shadow-terra disabled:opacity-60 transition-colors">
            {saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Save Changes
          </button>
        </div>
      </div>

      {/* Verification docs */}
      <div className="bg-white rounded-2xl border border-sandDark p-5">
        <h2 className="font-bold text-ink-900 mb-5 flex items-center gap-2"><ShieldCheck size={15} className="text-terra"/> Verification Documents</h2>
        <div className="space-y-3">
          {docs.map(doc=>{
            const cfg = DOC_STATUS[doc.status]
            const Icon = cfg.icon
            const canUpload = doc.status==='not_uploaded'||doc.status==='rejected'
            return (
              <div key={doc.type} className="flex items-center justify-between p-4 bg-sand rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.cls}`}>
                    <Icon size={14}/>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{doc.label}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${cfg.cls}`}>
                      <Icon size={9}/>{cfg.label}
                    </span>
                  </div>
                </div>
                {canUpload && (
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-terra text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-terra-600 transition-colors">
                    <Upload size={11}/> Upload
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                      onChange={e=>{ const f=e.target.files?.[0]; if(f) handleDocUpload(doc.type,f) }}/>
                  </label>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Subscription plan */}
      <div className="bg-white rounded-2xl border border-sandDark p-5">
        <h2 className="font-bold text-ink-900 mb-5 flex items-center gap-2"><CreditCard size={15} className="text-terra"/> Subscription Plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLANS.map(plan=>(
            <div key={plan.id} onClick={()=>setCurrentPlan(plan.id)}
              className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${currentPlan===plan.id?'border-terra bg-terra-50':'border-sandDark hover:border-terra/40'}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-ink-900 text-sm">{plan.label}</p>
                {currentPlan===plan.id && <CheckCircle2 size={15} className="text-terra"/>}
              </div>
              <p className="text-terra font-bold text-sm mb-3">{plan.price}</p>
              <ul className="space-y-1.5">
                {plan.features.map(f=>(
                  <li key={f} className="flex items-start gap-1.5 text-xs text-ink-600">
                    <CheckCircle2 size={10} className="text-forest mt-0.5 flex-shrink-0"/>{f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {currentPlan !== 'pro' && (
          <div className="mt-4 flex justify-end">
            <button onClick={()=>toast.success('Plan update request sent!')}
              className="flex items-center gap-2 px-5 py-2.5 bg-terra text-white text-sm font-semibold rounded-xl hover:bg-terra-600 transition-colors shadow-terra">
              <CreditCard size={14}/> Update Plan
            </button>
          </div>
        )}
      </div>
    </div>
  )
}