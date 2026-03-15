// ============================================================
// ESTATE HUB — MESSAGES PAGE
// src/pages/Dashboard/sub/MessagesPage.tsx
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Send, Search, Loader2,
  ArrowLeft, Building2, X,
} from 'lucide-react'
import api from '@/services/api'
import { useAppSelector } from '@/store/hooks'
import { getInitials, timeAgo } from '@/utils/format'
import type { Conversation, Message } from '@/types'

// ── Mock data ─────────────────────────────────────────────────
const MOCK_CONVERSATIONS: Conversation[] = [
  { id: 1, participants: [{ id: 1, full_name: 'James Mwangi', avatar_url: undefined }, { id: 99, full_name: 'You', avatar_url: undefined }], property: { id: 50, title: 'Karen Villa 4BR', cover_image_url: 'https://picsum.photos/seed/sv1/60/60' }, last_message: { id: 10, sender: { id: 1, full_name: 'James Mwangi', avatar_url: undefined }, body: 'Hi! The property is still available. When would you like to view it?', created_at: new Date(Date.now() - 3600000).toISOString() }, unread_count: 2, updated_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, participants: [{ id: 2, full_name: 'Aisha Omondi', avatar_url: undefined }, { id: 99, full_name: 'You', avatar_url: undefined }], property: { id: 51, title: 'Westlands Penthouse', cover_image_url: 'https://picsum.photos/seed/sv2/60/60' }, last_message: { id: 20, sender: { id: 99, full_name: 'You', avatar_url: undefined }, body: "Thank you, I'll confirm by tomorrow.", created_at: new Date(Date.now() - 86400000).toISOString() }, unread_count: 0, updated_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, participants: [{ id: 3, full_name: 'Brian Kipchoge', avatar_url: undefined }, { id: 99, full_name: 'You', avatar_url: undefined }], property: { id: 52, title: 'Kilimani 3BR', cover_image_url: 'https://picsum.photos/seed/sv3/60/60' }, last_message: { id: 30, sender: { id: 3, full_name: 'Brian Kipchoge', avatar_url: undefined }, body: 'The service charge is KES 8,000 per month inclusive of water.', created_at: new Date(Date.now() - 2 * 86400000).toISOString() }, unread_count: 1, updated_at: new Date(Date.now() - 2 * 86400000).toISOString() },
]

const MOCK_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, sender: { id: 99, full_name: 'You', avatar_url: undefined }, body: "Hi, I'm interested in the Karen Villa. Is it still available?", created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 2, sender: { id: 1,  full_name: 'James Mwangi', avatar_url: undefined }, body: "Yes, the property is still available! It's a stunning 4-bedroom villa on half an acre in Karen.", created_at: new Date(Date.now() - 5400000).toISOString() },
    { id: 3, sender: { id: 99, full_name: 'You', avatar_url: undefined }, body: "Great! What's the best time to schedule a viewing?", created_at: new Date(Date.now() - 4200000).toISOString() },
    { id: 4, sender: { id: 1,  full_name: 'James Mwangi', avatar_url: undefined }, body: 'Hi! The property is still available. When would you like to view it?', created_at: new Date(Date.now() - 3600000).toISOString() },
  ],
  2: [
    { id: 5, sender: { id: 2,  full_name: 'Aisha Omondi', avatar_url: undefined }, body: "Hello! Thank you for your interest in the Westlands Penthouse. It's a spectacular 4-bedroom unit with rooftop access.", created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 6, sender: { id: 99, full_name: 'You', avatar_url: undefined }, body: "Thank you, I'll confirm by tomorrow.", created_at: new Date(Date.now() - 86400000).toISOString() },
  ],
  3: [
    { id: 7, sender: { id: 99, full_name: 'You', avatar_url: undefined }, body: "What's the monthly service charge for the Kilimani apartment?", created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 8, sender: { id: 3,  full_name: 'Brian Kipchoge', avatar_url: undefined }, body: 'The service charge is KES 8,000 per month inclusive of water.', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  ],
}

export default function MessagesPage() {
  const { user }                          = useAppSelector((s) => s.auth)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages,      setMessages]      = useState<Message[]>([])
  const [activeConv,    setActiveConv]    = useState<Conversation | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [msgLoading,    setMsgLoading]    = useState(false)
  const [body,          setBody]          = useState('')
  const [sending,       setSending]       = useState(false)
  const [search,        setSearch]        = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get('/messaging/conversations/')
        setConversations(res.data.results ?? [])
      } catch {
        setConversations(MOCK_CONVERSATIONS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!activeConv) return
    const loadMessages = async () => {
      setMsgLoading(true)
      try {
        const res = await api.get(`/messaging/conversations/${activeConv.id}/`)
        setMessages(res.data.messages ?? [])
        setConversations((prev) => prev.map((c) => c.id === activeConv.id ? { ...c, unread_count: 0 } : c))
      } catch {
        setMessages(MOCK_MESSAGES[activeConv.id] ?? [])
        setConversations((prev) => prev.map((c) => c.id === activeConv.id ? { ...c, unread_count: 0 } : c))
      } finally {
        setMsgLoading(false)
      }
    }
    loadMessages()
  }, [activeConv?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!body.trim() || !activeConv) return
    setSending(true)
    const optimistic: Message = {
      id: Date.now(),
      sender: { id: user?.id ?? 0, full_name: user ? `${user.first_name} ${user.last_name}` : 'You', avatar_url: undefined },
      body: body.trim(),
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])
    setConversations((prev) => prev.map((c) =>
      c.id === activeConv.id ? { ...c, last_message: optimistic, updated_at: new Date().toISOString() } : c
    ))
    const sent = body.trim()
    setBody('')
    try {
      await api.post(`/messaging/conversations/${activeConv.id}/send/`, { body: sent, message_type: 'text' })
    } catch { /* optimistic ok */ }
    setSending(false)
  }

  const filteredConvs = search
    ? conversations.filter((c) =>
        (c.property?.title ?? '').toLowerCase().includes(search.toLowerCase()) ||
        c.participants.some((p) => p.full_name.toLowerCase().includes(search.toLowerCase()))
      )
    : conversations

  const otherParticipant = (c: Conversation) =>
    c.participants.find((p) => p.id !== (user?.id ?? 0)) ?? c.participants[0]

  const totalUnread = conversations.reduce((n, c) => n + c.unread_count, 0)

  return (
    <div className="py-4 px-0 sm:px-2">

      {/* Header */}
      <div className="flex items-center gap-2 mb-5 px-1">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        {totalUnread > 0 && (
          <span className="px-2 py-0.5 bg-purple-700 text-white text-xs font-bold rounded-full">
            {totalUnread}
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden"
           style={{ height: 'calc(100vh - 220px)', minHeight: 500 }}>
        <div className="flex h-full">

          {/* ── Conversation list ──────────────────────── */}
          <div className={`flex flex-col border-r border-stone-200 ${activeConv ? 'hidden sm:flex' : 'flex'} w-full sm:w-72 flex-shrink-0`}>

            {/* Search */}
            <div className="p-3 border-b border-stone-200">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations…"
                  className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm
                             text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2
                             focus:ring-purple-200 transition-all"
                />
                {search && (
                  <button onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-3 space-y-3">
                  {[1,2,3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-stone-200 animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 rounded bg-stone-200 animate-pulse w-3/4" />
                        <div className="h-2.5 rounded bg-stone-200 animate-pulse w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConvs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MessageSquare size={28} className="text-stone-300 mb-2" />
                  <p className="text-sm text-gray-400">No conversations yet</p>
                </div>
              ) : (
                filteredConvs.map((conv) => {
                  const other    = otherParticipant(conv)
                  const isActive = activeConv?.id === conv.id
                  return (
                    <button key={conv.id} onClick={() => setActiveConv(conv)}
                      className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-stone-50 transition-colors text-left border-b border-stone-100 ${
                        isActive ? 'bg-purple-50' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center overflow-hidden">
                          {other.avatar_url
                            ? <img src={other.avatar_url} alt="" className="w-full h-full object-cover" />
                            : <span className="text-xs font-bold text-purple-700">{getInitials(other.full_name)}</span>
                          }
                        </div>
                        {conv.unread_count > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-700 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-1 mb-0.5">
                          <p className={`text-sm truncate ${conv.unread_count > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-900'}`}>
                            {other.full_name}
                          </p>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {conv.last_message ? timeAgo(conv.last_message.created_at) : ''}
                          </span>
                        </div>
                        {conv.property && (
                          <p className="text-[10px] text-purple-600 font-medium truncate mb-0.5">
                            {conv.property.title}
                          </p>
                        )}
                        {conv.last_message && (
                          <p className={`text-xs truncate ${conv.unread_count > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                            {conv.last_message.sender.id === (user?.id ?? 0) ? 'You: ' : ''}
                            {conv.last_message.body}
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* ── Chat panel ─────────────────────────────── */}
          <div className={`flex-1 flex flex-col ${activeConv ? 'flex' : 'hidden sm:flex'} min-w-0`}>
            {!activeConv ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
                  <MessageSquare size={28} className="text-purple-300" />
                </div>
                <p className="font-semibold text-gray-900 mb-1">Select a conversation</p>
                <p className="text-xs text-gray-400">Choose from your conversations on the left</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-200">
                  <button onClick={() => setActiveConv(null)}
                    className="sm:hidden p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
                    <ArrowLeft size={16} className="text-gray-500" />
                  </button>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <span className="text-xs font-bold text-purple-700">
                      {getInitials(otherParticipant(activeConv).full_name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {otherParticipant(activeConv).full_name}
                    </p>
                    {activeConv.property && (
                      <p className="text-xs text-purple-600 truncate">{activeConv.property.title}</p>
                    )}
                  </div>
                  {activeConv.property && (
                    <a href={`/properties/${activeConv.property.id}`}
                      className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 border border-stone-200 hover:border-purple-300 transition-colors">
                      {activeConv.property.cover_image_url
                        ? <img src={activeConv.property.cover_image_url} alt="" className="w-full h-full object-cover" />
                        : <Building2 size={14} className="text-gray-300 m-auto mt-2.5" />
                      }
                    </a>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {msgLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 size={20} className="animate-spin text-purple-500" />
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {messages.map((msg) => {
                        const isMe = msg.sender.id === (user?.id ?? 0)
                        return (
                          <motion.div key={msg.id}
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isMe && (
                              <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 self-end">
                                <span className="text-[10px] font-bold text-purple-700">
                                  {getInitials(msg.sender.full_name)}
                                </span>
                              </div>
                            )}
                            <div className={`max-w-[72%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                              <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                isMe
                                  ? 'bg-purple-700 text-white rounded-br-sm'
                                  : 'bg-stone-100 text-gray-900 rounded-bl-sm'
                              }`}>
                                {msg.body}
                              </div>
                              <span className="text-[10px] text-gray-400 px-1">{timeAgo(msg.created_at)}</span>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-stone-200">
                  <div className="flex gap-2">
                    <input
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder="Type a message…"
                      className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm
                                 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2
                                 focus:ring-purple-200 transition-all"
                    />
                    <button onClick={handleSend} disabled={!body.trim() || sending}
                      className="w-10 h-10 rounded-xl bg-purple-700 flex items-center justify-center hover:bg-purple-800 transition-colors disabled:opacity-40 flex-shrink-0">
                      {sending
                        ? <Loader2 size={15} className="text-white animate-spin" />
                        : <Send size={15} className="text-white" />
                      }
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}