// ============================================================
// ESTATE HUB — CHAT SLICE
// frontend/src/store/slices/chatSlice.ts
// ============================================================

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
  read: boolean
}

interface Conversation {
  id: string
  other_user_name: string
  other_user_avatar: string | null
  last_message: string
  unread_count: number
  property_id: string | null
}

interface ChatState {
  conversations:       Conversation[]
  activeConversation:  string | null
  messages:            Record<string, Message[]>
  unreadTotal:         number
}

const initialState: ChatState = {
  conversations:      [],
  activeConversation: null,
  messages:           {},
  unreadTotal:        0,
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload
      state.unreadTotal   = action.payload.reduce((sum, c) => sum + c.unread_count, 0)
    },
    setActiveConversation: (state, action: PayloadAction<string>) => {
      state.activeConversation = action.payload
    },
    setMessages: (state, action: PayloadAction<{ conversationId: string; messages: Message[] }>) => {
      state.messages[action.payload.conversationId] = action.payload.messages
    },
    addMessage: (state, action: PayloadAction<{ conversationId: string; message: Message }>) => {
      const { conversationId, message } = action.payload
      if (!state.messages[conversationId]) state.messages[conversationId] = []
      state.messages[conversationId].push(message)
    },
  },
})

export const {
  setConversations,
  setActiveConversation,
  setMessages,
  addMessage,
} = chatSlice.actions

export default chatSlice.reducer
