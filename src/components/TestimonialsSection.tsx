// ESTATE HUB - TESTIMONIALS
import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { getInitials } from '@/utils/format'

const TESTIMONIALS = [
  {
    name: 'James Mwangi',
    role: 'Property Buyer, Nairobi',
    quote: 'Found my dream home in Karen within two weeks. The verified agency listing gave me confidence, and the escrow system made the transaction completely stress-free.',
    rating: 5,
  },
  {
    name: 'Amina Hassan',
    role: 'Agency Owner, Mombasa',
    quote: 'Estate Hub transformed how we reach buyers. Our listings get 10x more engagement than on any other platform, and the verification badge builds instant trust.',
    rating: 5,
  },
  {
    name: 'David Ochieng',
    role: 'Property Developer, Kisumu',
    quote: 'The analytics dashboard is incredible. We can see exactly which listings perform, track leads, and understand the market in real time.',
    rating: 5,
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-3">
            What People Say
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Trusted by Thousands</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, role, quote, rating }, i) => (
            <motion.div key={name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex flex-col gap-4"
            >
              <Quote size={24} className="text-purple-200" />
              <p className="text-sm text-gray-700 leading-relaxed flex-1">{quote}</p>
              <div className="flex items-center gap-1 mb-1">
                {Array(rating).fill(null).map((_, j) => (
                  <Star key={j} size={12} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
                <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {getInitials(name)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{name}</p>
                  <p className="text-xs text-gray-500">{role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}