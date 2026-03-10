// ============================================================
// ESTATE HUB — SETTINGS PAGE
// src/pages/Dashboard/sub/SettingsPage.tsx
// ============================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Shield, Smartphone, Globe, Trash2, LogOut,
  ChevronRight, Check, Loader2, AlertTriangle, X,
} from 'lucide-react'
import api from '@/services/api'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import { clearStoredTokens } from '@/services/api'
import toast from 'react-hot-toast'

// ── Toggle switch ─────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-terra' : 'bg-ink-200'}`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${checked ? 'left-5' : 'left-1'}`} />
    </button>
  )
}

// ── Section wrapper ───────────────────────────────────────────
function SettingSection({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-sandDark overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <h2 className="font-display font-bold text-ink-900">{title}</h2>
        {subtitle && <p className="text-xs text-ink-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="divide-y divide-sandDark">{children}</div>
    </div>
  )
}

// ── Setting row ───────────────────────────────────────────────
function SettingRow({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div>
        <p className="text-sm font-medium text-ink-900">{label}</p>
        {sub && <p className="text-xs text-ink-400 mt-0.5">{sub}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

// ── Delete account modal ──────────────────────────────────────
function DeleteModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading]         = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-modal bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl w-full max-w-md p-6 shadow-warm-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-error" />
          </div>
          <div>
            <h3 className="font-display font-bold text-ink-900">Delete Account</h3>
            <p className="text-xs text-ink-500 mt-0.5">This action is permanent and cannot be undone.</p>
          </div>
          <button onClick={onClose} className="ml-auto p-1 rounded-lg hover:bg-sand text-ink-400"><X size={15} /></button>
        </div>

        <p className="text-sm text-ink-700 leading-relaxed mb-4">
          Deleting your account will permanently remove all your data — bookings, messages, saved properties, and listings. This cannot be reversed.
        </p>

        <p className="text-xs font-semibold text-ink-700 mb-2">Type <span className="text-error font-mono">DELETE</span> to confirm</p>
        <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          className="w-full px-3.5 py-2.5 bg-sand border border-sandDark rounded-xl text-sm text-ink-900 placeholder-ink-300 focus:outline-none focus:border-error focus:ring-2 focus:ring-error/10 transition-all mb-4 font-mono"
        />

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-ink-500 bg-sand rounded-xl hover:bg-sandDark transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirm}
            disabled={confirmText !== 'DELETE' || loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-error rounded-xl hover:bg-error/90 transition-colors disabled:opacity-50">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete Account
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function SettingsPage() {
  const dispatch   = useAppDispatch()
  const navigate   = useNavigate()
  const { user }   = useAppSelector((s) => s.auth)

  // Notification preferences
  const [notifs, setNotifs] = useState({
    email_bookings:    true,
    email_messages:    true,
    email_marketing:   false,
    push_bookings:     true,
    push_messages:     true,
    push_new_listings: false,
  })

  // Privacy preferences
  const [privacy, setPrivacy] = useState({
    profile_public:       true,
    show_phone:           false,
    show_email:           false,
    activity_visible:     true,
  })

  // App preferences
  const [prefs, setPrefs] = useState({
    language: 'en',
    currency: 'KES',
    distance_unit: 'km',
  })

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [savingNotifs, setSavingNotifs]       = useState(false)
  const [savingPrivacy, setSavingPrivacy]     = useState(false)

  const saveNotifs = async () => {
    setSavingNotifs(true)
    try { await api.patch('/auth/profile/', { notification_preferences: notifs }) } catch {}
    toast.success('Notification settings saved')
    setSavingNotifs(false)
  }

  const savePrivacy = async () => {
    setSavingPrivacy(true)
    try { await api.patch('/auth/profile/', { privacy_settings: privacy }) } catch {}
    toast.success('Privacy settings saved')
    setSavingPrivacy(false)
  }

  const handleDeleteAccount = async () => {
    try { await api.delete('/auth/profile/') } catch {}
    dispatch(logout())
    clearStoredTokens()
    navigate('/')
    toast.success('Account deleted')
  }

  const handleLogout = () => {
    dispatch(logout())
    clearStoredTokens()
    navigate('/')
    toast.success('Signed out')
  }

  const setN = (k: keyof typeof notifs) => (v: boolean) => setNotifs((prev) => ({ ...prev, [k]: v }))
  const setP = (k: keyof typeof privacy) => (v: boolean) => setPrivacy((prev) => ({ ...prev, [k]: v }))

  return (
    <div className="py-4 px-0 sm:px-2 space-y-5">
      <h1 className="font-display text-2xl font-bold text-ink-900 px-1">Settings</h1>

      {/* ── Notifications ────────────────────────────── */}
      <SettingSection title="Notifications" subtitle="Control how and when you receive alerts">
        <SettingRow label="Email — Bookings" sub="Confirmations, reminders, and updates">
          <Toggle checked={notifs.email_bookings} onChange={setN('email_bookings')} />
        </SettingRow>
        <SettingRow label="Email — Messages" sub="New messages from agents and agencies">
          <Toggle checked={notifs.email_messages} onChange={setN('email_messages')} />
        </SettingRow>
        <SettingRow label="Email — Marketing" sub="Property recommendations and news">
          <Toggle checked={notifs.email_marketing} onChange={setN('email_marketing')} />
        </SettingRow>
        <SettingRow label="Push — Bookings" sub="Real-time booking status changes">
          <Toggle checked={notifs.push_bookings} onChange={setN('push_bookings')} />
        </SettingRow>
        <SettingRow label="Push — Messages" sub="Instant message alerts">
          <Toggle checked={notifs.push_messages} onChange={setN('push_messages')} />
        </SettingRow>
        <SettingRow label="Push — New Listings" sub="Properties matching your interests">
          <Toggle checked={notifs.push_new_listings} onChange={setN('push_new_listings')} />
        </SettingRow>
        <div className="px-5 pb-4 pt-2">
          <button onClick={saveNotifs} disabled={savingNotifs}
            className="flex items-center gap-2 px-4 py-2 bg-terra text-white text-xs font-semibold rounded-xl hover:bg-terra-600 transition-colors disabled:opacity-60">
            {savingNotifs ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            Save
          </button>
        </div>
      </SettingSection>

      {/* ── Privacy ──────────────────────────────────── */}
      <SettingSection title="Privacy" subtitle="Manage who can see your information">
        <SettingRow label="Public Profile" sub="Allow others to view your profile page">
          <Toggle checked={privacy.profile_public} onChange={setP('profile_public')} />
        </SettingRow>
        <SettingRow label="Show Phone Number" sub="Display your number on your profile">
          <Toggle checked={privacy.show_phone} onChange={setP('show_phone')} />
        </SettingRow>
        <SettingRow label="Show Email Address" sub="Display your email on your profile">
          <Toggle checked={privacy.show_email} onChange={setP('show_email')} />
        </SettingRow>
        <SettingRow label="Activity Visibility" sub="Let others see when you were last active">
          <Toggle checked={privacy.activity_visible} onChange={setP('activity_visible')} />
        </SettingRow>
        <div className="px-5 pb-4 pt-2">
          <button onClick={savePrivacy} disabled={savingPrivacy}
            className="flex items-center gap-2 px-4 py-2 bg-terra text-white text-xs font-semibold rounded-xl hover:bg-terra-600 transition-colors disabled:opacity-60">
            {savingPrivacy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            Save
          </button>
        </div>
      </SettingSection>

      {/* ── Preferences ──────────────────────────────── */}
      <SettingSection title="Preferences" subtitle="Localisation and display settings">
        <SettingRow label="Language" sub="Interface language">
          <select value={prefs.language} onChange={(e) => setPrefs((p) => ({ ...p, language: e.target.value }))}
            className="px-3 py-1.5 bg-sand border border-sandDark rounded-lg text-sm text-ink-900 focus:outline-none focus:border-terra transition-all">
            <option value="en">English</option>
            <option value="sw">Kiswahili</option>
          </select>
        </SettingRow>
        <SettingRow label="Currency" sub="Default currency for property prices">
          <select value={prefs.currency} onChange={(e) => setPrefs((p) => ({ ...p, currency: e.target.value }))}
            className="px-3 py-1.5 bg-sand border border-sandDark rounded-lg text-sm text-ink-900 focus:outline-none focus:border-terra transition-all">
            <option value="KES">KES — Kenyan Shilling</option>
            <option value="USD">USD — US Dollar</option>
            <option value="GBP">GBP — British Pound</option>
          </select>
        </SettingRow>
        <SettingRow label="Distance Unit" sub="Used for property size and proximity">
          <select value={prefs.distance_unit} onChange={(e) => setPrefs((p) => ({ ...p, distance_unit: e.target.value }))}
            className="px-3 py-1.5 bg-sand border border-sandDark rounded-lg text-sm text-ink-900 focus:outline-none focus:border-terra transition-all">
            <option value="km">Kilometres</option>
            <option value="mi">Miles</option>
          </select>
        </SettingRow>
      </SettingSection>

      {/* ── Account actions ───────────────────────────── */}
      <SettingSection title="Account" subtitle="Manage your account access">
        <button onClick={handleLogout}
          className="w-full flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-sand transition-colors text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-ink-100 flex items-center justify-center">
              <LogOut size={15} className="text-ink-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-900">Sign Out</p>
              <p className="text-xs text-ink-400">Sign out of your account on this device</p>
            </div>
          </div>
          <ChevronRight size={15} className="text-ink-300" />
        </button>
      </SettingSection>

      {/* ── Danger zone ───────────────────────────────── */}
      <div className="bg-error/5 rounded-2xl border border-error/20 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h2 className="font-display font-bold text-error">Danger Zone</h2>
          <p className="text-xs text-ink-500 mt-0.5">Irreversible and destructive actions</p>
        </div>
        <div className="px-5 pb-5">
          <div className="flex items-start justify-between gap-4 p-4 bg-white rounded-xl border border-error/20">
            <div>
              <p className="text-sm font-semibold text-ink-900">Delete My Account</p>
              <p className="text-xs text-ink-500 mt-0.5">Permanently delete your account and all associated data. This cannot be undone.</p>
            </div>
            <button onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-error text-white text-xs font-semibold rounded-xl hover:bg-error/90 transition-colors flex-shrink-0">
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteModal && (
          <DeleteModal onClose={() => setShowDeleteModal(false)} onConfirm={handleDeleteAccount} />
        )}
      </AnimatePresence>
    </div>
  )
}
