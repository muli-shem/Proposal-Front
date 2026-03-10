// ============================================================
// ESTATE HUB — HERO SECTION
// src/components/HeroSection.tsx
// ============================================================
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, MapPin, ChevronDown, ArrowRight } from 'lucide-react'

const TABS       = ['Buy', 'Rent', 'Short Stay']
const PROP_TYPES = ['Any Type','Apartment','House','Villa','Land','Commercial','Office']
const BUDGETS    = ['Any Budget','Under KES 1M','KES 1M-5M','KES 5M-15M','KES 15M-50M','KES 50M+']
const STATS      = [
  { value: '12,400+', label: 'Listings'  },
  { value: '840+',    label: 'Agencies'  },
  { value: '47',      label: 'Counties'  },
  { value: '98%',     label: 'Verified'  },
]

export default function HeroSection() {
  const navigate = useNavigate()
  const [tab,    setTab]    = useState('Buy')
  const [city,   setCity]   = useState('')
  const [type,   setType]   = useState('Any Type')
  const [budget, setBudget] = useState('Any Budget')

  const handleSearch = () => {
    const p = new URLSearchParams()
    p.set('listing_type', tab === 'Rent' ? 'rent' : tab === 'Short Stay' ? 'short_stay' : 'sale')
    if (city.trim()) p.set('search', city.trim())
    if (type !== 'Any Type') p.set('property_type', type.toLowerCase())
    navigate('/properties?' + p.toString())
  }

  const fieldInput = "w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all"

  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-stone-50 to-purple-50">

      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #1e3a5f, transparent)' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 flex flex-col items-center text-center">

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white border border-purple-200 rounded-full px-4 py-1.5 shadow-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-purple-700 animate-pulse" />
          <span className="text-xs font-bold text-purple-700 tracking-wide uppercase">
            Africa's Premier Property Marketplace
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6 max-w-4xl">
          Find Your{' '}
          <span className="text-purple-700 italic">Dream Home</span>
          <br />in Kenya
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.16 }}
          className="text-gray-500 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Browse verified properties from trusted agencies across Kenya.
          Buy, rent, or find the perfect short stay.
        </motion.p>

        {/* Search box */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.24 }}
          className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">

          <div className="flex border-b border-stone-100">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-3.5 text-sm font-bold transition-all ${
                  tab === t
                    ? 'text-purple-700 border-b-2 border-purple-700 bg-purple-50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-stone-50'
                }`}>
                {t}
              </button>
            ))}
          </div>

          <div className="p-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-600 pointer-events-none" />
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="City, estate, or area..."
                className={`${fieldInput} pl-9 h-12`} />
            </div>
            <div className="relative sm:w-44">
              <select value={type} onChange={(e) => setType(e.target.value)}
                className={`${fieldInput} h-12 pr-8 appearance-none cursor-pointer`}>
                {PROP_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative sm:w-44">
              <select value={budget} onChange={(e) => setBudget(e.target.value)}
                className={`${fieldInput} h-12 pr-8 appearance-none cursor-pointer`}>
                {BUDGETS.map((b) => <option key={b}>{b}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <motion.button onClick={handleSearch}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-5 h-12 rounded-lg bg-purple-700 text-white font-bold text-sm hover:bg-purple-800 transition-all shadow-md flex-shrink-0">
              <Search size={16} />
              <span className="hidden sm:inline">Search</span>
            </motion.button>
          </div>

          <div className="px-4 pb-4 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 font-medium">Popular:</span>
            {['Nairobi','Mombasa','Westlands','Karen','Kileleshwa','Kilimani'].map((q) => (
              <button key={q} onClick={() => navigate('/properties?search=' + q)}
                className="text-xs text-purple-700 font-semibold hover:underline transition-colors">
                {q}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.36 }}
          className="flex items-center gap-8 mt-12 flex-wrap justify-center">
          {STATS.map(({ value, label }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.07 }} className="text-center">
              <p className="font-mono font-bold text-2xl text-purple-700">{value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-400">
          <span className="text-xs font-medium">Scroll to explore</span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>
            <ArrowRight size={14} className="rotate-90" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

