// ============================================================
// ESTATE HUB — AUTH SLICE
// src/store/slices/authSlice.ts
// ============================================================

import { createSlice,type PayloadAction } from '@reduxjs/toolkit'
import type { User, AuthTokens } from '../../types/index'
import { getStoredTokens, getStoredUser } from '../../services/api'

interface AuthState {
  user:            User | null
  tokens:          AuthTokens | null
  isAuthenticated: boolean
  isInitialized:   boolean
}

const initialState: AuthState = {
  user:            getStoredUser(),
  tokens:          getStoredTokens(),
  isAuthenticated: !!getStoredTokens()?.access,
  isInitialized:   false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) {
      state.user            = action.payload.user
      state.tokens          = action.payload.tokens
      state.isAuthenticated = true
      state.isInitialized   = true
    },

    setUser(state, action: PayloadAction<User>) {
      state.user          = action.payload
      state.isInitialized = true
    },

    setInitialized(state) {
      state.isInitialized = true
    },

    logout(state) {
      state.user            = null
      state.tokens          = null
      state.isAuthenticated = false
      state.isInitialized   = true
    },
  },
})

export const { setCredentials, setUser, setInitialized, logout } = authSlice.actions
export default authSlice.reducer