// ESTATE HUB - RESET PASSWORD PAGE
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
  message: 'Passwords do not match',
  path:    ['new_password_confirm'],
})
type FormData = z.infer<typeof schema>

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
      <div className="bg-white rounded-2xl border border-sandDark shadow-warm-lg p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Lock size={24} className="text-error" />
        </div>
        <h2 className="font-display text-xl text-ink-900 mb-2">Invalid Link</h2>
        <p className="text-sm text-ink-500 mb-6">
          This password reset link is missing or has expired.
        </p>
        <button onClick={() => navigate('/forgot-password')} className="btn-terra w-full justify-center">
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
      <div className="bg-white rounded-2xl border border-sandDark shadow-warm-lg p-8">
        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-terra-50 flex items-center justify-center mb-4">
            <Lock size={22} className="text-terra" />
          </div>
          <h1 className="font-display text-3xl text-ink-900 leading-tight mb-2">New password</h1>
          <p className="text-sm text-ink-500">Choose a strong password to secure your account.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div>
            <label className="field-label">New password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300 pointer-events-none" />
              <input type={showPass ? 'text' : 'password'} placeholder="Minimum 8 characters"
                {...register('new_password')}
                className={'field-input pl-9 pr-10 ' + (errors.new_password ? 'field-input-error' : '')} autoFocus />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500 transition-colors">
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.new_password && <p className="field-error">{errors.new_password.message}</p>}
          </div>

          <div>
            <label className="field-label">Confirm new password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300 pointer-events-none" />
              <input type={showConf ? 'text' : 'password'} placeholder="Repeat new password"
                {...register('new_password_confirm')}
                className={'field-input pl-9 pr-10 ' + (errors.new_password_confirm ? 'field-input-error' : '')} />
              <button type="button" onClick={() => setShowConf(!showConf)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500 transition-colors">
                {showConf ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.new_password_confirm && <p className="field-error">{errors.new_password_confirm.message}</p>}
          </div>

          <div className="bg-sand rounded-xl p-3 border border-sandDark">
            <p className="text-xs text-ink-500 font-medium mb-2">Password must:</p>
            <ul className="text-xs text-ink-500 flex flex-col gap-1">
              <li className="flex items-center gap-2"><CheckCircle2 size={11} className="text-ink-300" />Be at least 8 characters</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={11} className="text-ink-300" />Contain letters and numbers</li>
            </ul>
          </div>

          <motion.button type="submit" disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }}
            className="btn-terra-lg w-full justify-center">
            {loading
              ? <><Loader2 size={17} className="animate-spin" /><span>Resetting...</span></>
              : <><span>Set New Password</span><ArrowRight size={17} /></>}
          </motion.button>
        </form>
      </div>
    </motion.div>
  )
}