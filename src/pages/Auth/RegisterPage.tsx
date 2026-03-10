import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, easeOut } from 'framer-motion'
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Home, Briefcase, Building2, Code2 } from 'lucide-react'
import authService from '@/services/authService'
import toast from 'react-hot-toast'

const schema = z.object({
  first_name:       z.string().min(2, 'First name must be at least 2 characters'),
  last_name:        z.string().min(2, 'Last name must be at least 2 characters'),
  email:            z.string().email('Enter a valid email address'),
  phone:            z.string().optional(),
  role:             z.enum(['buyer', 'agent', 'agency_admin', 'developer']),
  password:         z.string().min(8, 'Password must be at least 8 characters'),
  password_confirm: z.string(),
  terms:            z.boolean(),
}).refine((d) => d.password === d.password_confirm, {
  message: 'Passwords do not match', path: ['password_confirm'],
}).refine((d) => d.terms === true, {
  message: 'You must accept the terms', path: ['terms'],
})
type FormData = z.infer<typeof schema>

const ROLES = [
  { value: 'buyer',        label: 'Buyer / Tenant',  icon: Home,      desc: 'I want to buy or rent a property' },
  { value: 'agent',        label: 'Agent',            icon: Briefcase, desc: 'I sell or rent properties for an agency' },
  { value: 'agency_admin', label: 'Agency Owner',     icon: Building2, desc: 'I run a real estate agency' },
  { value: 'developer',    label: 'Developer',        icon: Code2,     desc: 'I build and sell property projects' },
] as const

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const item    = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } } }

const fieldLabel      = "block text-xs font-semibold text-gray-700 mb-1.5"
const fieldInput      = "w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all"
const fieldInputError = "w-full px-3 py-2.5 rounded-lg border border-red-300 bg-red-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all"
const fieldError      = "flex items-center gap-1 text-xs text-red-500 mt-1"

export default function RegisterPage() {
  const navigate = useNavigate()
  const [showPass,    setShowPass]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiError,    setApiError]    = useState('')
  const [success,     setSuccess]     = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { role: 'buyer' } })

  const selectedRole = watch('role')

  const onSubmit = async (data: FormData) => {
    setApiError('')
    try {
      await authService.register({
        first_name: data.first_name, last_name: data.last_name,
        email: data.email, phone: data.phone, role: data.role,
        password: data.password, password_confirm: data.password_confirm,
      })
      setSuccess(true)
      toast.success('Account created! Please check your email.')
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[] | string> } }
      const d = e?.response?.data
      if (d) {
        setApiError(Object.values(d).flat().join(' ') || 'Registration failed. Please try again.')
      } else {
        setApiError('Registration failed. Please try again.')
      }
    }
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-purple-700" />
        <div className="px-8 py-10 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            We've sent a verification link to your email.<br />
            Click the link to activate your account.
          </p>
          <button onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                       bg-purple-700 text-white font-bold hover:bg-purple-800 transition-all shadow-md">
            Go to Sign In
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="w-full">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-purple-700 via-amber-400 to-purple-700" />
        <div className="px-8 py-8">

          <motion.div variants={item} className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-1.5">Create account</h1>
            <p className="text-sm text-gray-500">Join Kenya's premier property marketplace</p>
          </motion.div>

          {apiError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{apiError}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            {/* Role selector */}
            <motion.div variants={item}>
              <label className={fieldLabel}>I am a…</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(({ value, label, icon: Icon, desc }) => {
                  const active = selectedRole === value
                  return (
                    <button key={value} type="button"
                      onClick={() => setValue('role', value, { shouldValidate: true })}
                      className={`flex flex-col items-start gap-1 px-3 py-3 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer ${
                        active
                          ? 'border-purple-600 bg-purple-50 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-purple-300 hover:bg-purple-50/40'
                      }`}>
                      <div className="flex items-center gap-1.5 w-full">
                        <Icon size={14} className={active ? 'text-purple-700' : 'text-gray-400'} />
                        <span className={`text-xs font-bold ${active ? 'text-purple-700' : 'text-gray-700'}`}>
                          {label}
                        </span>
                        {active && <CheckCircle2 size={12} className="text-purple-600 ml-auto flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-400 leading-snug">{desc}</p>
                    </button>
                  )
                })}
              </div>
              {errors.role && <p className={fieldError}><AlertCircle size={11} />{errors.role.message}</p>}
            </motion.div>

            {/* Name row */}
            <motion.div variants={item} className="grid grid-cols-2 gap-3">
              <div>
                <label className={fieldLabel}>First name</label>
                <input type="text" placeholder="Jane" {...register('first_name')}
                  className={errors.first_name ? fieldInputError : fieldInput} />
                {errors.first_name && <p className={fieldError}><AlertCircle size={11} />{errors.first_name.message}</p>}
              </div>
              <div>
                <label className={fieldLabel}>Last name</label>
                <input type="text" placeholder="Doe" {...register('last_name')}
                  className={errors.last_name ? fieldInputError : fieldInput} />
                {errors.last_name && <p className={fieldError}><AlertCircle size={11} />{errors.last_name.message}</p>}
              </div>
            </motion.div>

            {/* Email */}
            <motion.div variants={item}>
              <label className={fieldLabel}>Email address</label>
              <input type="email" autoComplete="email" placeholder="you@example.com" {...register('email')}
                className={errors.email ? fieldInputError : fieldInput} />
              {errors.email && <p className={fieldError}><AlertCircle size={11} />{errors.email.message}</p>}
            </motion.div>

            {/* Phone */}
            <motion.div variants={item}>
              <label className={fieldLabel}>
                Phone <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input type="tel" placeholder="+254 700 000 000" {...register('phone')} className={fieldInput} />
            </motion.div>

            {/* Password */}
            <motion.div variants={item}>
              <label className={fieldLabel}>Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters"
                  {...register('password')}
                  className={`pr-11 ${errors.password ? fieldInputError : fieldInput}`} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className={fieldError}><AlertCircle size={11} />{errors.password.message}</p>}
            </motion.div>

            {/* Confirm Password */}
            <motion.div variants={item}>
              <label className={fieldLabel}>Confirm password</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} placeholder="Repeat password"
                  {...register('password_confirm')}
                  className={`pr-11 ${errors.password_confirm ? fieldInputError : fieldInput}`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password_confirm && <p className={fieldError}><AlertCircle size={11} />{errors.password_confirm.message}</p>}
            </motion.div>

            {/* Terms */}
            <motion.div variants={item}>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input type="checkbox" {...register('terms')} className="sr-only peer" />
                  <div className="w-[18px] h-[18px] rounded border-2 border-stone-300 bg-white
                                  peer-checked:bg-purple-700 peer-checked:border-purple-700 transition-all
                                  flex items-center justify-center">
                    <CheckCircle2 size={11} className="text-white opacity-0 peer-checked:opacity-100" />
                  </div>
                </div>
                <span className="text-xs text-gray-500 leading-relaxed">
                  I agree to Estate Hub's{' '}
                  <a href="/terms" className="text-purple-700 hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-purple-700 hover:underline">Privacy Policy</a>
                </span>
              </label>
              {errors.terms && <p className={`${fieldError} mt-1`}><AlertCircle size={11} />{errors.terms.message}</p>}
            </motion.div>

            {/* Submit */}
            <motion.div variants={item} className="mt-1">
              <motion.button type="submit" disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                           bg-purple-700 text-white font-bold hover:bg-purple-800 transition-all
                           shadow-md disabled:opacity-60">
                {isSubmitting
                  ? <><Loader2 size={17} className="animate-spin" /> Creating account…</>
                  : 'Create Free Account'}
              </motion.button>
            </motion.div>
          </form>

          <motion.p variants={item} className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-purple-700 hover:text-purple-900 transition-colors">
              Sign in
            </Link>
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}