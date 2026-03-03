// ============================================================
// ESTATE HUB — PROPERTY SLICE
// src/store/slices/propertySlice.ts
// ============================================================

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface PropertyState {
  savedProperties: number[]
  likedProperties: number[]
  activeFilters:   Record<string, unknown>
}

const initialState: PropertyState = {
  savedProperties: [],
  likedProperties: [],
  activeFilters:   {},
}

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    toggleSaved(state, action: PayloadAction<number>) {
      const id  = action.payload
      const idx = state.savedProperties.indexOf(id)
      if (idx >= 0) state.savedProperties.splice(idx, 1)
      else          state.savedProperties.push(id)
    },

    toggleLiked(state, action: PayloadAction<number>) {
      const id  = action.payload
      const idx = state.likedProperties.indexOf(id)
      if (idx >= 0) state.likedProperties.splice(idx, 1)
      else          state.likedProperties.push(id)
    },

    setSavedProperties(state, action: PayloadAction<number[]>) {
      state.savedProperties = action.payload
    },

    setActiveFilters(state, action: PayloadAction<Record<string, unknown>>) {
      state.activeFilters = action.payload
    },

    clearFilters(state) {
      state.activeFilters = {}
    },
  },
})

export const {
  toggleSaved,
  toggleLiked,
  setSavedProperties,
  setActiveFilters,
  clearFilters,
} = propertySlice.actions
export default propertySlice.reducer