// ============================================================
// ESTATE HUB — API SERVICE
// src/services/api.ts
// ============================================================

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor: attach access token ─────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokens = getStoredTokens()
    if (tokens?.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: refresh on 401 ─────────────────────
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject:  (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token as string)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const tokens = getStoredTokens()
      if (!tokens?.refresh) {
        clearStoredTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
          refresh: tokens.refresh,
        })
        const newAccess = response.data.access
        setStoredAccess(newAccess)
        processQueue(null, newAccess)
        originalRequest.headers.Authorization = `Bearer ${newAccess}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearStoredTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ── Token helpers ─────────────────────────────────────────────
export function getStoredTokens(): { access: string; refresh: string } | null {
  try {
    const raw = localStorage.getItem('eh_tokens')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredTokens(access: string, refresh: string) {
  localStorage.setItem('eh_tokens', JSON.stringify({ access, refresh }))
}

export function setStoredAccess(access: string) {
  const tokens = getStoredTokens()
  if (tokens) {
    localStorage.setItem('eh_tokens', JSON.stringify({ ...tokens, access }))
  }
}

export function clearStoredTokens() {
  localStorage.removeItem('eh_tokens')
  localStorage.removeItem('eh_user')
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('eh_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredUser(user: unknown) {
  localStorage.setItem('eh_user', JSON.stringify(user))
}

export default api