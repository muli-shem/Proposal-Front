// ESTATE HUB - HOW IT WORKS
import { motion } from 'framer-motion'
import { Search, ShieldCheck, CalendarCheck, BadgeCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

const STEPS = [
  {
    step: '01', icon: Search, title: 'Discover',
    desc: 'Search thousands of verified listings across Kenya. Filter by city, type, price, and more.',
    color: 'bg-purple-50 text-purple-700',
  },
  {
    step: '02', icon: ShieldCheck, title: 'Verify',
    desc: 'Every property is reviewed. See verification badges, agency ratings, and full documentation.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    step: '03', icon: CalendarCheck, title: 'Book',
    desc: 'Schedule a viewing or request a booking directly through the platform. No phone tag.',
    color: 'bg-slate-100 text-slate-600',
  },
  {
    step: '04', icon: BadgeCheck, title: 'Transact',
    desc: 'Complete your transaction securely through our escrow system. Funds released only when you confirm.',
    color: 'bg-amber-50 text-amber-600',
  },
]

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-3">
            Simple Process
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How Estate Hub Works
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            From discovery to ownership — a clear, transparent, and secure process.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-stone-200" />

          {STEPS.map(({ step, icon: Icon, title, desc, color }, i) => (
            <motion.div key={step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative mb-6">
                <div className={`w-20 h-20 rounded-2xl ${color} flex items-center justify-center shadow-sm relative z-10`}>
                  <Icon size={28} />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-purple-700 text-white text-xs font-bold flex items-center justify-center z-20">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-14">
          <Link to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-purple-700 text-white font-bold text-base hover:bg-purple-800 transition-all shadow-md">
            Get Started Free
          </Link>
        </div>
      </div>
    </section>
  )
}