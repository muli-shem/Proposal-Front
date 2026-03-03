// ============================================================
// ESTATE HUB — UTILITIES
// src/utils/format.ts
// ============================================================

/**
 * Format a price as KES 8.5M / KES 120K / KES 85,000
 */
export function formatCurrency(amount: number, currency = 'KES'): string {
  if (!amount && amount !== 0) return '—'
  if (amount >= 1_000_000) {
    const val = (amount / 1_000_000).toFixed(1).replace(/\.0$/, '')
    return `${currency} ${val}M`
  }
  if (amount >= 1_000) {
    const val = (amount / 1_000).toFixed(0)
    return `${currency} ${val}K`
  }
  return `${currency} ${amount.toLocaleString()}`
}

/**
 * Format a full price (always full number, e.g. for detail pages)
 */
export function formatCurrencyFull(amount: number, currency = 'KES'): string {
  return `${currency} ${amount.toLocaleString()}`
}

/**
 * Format a date as "12 Jan 2024"
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  })
}

/**
 * Time ago: "5m ago" / "3h ago" / "2d ago" / "12 Jan 2024"
 */
export function timeAgo(dateStr: string): string {
  if (!dateStr) return ''
  const date  = new Date(dateStr)
  const now   = new Date()
  const diff  = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60)         return 'just now'
  if (diff < 3600)       return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)      return `${Math.floor(diff / 3600)}h ago`
  if (diff < 7 * 86400)  return `${Math.floor(diff / 86400)}d ago`
  return formatDate(dateStr)
}

/**
 * Truncate a string to N characters
 */
export function truncate(str: string, n: number): string {
  if (!str) return ''
  return str.length > n ? str.slice(0, n) + '…' : str
}

/**
 * Get initials from a full name (e.g. "John Doe" → "JD")
 */
export function getInitials(name: string): string {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

/**
 * Format a property listing type for display
 */
export function formatListingType(type: string): string {
  const map: Record<string, string> = {
    sale:       'For Sale',
    rent:       'For Rent',
    short_stay: 'Short Stay',
  }
  return map[type] ?? type
}

/**
 * Pluralize a word
 */
export function pluralize(count: number, word: string, plural?: string): string {
  if (count === 1) return `${count} ${word}`
  return `${count} ${plural ?? word + 's'}`
}

/**
 * Format a number with K/M abbreviations
 */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}