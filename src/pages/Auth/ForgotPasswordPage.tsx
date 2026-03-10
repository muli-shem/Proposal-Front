// ============================================================
// ESTATE HUB — FORGOT PASSWORD  |  src/pages/Auth/ForgotPasswordPage.tsx
// ============================================================
// ============================================================

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, easeInOut } from 'framer-motion'
import { ArrowLeft, Loader2, Mail, AlertCircle } from 'lucide-react'
import authService from '@/services/authService'

const schema = z.object({ email: z.string().email('Enter a valid email address') })
type FormData = z.infer<typeof schema>

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const item    = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeInOut } } }

const fieldLabel      = "block text-xs font-semibold text-gray-700 mb-1.5"
const fieldInput      = "w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all"
const fieldInputError = "w-full px-3 py-2.5 rounded-lg border border-red-300 bg-red-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all"
const fieldError      = "flex items-center gap-1 text-xs text-red-500 mt-1"

export default function ForgotPasswordPage() {
  const [sent, setSent]           = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    await authService.requestPasswordReset(data.email)
    setSentEmail(data.email)
    setSent(true)
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="w-full">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-purple-700 via-amber-400 to-purple-700" />
        <div className="px-8 py-8">

          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-1">
                We've sent a password reset link to
              </p>
              <p className="text-sm font-semibold text-gray-900 mb-6">{sentEmail}</p>
              <p className="text-xs text-gray-400 mb-6">
                Didn't get it? Check your spam folder or try again.
              </p>
              <button onClick={() => setSent(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-stone-200
                           text-sm font-semibold text-gray-700 hover:border-purple-500 hover:text-purple-700
                           transition-all duration-200 mb-3">
                Try a different email
              </button>
              <Link to="/login" className="block text-sm font-semibold text-purple-700 hover:text-purple-900 transition-colors">
                Back to Sign In
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div variants={item} className="mb-7">
                <h1 className="text-3xl font-bold text-gray-900 mb-1.5">Reset password</h1>
                <p className="text-sm text-gray-500">Enter your email and we'll send you a reset link</p>
              </motion.div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <motion.div variants={item}>
                  <label className={fieldLabel}>Email address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input type="email" placeholder="you@example.com" {...register('email')}
                      className={`pl-9 ${errors.email ? fieldInputError : fieldInput}`} />
                  </div>
                  {errors.email && <p className={fieldError}><AlertCircle size={11} />{errors.email.message}</p>}
                </motion.div>

                <motion.div variants={item}>
                  <motion.button type="submit" disabled={isSubmitting}
                    whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                               bg-purple-700 text-white font-bold hover:bg-purple-800 transition-all
                               shadow-md disabled:opacity-60">
                    {isSubmitting
                      ? <><Loader2 size={17} className="animate-spin" /> Sending…</>
                      : 'Send Reset Link'}
                  </motion.button>
                </motion.div>
              </form>

              <motion.div variants={item} className="mt-5">
                <Link to="/login"
                  className="flex items-center justify-center gap-1.5 text-sm font-semibold
                             text-gray-500 hover:text-purple-700 transition-colors">
                  <ArrowLeft size={15} /> Back to Sign In
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}