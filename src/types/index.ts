// ============================================================
// ESTATE HUB — SHARED TYPES
// src/types/index.ts
// ============================================================

// ─── AUTH ─────────────────────────────────────────────────────
export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  full_name: string
  phone?: string
  role: 'buyer' | 'agent' | 'agency_admin' | 'developer' | 'admin'
  avatar_url?: string
  is_verified: boolean
  agency?: AgencyBasic
  created_at: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  first_name: string
  last_name: string
  email: string
  phone?: string
  password: string
  password_confirm: string
  role: User['role']
}

// ─── AGENCY ───────────────────────────────────────────────────
export interface AgencyBasic {
  id: number
  name: string
  logo_url?: string
  is_verified: boolean
  city?: string
}

export interface Agency extends AgencyBasic {
  description?: string
  phone?: string
  email?: string
  website?: string
  address?: string
  county?: string
  follower_count: number
  listing_count: number
  average_rating: number
  review_count: number
  cover_image_url?: string
  is_featured: boolean
  is_following?: boolean
  agents?: AgentBasic[]
}

export interface AgentBasic {
  id: number
  user: Pick<User, 'id' | 'full_name' | 'avatar_url'>
  title?: string
  is_active: boolean
}

// ─── PROPERTY ─────────────────────────────────────────────────
export interface PropertyMedia {
  id: number
  url: string
  media_type: 'image' | 'video' | 'floor_plan'
  is_cover: boolean
  order: number
}

export interface Property {
  id: number
  title: string
  description?: string
  listing_type: 'sale' | 'rent' | 'short_stay'
  property_type: string
  price: number
  price_currency: string
  price_per?: 'month' | 'night' | 'week'
  is_negotiable: boolean
  bedrooms: number
  bathrooms: number
  size?: number
  size_unit?: string
  city: string
  county?: string
  neighborhood?: string
  address?: string
  latitude?: number
  longitude?: number
  amenities?: string[]
  is_verified: boolean
  is_featured: boolean
  status: 'draft' | 'published' | 'archived'
  cover_image_url?: string
  media?: PropertyMedia[]
  agency: AgencyBasic
  like_count: number
  save_count: number
  comment_count: number
  view_count: number
  is_liked?: boolean
  is_saved?: boolean
  created_at: string
  updated_at: string
}

export interface PropertyFilters {
  listing_type?: string
  property_type?: string
  city?: string
  county?: string
  min_price?: number
  max_price?: number
  bedrooms?: number
  bathrooms?: number
  is_verified?: boolean
  is_featured?: boolean
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface Comment {
  id: number
  user: Pick<User, 'id' | 'full_name' | 'avatar_url'>
  body: string
  created_at: string
}

// ─── BOOKING ──────────────────────────────────────────────────
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'rejected'
  | 'completed'

export interface Booking {
  id: number
  property: Pick<Property, 'id' | 'title' | 'cover_image_url' | 'city'>
  agency: AgencyBasic
  check_in?: string
  check_out?: string
  visit_date?: string
  message?: string
  status: BookingStatus
  created_at: string
}

// ─── PAYMENT ──────────────────────────────────────────────────
export type PaymentStatus =
  | 'initiated'
  | 'held'
  | 'docs_verified'
  | 'buyer_confirmed'
  | 'released'
  | 'disputed'
  | 'refunded'

export interface PaymentTransaction {
  id: number
  property: Pick<Property, 'id' | 'title'>
  amount: number
  currency: string
  status: PaymentStatus
  reference: string
  created_at: string
}

// ─── MESSAGING ────────────────────────────────────────────────
export interface Conversation {
  id: number
  participants: Pick<User, 'id' | 'full_name' | 'avatar_url'>[]
  property?: Pick<Property, 'id' | 'title' | 'cover_image_url'>
  last_message?: Message
  unread_count: number
  updated_at: string
}

export interface Message {
  id: number
  sender: Pick<User, 'id' | 'full_name' | 'avatar_url'>
  body: string
  created_at: string
}

// ─── NOTIFICATION ─────────────────────────────────────────────
export interface Notification {
  id: number
  type: string
  title: string
  body: string
  is_read: boolean
  link?: string
  created_at: string
}

// ─── REEL ─────────────────────────────────────────────────────
export interface Reel {
  id: number
  title: string
  description?: string
  video_url: string
  thumbnail_url?: string
  property?: Pick<Property, 'id' | 'title' | 'price' | 'city' | 'listing_type'>
  agency: AgencyBasic
  like_count: number
  comment_count: number
  is_liked?: boolean
  is_saved?: boolean
  created_at: string
}

// ─── ANALYTICS ────────────────────────────────────────────────
export interface AgencyAnalytics {
  total_views: number
  total_likes: number
  total_leads: number
  total_listings: number
  follower_count: number
  views_chart: { date: string; views: number }[]
  leads_chart: { date: string; leads: number }[]
  top_listings: (Property & { views: number })[]
}

// ─── API RESPONSES ────────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiError {
  message?: string
  detail?: string
  [key: string]: unknown
}