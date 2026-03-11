"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import type { CSSProperties } from "react"
import { X, Send, MessageCircle, Loader2, ChevronRight } from "lucide-react"
import { getOrCreateDirectConversation, getConversationMessages, sendDirectMessage } from "@/app/actions/message-actions"
import type { StudentWithStats } from "./page"
import Link from "next/link"

interface Message {
  id: string
  conversation_id: string | null
  sender_id: string | null
  content: string
  created_at: string | null
  is_read: boolean | null
  sender_profile?: {
    first_name: string | null
    last_name: string | null
    role: string | null
    avatar_url: string | null
  }
}

interface MessageModalProps {
  student: StudentWithStats
  onClose: () => void
}

function getInitials(first: string | null, last: string | null): string {
  return `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase() || "?"
}

function formatTime(dateString: string | null) {
  if (!dateString) return "Just now"
  return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function MessageModal({ student, onClose }: MessageModalProps) {
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading")
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const studentName = `${student.first_name || ""} ${student.last_name || ""}`.trim() || "Student"
  const initials = getInitials(student.first_name, student.last_name)

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    async function init() {
      const result = await getOrCreateDirectConversation(student.id)
      if (result.error || !result.conversationId) {
        setErrorMsg(result.error || "Could not open conversation")
        setPhase("error")
        return
      }
      setConversationId(result.conversationId)

      const msgResult = await getConversationMessages(result.conversationId)
      if (msgResult.error) {
        setErrorMsg(msgResult.error)
        setPhase("error")
        return
      }

      setMessages((msgResult.messages as Message[]) || [])
      setCurrentUserId(msgResult.currentUserId || null)
      setPhase("ready")
    }
    init()
  }, [student.id])

  useEffect(() => {
    if (phase === "ready") {
      textareaRef.current?.focus()
    }
  }, [phase])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const handleSend = async () => {
    if (!draft.trim() || !conversationId || isSending) return

    setIsSending(true)
    const content = draft.trim()
    setDraft("")

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const optimistic: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
      is_read: false,
      sender_profile: { first_name: "Me", last_name: "", role: null, avatar_url: null },
    }
    setMessages((prev) => [...prev, optimistic])

    const result = await sendDirectMessage(conversationId, content)
    if (result.error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      setDraft(content)
      setErrorMsg(result.error)
    }
    setIsSending(false)
  }

  return (
    // Backdrop
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        padding: "1.5rem",
        pointerEvents: "none",
      }}
    >
      {/* Backdrop click catcher */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(2px)",
          pointerEvents: "all",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "420px",
          height: "560px",
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          pointerEvents: "all",
          animation: "slideUp 0.25s ease",
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Header */}
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--cp-border)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            background: "white",
            flexShrink: 0,
          }}
        >
          {/* Avatar */}
          {student.avatar_url ? (
            <img
              src={student.avatar_url}
              alt={studentName}
              style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
            />
          ) : (
            <div
              style={{
                width: "2.25rem",
                height: "2.25rem",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--cp-coral), var(--cp-navy))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "white",
              }}
            >
              {initials}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--cp-navy)", lineHeight: 1.2 }}>
              {studentName}
            </p>
            <p style={{ fontSize: "0.72rem", color: "var(--cp-text-muted)", marginTop: "0.1rem" }}>
              {student.university || "Student"}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {conversationId && (
              <Link
                href={`/company/messages?conversation=${conversationId}`}
                title="Open full chat"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  fontSize: "0.75rem",
                  color: "var(--cp-coral-dark)",
                  fontWeight: 600,
                  textDecoration: "none",
                  padding: "0.3rem 0.5rem",
                  borderRadius: "8px",
                  background: "var(--cp-coral-muted)",
                }}
              >
                Open <ChevronRight style={{ width: "0.75rem", height: "0.75rem" }} />
              </Link>
            )}
            <button
              onClick={onClose}
              title="Close"
              style={{
                width: "1.875rem",
                height: "1.875rem",
                borderRadius: "50%",
                border: "none",
                background: "var(--cp-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer" as CSSProperties["cursor"],
                color: "var(--cp-text-muted)",
                flexShrink: 0,
              }}
            >
              <X style={{ width: "0.9rem", height: "0.9rem" }} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {phase === "loading" && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "0.75rem", color: "var(--cp-text-muted)" }}>
              <Loader2 style={{ width: "1.5rem", height: "1.5rem", animation: "spin 1s linear infinite" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <span style={{ fontSize: "0.85rem" }}>Opening conversation...</span>
            </div>
          )}

          {phase === "error" && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "0.5rem", color: "var(--cp-text-muted)" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--cp-coral-dark)", fontWeight: 600 }}>Something went wrong</p>
              <p style={{ fontSize: "0.78rem" }}>{errorMsg}</p>
            </div>
          )}

          {phase === "ready" && messages.length === 0 && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{
                width: "3rem", height: "3rem", borderRadius: "50%",
                background: "var(--cp-coral-muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <MessageCircle style={{ width: "1.25rem", height: "1.25rem", color: "var(--cp-coral-dark)" }} />
              </div>
              <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--cp-navy)" }}>Start the conversation</p>
              <p style={{ fontSize: "0.78rem", color: "var(--cp-text-muted)", textAlign: "center", maxWidth: "220px" }}>
                Send {studentName} a message to kick off a conversation.
              </p>
            </div>
          )}

          {phase === "ready" && messages.map((msg, index) => {
            const isMe = msg.sender_id === currentUserId
            const isFirstInGroup = index === 0 || messages[index - 1].sender_id !== msg.sender_id

            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMe ? "flex-end" : "flex-start",
                  gap: "0.2rem",
                }}
              >
                {!isMe && isFirstInGroup && (
                  <span style={{ fontSize: "0.7rem", color: "var(--cp-text-muted)", paddingLeft: "0.5rem" }}>
                    {studentName}
                  </span>
                )}
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "0.5rem 0.875rem",
                    borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    fontSize: "0.85rem",
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    background: isMe ? "var(--cp-coral)" : "var(--cp-navy-muted, #f0f2f7)",
                    color: isMe ? "white" : "var(--cp-navy)",
                  }}
                >
                  {msg.content}
                </div>
                <span style={{ fontSize: "0.65rem", color: "var(--cp-text-muted)", paddingInline: "0.25rem" }}>
                  {formatTime(msg.created_at)}
                </span>
              </div>
            )
          })}
          <div ref={scrollRef} />
        </div>

        {/* Footer */}
        {phase === "ready" && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderTop: "1px solid var(--cp-border)",
              background: "white",
              flexShrink: 0,
            }}
          >
            {errorMsg && (
              <p style={{ fontSize: "0.75rem", color: "var(--cp-coral-dark)", marginBottom: "0.5rem" }}>{errorMsg}</p>
            )}
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder={`Message ${studentName}...`}
                rows={1}
                style={{
                  flex: 1,
                  resize: "none",
                  border: "1.5px solid var(--cp-border)",
                  borderRadius: "12px",
                  padding: "0.625rem 0.875rem",
                  fontSize: "0.85rem",
                  fontFamily: "inherit",
                  outline: "none",
                  lineHeight: 1.5,
                  maxHeight: "100px",
                  overflowY: "auto",
                  color: "var(--cp-navy)",
                  background: "var(--cp-background, #fafafa)",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--cp-coral)" }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--cp-border)" }}
              />
              <button
                onClick={handleSend}
                disabled={!draft.trim() || isSending}
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  borderRadius: "12px",
                  border: "none",
                  background: draft.trim() && !isSending ? "var(--cp-coral)" : "var(--cp-border)",
                  color: draft.trim() && !isSending ? "white" : "var(--cp-text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: (draft.trim() && !isSending ? "pointer" : "not-allowed") as CSSProperties["cursor"],
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                }}
              >
                {isSending
                  ? <Loader2 style={{ width: "0.9rem", height: "0.9rem", animation: "spin 1s linear infinite" }} />
                  : <Send style={{ width: "0.9rem", height: "0.9rem" }} />
                }
              </button>
            </div>
            <p style={{ fontSize: "0.65rem", color: "var(--cp-text-muted)", marginTop: "0.4rem", textAlign: "center" }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        )}
      </div>
    </div>
  )
}