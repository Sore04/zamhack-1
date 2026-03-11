"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Send, MessageCircle, User, ArrowLeft } from "lucide-react"
import { sendDirectMessage, markConversationAsRead } from "@/app/actions/message-actions"

const sessionReadIds = new Set<string>()

interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  role: string | null
}

interface ConversationItem {
  id: string
  otherProfile: Profile | null
  lastMessage: { content: string; created_at: string | null; sender_id: string | null } | null
  unreadCount: number
}

interface Message {
  id: string
  conversation_id: string | null
  sender_id: string | null
  content: string
  created_at: string | null
  is_read: boolean | null
  sender_profile?: { first_name: string | null; last_name: string | null; role: string | null; avatar_url: string | null }
}

interface Props {
  conversations: ConversationItem[]
  activeConversationId: string | null
  activeMessages: Message[]
  activeOtherProfile: Profile | null
  currentUserId: string
}

export function CompanyMessagesClient({ conversations, activeConversationId, activeMessages, activeOtherProfile, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>(activeMessages)
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [mobileView, setMobileView] = useState<"list" | "chat">(activeConversationId ? "chat" : "list")
  const markedReadRef = useRef<Set<string>>(new Set())

  const [unreadMap, setUnreadMap] = useState<Record<string, number>>(
    () => Object.fromEntries(conversations.map((c) => [c.id, sessionReadIds.has(c.id) ? 0 : c.unreadCount]))
  )

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMessages(activeMessages) }, [activeMessages])

  useEffect(() => {
    setUnreadMap((prev) => {
      const next = { ...prev }
      for (const conv of conversations) {
        if (!markedReadRef.current.has(conv.id) && !sessionReadIds.has(conv.id)) {
          next[conv.id] = conv.unreadCount
        } else {
          next[conv.id] = 0
        }
      }
      return next
    })
  }, [conversations])

  useEffect(() => {
    if (!activeConversationId) return
    if (markedReadRef.current.has(activeConversationId)) return
    markedReadRef.current.add(activeConversationId)
    sessionReadIds.add(activeConversationId)
    setUnreadMap((prev) => ({ ...prev, [activeConversationId]: 0 }))
    markConversationAsRead(activeConversationId).then(() => {
      window.dispatchEvent(new Event("messages-read"))
    })
  }, [activeConversationId])

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const handleSelect = (id: string) => {
    setMobileView("chat")
    setUnreadMap((prev) => ({ ...prev, [id]: 0 }))
    window.location.href = `/company/messages?conversation=${id}`
  }

  const handleSend = async () => {
    if (!text.trim() || !activeConversationId) return
    setSending(true)
    const tempId = `temp-${Date.now()}`
    setMessages((prev) => [...prev, {
      id: tempId, conversation_id: activeConversationId, sender_id: currentUserId,
      content: text.trim(), created_at: new Date().toISOString(), is_read: false,
      sender_profile: { first_name: "Me", last_name: "", role: null, avatar_url: null },
    }])
    const sent = text; setText("")
    const result = await sendDirectMessage(activeConversationId, sent)
    if (result.error) {
      toast.error(result.error)
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      setText(sent)
    }
    setSending(false)
  }

  const fmt = (d: string | null) => {
    if (!d) return ""
    const date = new Date(d), now = new Date()
    return date.toDateString() === now.toDateString()
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  const initials = (p: Profile | null) =>
    p ? `${p.first_name?.[0] ?? ""}${p.last_name?.[0] ?? ""}`.toUpperCase() || "?" : "?"

  const name = (p: Profile | null) =>
    p ? [p.first_name, p.last_name].filter(Boolean).join(" ") || "Unknown" : "Unknown"

  return (
    <div style={{ display: "flex", height: "calc(100vh - 128px)", background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid var(--cp-border)", boxShadow: "var(--cp-shadow-sm)" }}>

      {/* Conversation list */}
      <div style={{ width: 300, borderRight: "1px solid var(--cp-border)", display: "flex", flexDirection: "column", flexShrink: 0 }}
        className={mobileView === "chat" ? "hidden md:flex" : "flex"}>
        <div style={{ padding: "1.25rem 1.25rem 1rem", borderBottom: "1px solid #f3f4f6" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--cp-navy)", margin: 0, letterSpacing: "-0.02em" }}>Messages</h1>
          <p style={{ fontSize: "0.775rem", color: "var(--cp-text-muted)", marginTop: 2 }}>
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {conversations.length === 0 ? (
            <div style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
              <MessageCircle size={40} style={{ color: "#e5e7eb", margin: "0 auto 1rem" }} />
              <p style={{ fontSize: "0.875rem", color: "#9ca3af", fontWeight: 500 }}>No messages yet</p>
              <p style={{ fontSize: "0.775rem", color: "#c4c9d4", marginTop: 4 }}>Message students from Talent Search</p>
            </div>
          ) : conversations.map((conv) => {
            const isActive = conv.id === activeConversationId
            const unread = unreadMap[conv.id] ?? 0
            return (
              <button key={conv.id} onClick={() => handleSelect(conv.id)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.875rem 1.25rem",
                background: isActive ? "var(--cp-coral-muted)" : "transparent",
                borderTop: "none", borderRight: "none", borderBottom: "none",
                borderLeft: isActive ? "3px solid var(--cp-coral)" : "3px solid transparent",
                cursor: "pointer", textAlign: "left", transition: "background 0.15s",
              }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <Avatar style={{ width: 40, height: 40 }}>
                    <AvatarImage src={conv.otherProfile?.avatar_url ?? undefined} />
                    <AvatarFallback style={{ background: "var(--cp-grad-coral)", color: "#fff", fontSize: "0.8rem", fontWeight: 700 }}>
                      {initials(conv.otherProfile)}
                    </AvatarFallback>
                  </Avatar>
                  {unread > 0 && (
                    <span style={{ position: "absolute", top: -2, right: -2, background: "var(--cp-coral-dark)", color: "#fff", borderRadius: 999, fontSize: "0.6rem", fontWeight: 700, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                      {unread}
                    </span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontWeight: unread > 0 ? 700 : 600, fontSize: "0.875rem", color: "var(--cp-navy)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140 }}>
                      {name(conv.otherProfile)}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--cp-text-muted)", flexShrink: 0, marginLeft: 4 }}>
                      {fmt(conv.lastMessage?.created_at ?? null)}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}>
                    <User size={10} style={{ color: "var(--cp-text-muted)" }} />
                    <span style={{ fontSize: "0.7rem", color: "var(--cp-text-muted)" }}>Student</span>
                  </div>
                  <p style={{ fontSize: "0.775rem", color: unread > 0 ? "#4b5563" : "var(--cp-text-muted)", fontWeight: unread > 0 ? 500 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>
                    {conv.lastMessage ? (conv.lastMessage.sender_id === currentUserId ? "You: " : "") + conv.lastMessage.content : "No messages yet"}
                  </p>
                </div>
                {unread > 0 && (
                  <span style={{ flexShrink: 0, background: "var(--cp-coral-dark)", color: "#fff", borderRadius: 999, fontSize: "0.65rem", fontWeight: 700, padding: "2px 7px", marginLeft: 4 }}>
                    {unread}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}
        className={mobileView === "list" ? "hidden md:flex" : "flex"}>
        {!activeConversationId ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", color: "#9ca3af" }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "var(--cp-coral-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MessageCircle size={28} style={{ color: "var(--cp-coral)" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 700, color: "var(--cp-navy)", fontSize: "0.95rem" }}>Select a conversation</p>
              <p style={{ fontSize: "0.825rem", marginTop: 4 }}>Choose from your messages on the left</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: "0.875rem", background: "#fff" }}>
              <button className="md:hidden" onClick={() => setMobileView("list")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#6b7280" }}>
                <ArrowLeft size={20} />
              </button>
              <Avatar style={{ width: 40, height: 40 }}>
                <AvatarImage src={activeOtherProfile?.avatar_url ?? undefined} />
                <AvatarFallback style={{ background: "var(--cp-grad-coral)", color: "#fff", fontSize: "0.8rem", fontWeight: 700 }}>
                  {initials(activeOtherProfile)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--cp-navy)", lineHeight: 1.2 }}>{name(activeOtherProfile)}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <User size={11} style={{ color: "var(--cp-text-muted)" }} />
                  <span style={{ fontSize: "0.75rem", color: "var(--cp-text-muted)" }}>Student</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {messages.length === 0 && <div style={{ textAlign: "center", marginTop: "2rem", color: "#9ca3af", fontSize: "0.875rem" }}>No messages yet. Say hello! 👋</div>}
              {messages.map((msg, i) => {
                const isMe = msg.sender_id === currentUserId
                const isFirstInGroup = !messages[i - 1] || messages[i - 1].sender_id !== msg.sender_id
                return (
                  <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                    {!isMe && isFirstInGroup && (
                      <span style={{ fontSize: "0.7rem", color: "#9ca3af", marginBottom: 3, marginLeft: 8 }}>
                        {msg.sender_profile?.first_name} {msg.sender_profile?.last_name}
                      </span>
                    )}
                    <div style={{ maxWidth: "68%", padding: "0.625rem 0.875rem", borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: isMe ? "var(--cp-grad-coral)" : "#f3f4f6", color: isMe ? "#fff" : "var(--cp-navy)", fontSize: "0.875rem", lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {msg.content}
                    </div>
                    <span style={{ fontSize: "0.68rem", color: "#9ca3af", marginTop: 3, marginLeft: 4, marginRight: 4 }}>{fmt(msg.created_at)}</span>
                  </div>
                )
              })}
              <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #f3f4f6", background: "#fff", display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
              <textarea value={text} onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder="Type a message... (Enter to send)" rows={1}
                style={{ flex: 1, resize: "none", border: "1px solid var(--cp-border)", borderRadius: 12, padding: "0.625rem 0.875rem", fontSize: "0.875rem", fontFamily: "inherit", outline: "none", lineHeight: 1.5, maxHeight: 120, overflowY: "auto", transition: "border-color 0.15s" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--cp-coral)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--cp-border)")}
              />
              <button onClick={handleSend} disabled={!text.trim() || sending} style={{ width: 42, height: 42, borderRadius: 12, border: "none", cursor: "pointer", background: text.trim() && !sending ? "var(--cp-grad-coral)" : "#f3f4f6", color: text.trim() && !sending ? "#fff" : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}