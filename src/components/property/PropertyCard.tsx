// ============================================================
// ESTATE HUB — PROPERTY CARD
// src/components/property/PropertyCard.tsx
// ============================================================

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Heart, Bookmark, MapPin, Bed, Bath,
  Maximize2, CheckCircle2, Building2, MessageSquare,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleSaved, toggleLiked } from '@/store/slices/propertySlice'
import api from '@/services/api'
import toast from 'react-hot-toast'
import { formatCurrency, formatListingType, timeAgo, getInitials } from '@/utils/format'
import type { Property } from '@/types'

interface Props {
  property: Property
  variant?: 'card' | 'post'
}

// ── POST CARD — Facebook-style social feed ────────────────────
function PostCard({ property: p }: { property: Property }) {
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((s) => s.auth)
  const savedIds = useAppSelector((s) => s.property.savedProperties)
  const likedIds = useAppSelector((s) => s.property.likedProperties)
  const [likeCount, setLikeCount] = useState(p.like_count ?? 0)
  const isSaved = savedIds.includes(p.id)
  const isLiked = likedIds.includes(p.id)

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) { toast('Sign in to like properties'); return }
    dispatch(toggleLiked(p.id))
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
    try { await api.post(`/properties/${p.id}/like/`) } catch { dispatch(toggleLiked(p.id)) }
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) { toast('Sign in to save properties'); return }
    dispatch(toggleSaved(p.id))
    try { await api.post(`/properties/${p.id}/save/`) } catch { dispatch(toggleSaved(p.id)) }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-2xl border border-sandDark shadow-warm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="avatar-md flex-shrink-0">
          {p.agency?.logo_url
            ? <img src={p.agency.logo_url} alt={p.agency.name} className="w-full h-full object-cover" />
            : <span className="text-sm font-bold">{getInitials(p.agency?.name || 'EH')}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Link to={`/agencies/${p.agency?.id}`}
              className="text-sm font-bold text-ink-900 hover:text-terra transition-colors truncate">
              {p.agency?.name}
            </Link>
            {p.agency?.is_verified && <CheckCircle2 size={13} className="text-forest flex-shrink-0" />}
          </div>
          <p className="text-xs text-ink-500">{p.city} · {timeAgo(p.created_at)}</p>
        </div>
        <span className={`badge flex-shrink-0 ${
          p.listing_type === 'sale' ? 'badge-sale' :
          p.listing_type === 'rent' ? 'badge-rent' : 'badge-shortstay'
        }`}>{formatListingType(p.listing_type)}</span>
      </div>

      {p.description && (
        <p className="px-4 pb-3 text-sm text-ink-700 line-clamp-2 leading-relaxed">{p.description}</p>
      )}

      {/* Image */}
      <Link to={`/properties/${p.id}`} className="block relative">
        <div className="prop-img-wrap">
          {p.cover_image_url
            ? <img src={p.cover_image_url} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
            : <div className="w-full h-full flex items-center justify-center bg-sand">
                <Building2 size={40} className="text-ink-300" />
              </div>
          }
          {p.is_verified && (
            <div className="absolute top-3 left-3">
              <span className="badge badge-verified"><CheckCircle2 size={10} /> Verified</span>
            </div>
          )}
          {p.is_featured && (
            <div className="absolute top-3 right-3">
              <span className="badge badge-featured">Featured</span>
            </div>
          )}
        </div>
      </Link>

      {/* Price + specs */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="price-tag text-xl">{formatCurrency(p.price, p.price_currency)}</span>
            {p.price_per && <span className="text-xs text-ink-500 ml-1">/{p.price_per}</span>}
            {p.is_negotiable && <span className="ml-2 badge badge-rent">Negotiable</span>}
          </div>
          <Link to={`/properties/${p.id}`} className="btn-engage text-xs flex-shrink-0">Engage →</Link>
        </div>
        <Link to={`/properties/${p.id}`} className="block group">
          <h3 className="font-semibold text-ink-900 text-sm line-clamp-1 group-hover:text-terra transition-colors mb-1">
            {p.title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-ink-500 mb-2">
            <MapPin size={11} />
            <span>{p.neighborhood ? `${p.neighborhood}, ` : ''}{p.city}</span>
          </div>
        </Link>
        <div className="flex items-center gap-4 text-xs text-ink-400">
          {p.bedrooms > 0 && <span className="flex items-center gap-1"><Bed size={12} className="text-ink-300" />{p.bedrooms} bed{p.bedrooms !== 1 ? 's' : ''}</span>}
          {p.bathrooms > 0 && <span className="flex items-center gap-1"><Bath size={12} className="text-ink-300" />{p.bathrooms} bath{p.bathrooms !== 1 ? 's' : ''}</span>}
          {p.size && <span className="flex items-center gap-1"><Maximize2 size={12} className="text-ink-300" />{p.size.toLocaleString()} m²</span>}
        </div>
      </div>

      <div className="mx-4 my-2 h-px bg-sandDark" />

      {/* Social bar */}
      <div className="flex items-center px-2 pb-3 gap-1">
        <motion.button onClick={handleLike} whileTap={{ scale: 0.88 }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex-1 justify-center
            ${isLiked ? 'text-terra bg-terra-50 hover:bg-terra-100' : 'text-ink-500 hover:bg-sand hover:text-ink-900'}`}>
          <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
          <span>{likeCount > 0 ? likeCount : 'Like'}</span>
        </motion.button>

        <Link to={`/properties/${p.id}#comments`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-ink-500 hover:bg-sand hover:text-ink-900 transition-all flex-1 justify-center">
          <MessageSquare size={14} />
          <span>{p.comment_count > 0 ? p.comment_count : 'Comment'}</span>
        </Link>

        <motion.button onClick={handleSave} whileTap={{ scale: 0.88 }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex-1 justify-center
            ${isSaved ? 'text-swahili bg-swahili/5 hover:bg-swahili/10' : 'text-ink-500 hover:bg-sand hover:text-ink-900'}`}>
          <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </motion.button>
      </div>
    </motion.div>
  )
}

// ── GRID CARD — compact for grids ─────────────────────────────
function GridCard({ property: p }: { property: Property }) {
  const dispatch = useAppDispatch()
  const savedIds = useAppSelector((s) => s.property.savedProperties)
  const isSaved  = savedIds.includes(p.id)

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    dispatch(toggleSaved(p.id))
    try { await api.post(`/properties/${p.id}/save/`) } catch { dispatch(toggleSaved(p.id)) }
  }

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
      className="bg-white rounded-xl border border-sandDark shadow-warm-sm overflow-hidden group">
      <Link to={`/properties/${p.id}`} className="block">
        <div className="prop-img-wrap">
          {p.cover_image_url
            ? <img src={p.cover_image_url} alt={p.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
            : <div className="w-full h-full flex items-center justify-center bg-sand">
                <Building2 size={28} className="text-ink-300" />
              </div>
          }
          <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
            {p.is_verified && <span className="badge badge-verified text-xs"><CheckCircle2 size={9} />Verified</span>}
            <span className={`badge text-xs ${p.listing_type === 'sale' ? 'badge-sale' : p.listing_type === 'rent' ? 'badge-rent' : 'badge-shortstay'}`}>
              {formatListingType(p.listing_type)}
            </span>
          </div>
          <motion.button onClick={handleSave} whileTap={{ scale: 0.85 }}
            className={`absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-sm transition-all z-10
              ${isSaved ? 'bg-swahili text-white' : 'bg-white/80 text-ink-500 hover:bg-white'}`}>
            <Bookmark size={13} fill={isSaved ? 'currentColor' : 'none'} />
          </motion.button>
        </div>
        <div className="p-3">
          <span className="price-tag text-base">{formatCurrency(p.price, p.price_currency)}</span>
          <h3 className="text-sm font-semibold text-ink-900 line-clamp-1 mt-1 group-hover:text-terra transition-colors">{p.title}</h3>
          <div className="flex items-center gap-1 text-xs text-ink-500 mt-1 mb-2">
            <MapPin size={10} /><span className="truncate">{p.neighborhood ? `${p.neighborhood}, ` : ''}{p.city}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-ink-400">
            {p.bedrooms > 0 && <span className="flex items-center gap-1"><Bed size={11} />{p.bedrooms}</span>}
            {p.bathrooms > 0 && <span className="flex items-center gap-1"><Bath size={11} />{p.bathrooms}</span>}
            {p.size && <span className="flex items-center gap-1"><Maximize2 size={11} />{p.size}m²</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ── SKELETON ──────────────────────────────────────────────────
export function PropertyCardSkeleton({ variant = 'card' }: { variant?: 'card' | 'post' }) {
  if (variant === 'post') {
    return (
      <div className="bg-white rounded-2xl border border-sandDark shadow-warm overflow-hidden">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="skeleton h-3.5 rounded w-32" />
            <div className="skeleton h-3 rounded w-20" />
          </div>
        </div>
        <div className="skeleton w-full" style={{ aspectRatio: '16/10' }} />
        <div className="p-4 flex flex-col gap-2">
          <div className="skeleton h-5 rounded w-28" />
          <div className="skeleton h-4 rounded w-3/4" />
          <div className="skeleton h-3.5 rounded w-1/2" />
        </div>
      </div>
    )
  }
  return (
    <div className="bg-white rounded-xl border border-sandDark overflow-hidden">
      <div className="skeleton w-full" style={{ aspectRatio: '16/10' }} />
      <div className="p-3 flex flex-col gap-2">
        <div className="skeleton h-4 rounded w-24" />
        <div className="skeleton h-3.5 rounded w-40" />
        <div className="skeleton h-3 rounded w-28" />
      </div>
    </div>
  )
}

// ── MAIN EXPORT ───────────────────────────────────────────────
export default function PropertyCard({ property, variant = 'card' }: Props) {
  if (variant === 'post') return <PostCard property={property} />
  return <GridCard property={property} />
}