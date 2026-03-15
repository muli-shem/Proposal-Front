// ============================================================
// ESTATE HUB — FEED SLICE
// frontend/src/store/slices/feedSlice.ts
// ============================================================

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Property } from '@/types/index'

interface FeedState {
  items:      Property[]
  isLoading:  boolean
  hasMore:    boolean
  page:       number
}

const initialState: FeedState = {
  items:     [],
  isLoading: false,
  hasMore:   true,
  page:      1,
}

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    appendFeedItems: (state, action: PayloadAction<Property[]>) => {
      state.items.push(...action.payload)
      if (action.payload.length < 20) state.hasMore = false
    },
    incrementPage: (state) => { state.page += 1 },
    resetFeed:     (state) => { state.items = []; state.page = 1; state.hasMore = true },
    setLoading:    (state, action: PayloadAction<boolean>) => { state.isLoading = action.payload },
  },
})

export const { appendFeedItems, incrementPage, resetFeed, setLoading } = feedSlice.actions
export default feedSlice.reducer