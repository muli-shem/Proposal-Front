// ============================================================
// ESTATE HUB — RESET PASSWORD PAGE
// src/pages/Auth/ResetPasswordPage.tsx
// ============================================================
import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import authService from '@/services/authService'

const schema = z.object({
  new_password:         z.string().min(8, 'Minimum 8 characters'),
  new_password_confirm: z.string(),
}).refine((d) => d.new_password === d.new_password_confirm, {
  message: 'Passwords do not match', path: ['new_password_confirm'],
})
type FormData = z.infer<typeof schema>

const fieldLabel      = "block text-xs font-semibold text-gray-700 mb-1.5"
const fieldInput      = "w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all"
const fieldInputError = "w-full px-3 py-2.5 rounded-lg border border-red-300 bg-red-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all"
const fieldError      = "flex items-center gap-1 text-xs text-red-500 mt-1"

export default function ResetPasswordPage() {
  const [params]   = useSearchParams()
  const navigate   = useNavigate()
  const token      = params.get('token') || ''
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [loading,  setLoading]  = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  if (!token) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Lock size={24} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h2>
        <p className="text-sm text-gray-500 mb-6">
          This password reset link is missing or has expired.
        </p>
        <button onClick={() => navigate('/forgot-password')}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                     bg-purple-700 text-white font-bold hover:bg-purple-800 transition-all shadow-md">
          Request New Link
        </button>
      </div>
    )
  }

  const onSubmit = async (values: FormData) => {
    setLoading(true)
    try {
      await authService.confirmPasswordReset({ token, ...values })
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl p-8">
        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4">
            <Lock size={22} className="text-purple-700" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">New password</h1>
          <p className="text-sm text-gray-500">Choose a strong password to secure your account.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          {/* New password */}
          <div>
            <label className={fieldLabel}>New password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type={showPass ? 'text' : 'password'} placeholder="Minimum 8 characters"
                {...register('new_password')} autoFocus
                className={`pl-9 pr-10 ${errors.new_password ? fieldInputError : fieldInput}`} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.new_password && <p className={fieldError}>{errors.new_password.message}</p>}
          </div>

          {/* Confirm password */}
          <div>
            <label className={fieldLabel}>Confirm new password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type={showConf ? 'text' : 'password'} placeholder="Repeat new password"
                {...register('new_password_confirm')}
                className={`pl-9 pr-10 ${errors.new_password_confirm ? fieldInputError : fieldInput}`} />
              <button type="button" onClick={() => setShowConf(!showConf)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showConf ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.new_password_confirm && <p className={fieldError}>{errors.new_password_confirm.message}</p>}
          </div>

          {/* Requirements */}
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200">
            <p className="text-xs text-gray-500 font-medium mb-2">Password must:</p>
            <ul className="text-xs text-gray-500 flex flex-col gap-1">
              <li className="flex items-center gap-2"><CheckCircle2 size={11} className="text-gray-400" />Be at least 8 characters</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={11} className="text-gray-400" />Contain letters and numbers</li>
            </ul>
          </div>

          <motion.button type="submit" disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                       bg-purple-700 text-white font-bold hover:bg-purple-800 transition-all
                       shadow-md disabled:opacity-60">
            {loading
              ? <><Loader2 size={17} className="animate-spin" /><span>Resetting...</span></>
              : <><span>Set New Password</span><ArrowRight size={17} /></>}
          </motion.button>
        </form>
      </div>
    </motion.div>
  )
}