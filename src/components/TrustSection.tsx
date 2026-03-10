// ESTATE HUB - TRUST SECTION
import { motion } from 'framer-motion'
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const ESCROW_STEPS = [
  { label: 'Buyer deposits funds', done: true  },
  { label: 'Documents verified',   done: true  },
  { label: 'Both parties confirm', done: true  },
  { label: 'Funds released',       done: false },
]

const TRUST_POINTS = [
  'All agencies are KYC-verified before listing',
  'Title deed verification on every property',
  'Escrow holds funds until transfer is complete',
  'Dispute resolution within 72 hours',
]

export default function TrustSection() {
  return (
    <section className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-6">
              <ShieldCheck size={26} className="text-purple-700" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-3">
              Buyer Protection
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Your money is safe<br />
              <span className="text-purple-700 italic">until you say so</span>
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              Every transaction on Estate Hub goes through our secure escrow system.
              Funds are held in trust and only released when you confirm the property
              transfer is complete — protecting both buyers and sellers.
            </p>
            <ul className="flex flex-col gap-3 mb-8">
              {TRUST_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <Link to="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-700 text-white text-sm font-semibold hover:bg-purple-800 transition-all shadow-sm">
              Start Transacting Safely <ArrowRight size={15} />
            </Link>
          </motion.div>

          {/* Right — escrow visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl border border-stone-200 shadow-lg p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <ShieldCheck size={20} className="text-purple-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Escrow Transaction</p>
                <p className="text-xs text-gray-500">KES 12,500,000 — 3BR Westlands</p>
              </div>
              <span className="ml-auto px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                Active
              </span>
            </div>

            <div className="flex flex-col gap-0">
              {ESCROW_STEPS.map(({ label, done }, i) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      done
                        ? 'bg-emerald-500 text-white'
                        : 'bg-stone-100 border-2 border-stone-200 text-gray-400'
                    }`}>
                      {done
                        ? <CheckCircle2 size={16} />
                        : <span className="text-xs font-bold">{i + 1}</span>
                      }
                    </div>
                    {i < ESCROW_STEPS.length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 ${done ? 'bg-emerald-200' : 'bg-stone-200'}`} />
                    )}
                  </div>
                  <div className="pb-6 pt-1.5">
                    <p className={`text-sm font-semibold ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                      {label}
                    </p>
                    {done
                      ? <p className="text-xs text-emerald-600 mt-0.5">Completed</p>
                      : <p className="text-xs text-gray-400 mt-0.5">Awaiting confirmation</p>
                    }
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 bg-purple-50 rounded-xl p-4 border border-purple-100">
              <p className="text-xs text-gray-700 text-center">
                <strong className="text-purple-700">KES 12,500,000</strong> is securely held in escrow.
                <br />Funds will be released upon final confirmation.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}