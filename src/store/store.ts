// ============================================================
// ESTATE HUB — REDUX STORE
// frontend/src/store/store.ts
// ============================================================

import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import propertyReducer from './slices/propertySlice'
import agencyReducer from './slices/agencySlice'
import feedReducer from './slices/feedSlice'
import notificationReducer from './slices/notificationSlice'
import chatReducer from './slices/chatSlice'

export const store = configureStore({
  reducer: {
    auth:         authReducer,
    property:     propertyReducer,
    agency:       agencyReducer,
    feed:         feedReducer,
    notification: notificationReducer,
    chat:         chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths for non-serializable values
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState   = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch