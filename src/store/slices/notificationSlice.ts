// ============================================================
// ESTATE HUB — NOTIFICATION SLICE
// frontend/src/store/slices/notificationSlice.ts
// ============================================================

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  read_status: boolean
  created_at: string
}

interface NotificationState {
  items:       Notification[]
  unreadCount: number
}

const initialState: NotificationState = {
  items:       [],
  unreadCount: 0,
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.items       = action.payload
      state.unreadCount = action.payload.filter(n => !n.read_status).length
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload)
      if (!action.payload.read_status) state.unreadCount += 1
    },
    markAllRead: (state) => {
      state.items       = state.items.map(n => ({ ...n, read_status: true }))
      state.unreadCount = 0
    },
  },
})

export const { setNotifications, addNotification, markAllRead } = notificationSlice.actions
export default notificationSlice.reducer


