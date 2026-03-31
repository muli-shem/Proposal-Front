// ============================================================
// ESTATE HUB — LOGIN PAGE  |  src/pages/Auth/LoginPage.tsx
// ============================================================
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, easeOut } from 'framer-motion'
import { Eye, EyeOff, Loader2, LogIn, AlertCircle } from 'lucide-react'
import { useAppDispatch } from '@/store/hooks'
import { setCredentials } from '@/store/slices/authSlice'
import authService from '@/services/authService'
import { getDashboardRoute } from '@/utils/format'
import toast from 'react-hot-toast'

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const item    = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } } }

export default function LoginPage() {
  const dispatch  = useAppDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = (location.state as { from?: string })?.from || '/feed'
  const [showPass, setShowPass] = useState(false)
  const [apiError, setApiError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setApiError('')
    try {
      const result = await authService.login(data)
      dispatch(setCredentials({ user: result.user, tokens: result.tokens }))
      toast.success(`Welcome back, ${result.user.first_name}!`)
      // If redirected here from a protected route, honour that — otherwise
      // send each role to their own home base
      const destination = from !== '/feed' ? from : getDashboardRoute(result.user.role)
      navigate(destination, { replace: true })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string; message?: string } } }
      setApiError(e?.response?.data?.detail || e?.response?.data?.message || 'Invalid email or password.')
    }
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="w-full">
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-warm-lg border border-sandDark overflow-hidden">
        {/* Accent strip */}
        <div className="h-1.5 bg-gradient-to-r from-terra via-gold to-terra" />
        <div className="px-8 py-8">

          {/* Header */}
          <motion.div variants={item} className="mb-7">
            <h1 className="font-display text-3xl text-ink-900 mb-1.5">Welcome back</h1>
            <p className="text-sm text-ink-500">Sign in to your Estate Hub account</p>
          </motion.div>

          {/* API Error */}
          {apiError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <AlertCircle size={15} className="text-error flex-shrink-0 mt-0.5" />
              <p className="text-sm text-error">{apiError}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Email */}
            <motion.div variants={item}>
              <label className="field-label">Email address</label>
              <input type="email" autoComplete="email" placeholder="you@example.com"
                {...register('email')} className={errors.email ? 'field-input-error' : 'field-input'} />
              {errors.email && <p className="field-error"><AlertCircle size={11} />{errors.email.message}</p>}
            </motion.div>

            {/* Password */}
            <motion.div variants={item}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="field-label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-terra hover:text-terra-600 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} autoComplete="current-password"
                  placeholder="Your password" {...register('password')}
                  className={`pr-11 ${errors.password ? 'field-input-error' : 'field-input'}`} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="field-error"><AlertCircle size={11} />{errors.password.message}</p>}
            </motion.div>

            {/* Submit */}
            <motion.div variants={item} className="mt-1">
              <motion.button type="submit" disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.01 }} whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className="w-full btn-terra-lg justify-center">
                {isSubmitting
                  ? <><Loader2 size={17} className="animate-spin" /> Signing in…</>
                  : <><LogIn size={17} /> Sign In</>}
              </motion.button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={item} className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-sandDark" />
            <span className="text-xs text-ink-300 font-semibold">NEW HERE?</span>
            <div className="flex-1 h-px bg-sandDark" />
          </motion.div>

          {/* Register link */}
          <motion.div variants={item}>
            <Link to="/register"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-sandDark
                         text-sm font-semibold text-ink-700 hover:border-terra hover:text-terra transition-all duration-200">
              Create a free account
            </Link>
          </motion.div>
        </div>
      </div>

      <motion.p variants={item} className="text-center text-xs text-ink-300 mt-4">
        Secured with 256-bit encryption · Kenya's most trusted property platform
      </motion.p>
    </motion.div>
  )
}