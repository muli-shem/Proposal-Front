// ============================================================
// ESTATE HUB — PROPERTIES PAGE
// src/pages/Properties/PropertiesPage.tsx
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, SlidersHorizontal, MapPin, X, ChevronDown,
  LayoutGrid, List, Loader2, Building2,
} from 'lucide-react'
import PropertyCard, { PropertyCardSkeleton } from '@/components/property/PropertyCard'
import api from '@/services/api'
import type { Property, PropertyFilters, PaginatedResponse } from '@/types'

// ── Mock data (real API structure) ───────────────────────────
const MOCK_PROPERTIES: Property[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: [
    '4-Bedroom Villa in Karen', 'Modern 2BR Apartment, Westlands',
    'Studio Apartment, Kilimani', 'Penthouse Suite, Upperhill',
    '3BR Townhouse, Lavington', 'Commercial Space, CBD',
    'Beachfront Cottage, Mombasa', '5BR Mansion, Runda',
    '1BR Flat, Ngong Road', 'Serviced Apartment, Parklands',
    'Duplex, South C', 'Land 0.5 Acres, Kitengela',
  ][i],
  description: 'A beautifully designed property in a prime location with modern finishes and spectacular views.',
  listing_type: (['sale','rent','short_stay','sale','rent','sale','short_stay','sale','rent','short_stay','sale','sale'] as const)[i],
  property_type: ['apartment','villa','studio','penthouse','townhouse','commercial','cottage','mansion','flat','serviced','duplex','land'][i],
  price: [18500000,85000,45000,250000,120000,350000,8000,75000000,35000,95000,65000,4200000][i],
  price_currency: 'KES',
  price_per: ([undefined,'month',undefined,undefined,'month',undefined,'night',undefined,'month','month','month',undefined] as const)[i],
  is_negotiable: [true,false,false,true,false,true,false,true,false,false,true,true][i],
  bedrooms: [4,2,0,4,3,0,2,5,1,1,3,0][i],
  bathrooms: [3,2,1,4,3,2,1,6,1,1,2,0][i],
  size: [350,95,42,280,190,450,80,620,55,75,140,2000][i],
  size_unit: 'm²',
  city: ['Nairobi','Nairobi','Nairobi','Nairobi','Nairobi','Nairobi','Mombasa','Nairobi','Nairobi','Nairobi','Nairobi','Kajiado'][i],
  county: 'Nairobi',
  neighborhood: ['Karen','Westlands','Kilimani','Upperhill','Lavington','CBD','','Runda','Ngong Road','Parklands','South C',''][i],
  is_verified: [true,true,false,true,false,true,false,true,false,true,false,false][i],
  is_featured: [true,false,false,true,false,false,false,true,false,false,false,false][i],
  status: 'published',
  cover_image_url: `https://picsum.photos/seed/prop${i+1}/800/500`,
  agency: {
    id: (i % 4) + 1,
    name: ['Optiven Real Estate','Hass Consult','Knight Frank Kenya','Pam Golding Properties'][i % 4],
    logo_url: undefined,
    is_verified: true,
    city: 'Nairobi',
  },
  like_count: Math.floor(Math.random() * 80),
  save_count: Math.floor(Math.random() * 40),
  comment_count: Math.floor(Math.random() * 15),
  view_count: Math.floor(Math.random() * 300) + 50,
  is_liked: false,
  is_saved: false,
  created_at: new Date(Date.now() - i * 86400000 * 3).toISOString(),
  updated_at: new Date().toISOString(),
}))

// ── Constants ────────────────────────────────────────────────
const LISTING_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
  { value: 'short_stay', label: 'Short Stay' },
]
const PROPERTY_TYPES = [
  { value: '', label: 'Any Property' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
  { value: 'studio', label: 'Studio' },
]
const CITIES = ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Machakos']
const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest First' },
  { value: 'created_at',  label: 'Oldest First' },
  { value: 'price',       label: 'Price: Low → High' },
  { value: '-price',      label: 'Price: High → Low' },
  { value: '-like_count', label: 'Most Liked' },
  { value: '-view_count', label: 'Most Viewed' },
]
const BEDROOM_OPTIONS = [
  { value: '', label: 'Any Beds' },
  { value: '1', label: '1+ bed' },
  { value: '2', label: '2+ beds' },
  { value: '3', label: '3+ beds' },
  { value: '4', label: '4+ beds' },
  { value: '5', label: '5+ beds' },
]

// ── Sub-components ───────────────────────────────────────────
function StyledSelect({
  value, onChange, options, icon, className = '',
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none bg-white border border-stone-200 rounded-xl py-2.5 pr-8 text-sm text-gray-900
                    focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100
                    transition-all cursor-pointer ${icon ? 'pl-8' : 'pl-3'}`}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
      className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold rounded-full"
    >
      {label}
      <button onClick={onRemove} className="hover:text-purple-900"><X size={11} /></button>
    </motion.span>
  )
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-20 h-20 rounded-3xl bg-purple-50 flex items-center justify-center mb-5">
        <Building2 size={36} className="text-purple-300" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">No properties found</h3>
      <p className="text-gray-500 text-sm max-w-xs mb-6">Try adjusting your search filters.</p>
      <button onClick={onReset}
        className="px-5 py-2.5 bg-purple-700 text-white text-sm font-semibold rounded-xl hover:bg-purple-800 transition-colors">
        Clear all filters
      </button>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [search,       setSearch]       = useState(searchParams.get('search') || '')
  const [listingType,  setListingType]  = useState(searchParams.get('listing_type') || '')
  const [propertyType, setPropertyType] = useState(searchParams.get('property_type') || '')
  const [city,         setCity]         = useState(searchParams.get('city') || '')
  const [bedrooms,     setBedrooms]     = useState(searchParams.get('bedrooms') || '')
  const [minPrice,     setMinPrice]     = useState(searchParams.get('min_price') || '')
  const [maxPrice,     setMaxPrice]     = useState(searchParams.get('max_price') || '')
  const [ordering,     setOrdering]     = useState(searchParams.get('ordering') || '-created_at')
  const [showFilters,  setShowFilters]  = useState(false)
  const [viewMode,     setViewMode]     = useState<'grid' | 'list'>('grid')

  const [properties,  setProperties]  = useState<Property[]>([])
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalCount,  setTotalCount]  = useState(0)
  const [page,        setPage]        = useState(1)
  const [hasMore,     setHasMore]     = useState(false)

  const applyMockFilters = useCallback((filters: PropertyFilters, append: boolean) => {
    let filtered = [...MOCK_PROPERTIES]
    if (filters.search) {
      const q = filters.search.toLowerCase()
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.neighborhood || '').toLowerCase().includes(q)
      )
    }
    if (filters.listing_type) filtered = filtered.filter((p) => p.listing_type === filters.listing_type)
    if (filters.property_type) filtered = filtered.filter((p) => p.property_type === filters.property_type)
    if (filters.city) filtered = filtered.filter((p) => p.city.toLowerCase() === filters.city!.toLowerCase())
    if (filters.bedrooms) filtered = filtered.filter((p) => p.bedrooms >= filters.bedrooms!)
    if (filters.min_price) filtered = filtered.filter((p) => p.price >= filters.min_price!)
    if (filters.max_price) filtered = filtered.filter((p) => p.price <= filters.max_price!)
    if (filters.ordering === 'price') filtered.sort((a, b) => a.price - b.price)
    else if (filters.ordering === '-price') filtered.sort((a, b) => b.price - a.price)
    else if (filters.ordering === '-like_count') filtered.sort((a, b) => (b.like_count??0) - (a.like_count??0))
    else filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const pageSize = 12
    const start = ((filters.page || 1) - 1) * pageSize
    const paginated = filtered.slice(start, start + pageSize)
    setProperties((prev) => append ? [...prev, ...paginated] : paginated)
    setTotalCount(filtered.length)
    setHasMore(start + pageSize < filtered.length)
  }, [])

  const fetchProperties = useCallback(async (filters: PropertyFilters, append = false) => {
    try {
      if (!append) setLoading(true); else setLoadingMore(true)
      try {
        const res = await api.get<PaginatedResponse<Property>>('/properties/', { params: filters })
        setProperties((prev) => append ? [...prev, ...res.data.results] : res.data.results)
        setTotalCount(res.data.count)
        setHasMore(!!res.data.next)
      } catch {
        applyMockFilters(filters, append)
      }
    } finally {
      setLoading(false); setLoadingMore(false)
    }
  }, [applyMockFilters])

  const buildFilters = useCallback((): PropertyFilters => ({
    ...(search && { search }),
    ...(listingType && { listing_type: listingType }),
    ...(propertyType && { property_type: propertyType }),
    ...(city && { city }),
    ...(bedrooms && { bedrooms: Number(bedrooms) }),
    ...(minPrice && { min_price: Number(minPrice) }),
    ...(maxPrice && { max_price: Number(maxPrice) }),
    ordering, page: 1, page_size: 12,
  }), [search, listingType, propertyType, city, bedrooms, minPrice, maxPrice, ordering])

  useEffect(() => {
    setPage(1)
    fetchProperties(buildFilters())
    const params: Record<string, string> = {}
    if (search) params.search = search
    if (listingType) params.listing_type = listingType
    if (propertyType) params.property_type = propertyType
    if (city) params.city = city
    if (bedrooms) params.bedrooms = bedrooms
    if (minPrice) params.min_price = minPrice
    if (maxPrice) params.max_price = maxPrice
    if (ordering !== '-created_at') params.ordering = ordering
    setSearchParams(params, { replace: true })
  }, [search, listingType, propertyType, city, bedrooms, minPrice, maxPrice, ordering])

  const loadMore = async () => {
    const next = page + 1; setPage(next)
    await fetchProperties({ ...buildFilters(), page: next }, true)
  }

  const resetFilters = () => {
    setSearch(''); setListingType(''); setPropertyType(''); setCity('')
    setBedrooms(''); setMinPrice(''); setMaxPrice(''); setOrdering('-created_at')
    setShowFilters(false)
  }

  const activeFilters = [listingType, propertyType, city, bedrooms, minPrice, maxPrice].filter(Boolean).length

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Sticky header ─────────────────────────────────── */}
      <div className="bg-white border-b border-stone-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">

            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, city, neighbourhood…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm
                           text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-500
                           focus:ring-2 focus:ring-purple-100 transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Listing type tabs */}
            <div className="hidden md:flex items-center bg-stone-100 border border-stone-200 rounded-xl p-1 gap-0.5">
              {LISTING_TYPES.map((t) => (
                <button key={t.value} onClick={() => setListingType(t.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    listingType === t.value
                      ? 'bg-white shadow-sm text-purple-700'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Filter toggle */}
            <button onClick={() => setShowFilters((v) => !v)}
              className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                showFilters || activeFilters > 0
                  ? 'bg-purple-700 text-white border-purple-700'
                  : 'bg-white border-stone-200 text-gray-700 hover:border-purple-400 hover:text-purple-700'
              }`}
            >
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline">Filters</span>
              {activeFilters > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-purple-700 text-[10px] font-bold flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>

            {/* Sort */}
            <StyledSelect value={ordering} onChange={setOrdering} options={SORT_OPTIONS} className="hidden sm:block w-44" />

            {/* View mode */}
            <div className="hidden sm:flex items-center bg-stone-100 border border-stone-200 rounded-xl p-1">
              {(['grid', 'list'] as const).map((m) => (
                <button key={m} onClick={() => setViewMode(m)}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === m
                      ? 'bg-white shadow-sm text-purple-700'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {m === 'grid' ? <LayoutGrid size={15} /> : <List size={15} />}
                </button>
              ))}
            </div>
          </div>

          {/* Expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 pb-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  <StyledSelect value={propertyType} onChange={setPropertyType} options={PROPERTY_TYPES} />
                  <StyledSelect value={city} onChange={setCity}
                    options={[{ value: '', label: 'Any City' }, ...CITIES.map((c) => ({ value: c, label: c }))]}
                    icon={<MapPin size={13} />}
                  />
                  <StyledSelect value={bedrooms} onChange={setBedrooms} options={BEDROOM_OPTIONS} />
                  <input type="number" placeholder="Min price (KES)" value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-gray-900
                               placeholder:text-gray-400 focus:outline-none focus:border-purple-500
                               focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                  <input type="number" placeholder="Max price (KES)" value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-gray-900
                               placeholder:text-gray-400 focus:outline-none focus:border-purple-500
                               focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">

        {/* Results bar */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {!loading && (
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{totalCount.toLocaleString()}</span> properties
              </p>
            )}
            <AnimatePresence>
              {listingType  && <FilterPill label={LISTING_TYPES.find((t) => t.value === listingType)?.label  || listingType}  onRemove={() => setListingType('')}  />}
              {propertyType && <FilterPill label={PROPERTY_TYPES.find((t) => t.value === propertyType)?.label || propertyType} onRemove={() => setPropertyType('')} />}
              {city         && <FilterPill label={city}                                                                         onRemove={() => setCity('')}         />}
              {bedrooms     && <FilterPill label={`${bedrooms}+ beds`}                                                          onRemove={() => setBedrooms('')}     />}
              {minPrice     && <FilterPill label={`Min KES ${Number(minPrice).toLocaleString()}`}                               onRemove={() => setMinPrice('')}     />}
              {maxPrice     && <FilterPill label={`Max KES ${Number(maxPrice).toLocaleString()}`}                               onRemove={() => setMaxPrice('')}     />}
              {activeFilters > 0 && (
                <button onClick={resetFilters}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium flex items-center gap-1">
                  <X size={11} /> Clear all
                </button>
              )}
            </AnimatePresence>
          </div>
          <StyledSelect value={ordering} onChange={setOrdering} options={SORT_OPTIONS} className="sm:hidden w-36" />
        </div>

        {/* Grid */}
        {loading ? (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {Array.from({ length: 12 }).map((_, i) => <PropertyCardSkeleton key={i} variant="card" />)}
          </div>
        ) : properties.length === 0 ? (
          <EmptyState onReset={resetFilters} />
        ) : (
          <>
            <motion.div layout
              className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
              <AnimatePresence mode="popLayout">
                {properties.map((property, i) => (
                  <motion.div key={property.id} layout
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i < 12 ? i * 0.04 : 0 }}
                  >
                    <PropertyCard property={property} variant="card" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button onClick={loadMore} disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-purple-200 text-purple-700
                             font-semibold rounded-2xl hover:bg-purple-50 hover:border-purple-400 transition-all
                             shadow-sm disabled:opacity-60"
                >
                  {loadingMore
                    ? <><Loader2 size={16} className="animate-spin" /> Loading…</>
                    : 'Load more properties'
                  }
                </button>
              </div>
            )}

            {!hasMore && properties.length > 0 && (
              <div className="flex items-center justify-center mt-10 gap-3">
                <div className="h-px flex-1 bg-stone-200 max-w-24" />
                <p className="text-xs text-gray-400 font-medium">
                  All {totalCount} properties shown
                </p>
                <div className="h-px flex-1 bg-stone-200 max-w-24" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}