// ============================================================
// ESTATE HUB — LOGIN PAGE
// src/pages/Auth/LoginPage.tsx
// ============================================================

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { setCredentials } from '@/store/slices/authSlice'
import authService from '@/services/authService'

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = (location.state as any)?.from?.pathname || '/dashboard'

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authService.login(data)
      const { access, refresh, user } = res.data.data
      dispatch(setCredentials({ user, access, refresh }))
      toast.success(`Welcome back, ${user.first_name}!`)
      navigate(from, { replace: true })
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid credentials. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-slate-400 mt-1 text-sm">Sign in to your EstateHub account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
            />
          </div>
          {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition">
          Create one free
        </Link>
      </p>
    </motion.div>
  )
}