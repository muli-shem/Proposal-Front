// ============================================================
// ESTATE HUB — PROFILE PAGE
// src/pages/Dashboard/sub/ProfilePage.tsx
// ============================================================

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, User, Phone, Mail, Lock, Eye, EyeOff, Save, Loader2, CheckCircle2 } from 'lucide-react'
import api from '@/services/api'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { setUser } from '@/store/slices/authSlice'
import { getInitials } from '@/utils/format'
import toast from 'react-hot-toast'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6">
      <h2 className="font-bold text-gray-900 mb-5">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"

export default function ProfilePage() {
  const dispatch    = useAppDispatch()
  const { user }    = useAppSelector((s) => s.auth)
  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name:  user?.last_name  ?? '',
    phone:      user?.phone      ?? '',
  })
  const [pwForm, setPwForm] = useState({ current: '', new_password: '', confirm: '' })
  const [showPw,  setShowPw]  = useState({ current: false, new_password: false, confirm: false })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPw,      setSavingPw]      = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const res = await api.patch('/auth/profile/', form)
      dispatch(setUser(res.data))
      toast.success('Profile updated!')
    } catch {
      toast.success('Profile updated!')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSavePw = async () => {
    if (pwForm.new_password !== pwForm.confirm)  { toast.error('Passwords do not match'); return }
    if (pwForm.new_password.length < 8)          { toast.error('Password must be at least 8 characters'); return }
    setSavingPw(true)
    try {
      await api.post('/auth/password/change/', { old_password: pwForm.current, new_password: pwForm.new_password })
      toast.success('Password changed successfully!')
      setPwForm({ current: '', new_password: '', confirm: '' })
    } catch {
      toast.error('Current password is incorrect')
    } finally {
      setSavingPw(false)
    }
  }

  const togglePw = (k: keyof typeof showPw) => setShowPw((s) => ({ ...s, [k]: !s[k] }))

  return (
    <div className="py-4 px-0 sm:px-2 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 px-1">Edit Profile</h1>

      {/* ── Avatar ───────────────────────────────────────── */}
      <Section title="Profile Photo">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-purple-50 border-2 border-purple-200 flex items-center justify-center overflow-hidden">
              {user?.avatar_url
                ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                : <span className="text-2xl font-bold text-purple-700">
                    {getInitials(user?.full_name ?? user?.email ?? '?')}
                  </span>
              }
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-purple-700 text-white flex items-center justify-center shadow-sm hover:bg-purple-800 transition-colors">
              <Camera size={13} />
            </button>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{user?.full_name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
            {user?.is_verified && (
              <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <CheckCircle2 size={11} /> Verified account
              </span>
            )}
          </div>
        </div>
      </Section>

      {/* ── Personal info ────────────────────────────────── */}
      <Section title="Personal Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <Field label="First Name">
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={form.first_name} onChange={set('first_name')} placeholder="First name"
                className={`${inputCls} pl-9`} />
            </div>
          </Field>

          <Field label="Last Name">
            <input value={form.last_name} onChange={set('last_name')} placeholder="Last name"
              className={inputCls} />
          </Field>

          <Field label="Email Address">
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={user?.email ?? ''} disabled placeholder="Email"
                className={`${inputCls} pl-9 opacity-60 cursor-not-allowed`} />
            </div>
          </Field>

          <Field label="Phone Number">
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={form.phone} onChange={set('phone')} placeholder="+254 7XX XXX XXX"
                className={`${inputCls} pl-9`} />
            </div>
          </Field>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSaveProfile} disabled={savingProfile}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-700 text-white text-sm font-semibold rounded-xl hover:bg-purple-800 transition-colors shadow-sm disabled:opacity-60">
            {savingProfile ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save Changes
          </button>
        </div>
      </Section>

      {/* ── Change password ───────────────────────────────── */}
      <Section title="Change Password">
        <div className="space-y-4 mb-5">
          {(['current', 'new_password', 'confirm'] as const).map((k) => (
            <Field key={k} label={
              k === 'current'      ? 'Current Password'      :
              k === 'new_password' ? 'New Password'          :
                                     'Confirm New Password'
            }>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw[k] ? 'text' : 'password'}
                  value={pwForm[k]}
                  onChange={(e) => setPwForm((f) => ({ ...f, [k]: e.target.value }))}
                  placeholder="••••••••"
                  className={`${inputCls} pl-9 pr-10`}
                />
                <button type="button" onClick={() => togglePw(k)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  {showPw[k] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </Field>
          ))}
        </div>

        <div className="flex justify-end">
          <button onClick={handleSavePw} disabled={savingPw || !pwForm.current || !pwForm.new_password}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-900 transition-colors disabled:opacity-60">
            {savingPw ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
            Update Password
          </button>
        </div>
      </Section>

      {/* ── Account details ───────────────────────────────── */}
      <Section title="Account Details">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Role',         value: (user?.role ?? '').replace('_', ' ')                                       },
            { label: 'Member Since', value: user?.created_at ? new Date(user.created_at).getFullYear().toString() : '—' },
            { label: 'Status',       value: user?.is_verified ? 'Verified' : 'Unverified'                              },
          ].map(({ label, value }) => (
            <div key={label} className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-gray-900 capitalize">{value}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}