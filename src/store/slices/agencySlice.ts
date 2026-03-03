// ============================================================
// ESTATE HUB — AGENCY SLICE
// frontend/src/store/slices/agencySlice.ts
// ============================================================

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface Agency {
  id: string
  name: string
  logo: string | null
  description: string
  license_no: string
  verification_status: 'pending' | 'verified' | 'rejected'
  rating: number
  total_listings: number
  location: string
}

interface AgencyState {
  currentAgency: Agency | null
  followedAgencies: string[]
}

const initialState: AgencyState = {
  currentAgency:   null,
  followedAgencies: [],
}

const agencySlice = createSlice({
  name: 'agency',
  initialState,
  reducers: {
    setCurrentAgency: (state, action: PayloadAction<Agency>) => {
      state.currentAgency = action.payload
    },
    toggleFollow: (state, action: PayloadAction<string>) => {
      const id = action.payload
      if (state.followedAgencies.includes(id)) {
        state.followedAgencies = state.followedAgencies.filter(i => i !== id)
      } else {
        state.followedAgencies.push(id)
      }
    },
  },
})

export const { setCurrentAgency, toggleFollow } = agencySlice.actions
export default agencySlice.reducer