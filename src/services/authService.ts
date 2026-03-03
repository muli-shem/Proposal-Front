// ============================================================
// ESTATE HUB — AUTH SERVICE
// src/services/authService.ts
// ============================================================

import api, {
  setStoredTokens,
  setStoredUser,
  clearStoredTokens,
} from './api'
import type { LoginPayload, RegisterPayload, User } from '@/types/index'

const authService = {
  // ── Login ──────────────────────────────────────────────────
  async login(payload: LoginPayload) {
    const { data } = await api.post('/auth/login/', payload)
    setStoredTokens(data.access, data.refresh)
    // Fetch profile after login
    const profile = await authService.getProfile()
    setStoredUser(profile)
    return { tokens: { access: data.access, refresh: data.refresh }, user: profile }
  },

  // ── Register ───────────────────────────────────────────────
  async register(payload: RegisterPayload) {
    const { data } = await api.post('/auth/register/', payload)
    return data
  },

  // ── Logout ─────────────────────────────────────────────────
  async logout() {
    try {
      await api.post('/auth/logout/')
    } catch {
      // Ignore errors on logout
    } finally {
      clearStoredTokens()
    }
  },

  // ── Get Profile ────────────────────────────────────────────
  async getProfile(): Promise<User> {
    const { data } = await api.get('/auth/profile/')
    return data
  },

  // ── Update Profile ─────────────────────────────────────────
  async updateProfile(payload: Partial<User>) {
    const { data } = await api.patch('/auth/profile/', payload)
    setStoredUser(data)
    return data
  },

  // ── Verify Email ───────────────────────────────────────────
  async verifyEmail(token: string) {
    const { data } = await api.get(`/auth/verify-email/?token=${token}`)
    return data
  },

  // ── Request Password Reset ─────────────────────────────────
  async requestPasswordReset(email: string) {
    const { data } = await api.post('/auth/password/reset/', { email })
    return data
  },

  // ── Confirm Password Reset ─────────────────────────────────
  async confirmPasswordReset(payload: {
    token: string
    new_password: string
    new_password_confirm: string
  }) {
    const { data } = await api.post('/auth/password/reset/confirm/', payload)
    return data
  },

  // ── Change Password ────────────────────────────────────────
  async changePassword(payload: {
    old_password: string
    new_password: string
    new_password_confirm: string
  }) {
    const { data } = await api.post('/auth/password/change/', payload)
    return data
  },
}

export default authService