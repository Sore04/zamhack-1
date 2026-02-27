"use client"

import { useState } from "react"
import { toast } from "sonner"
import { submitSupportRequest } from "./actions"
import {
  Send,
  CheckCircle2,
  Clock,
  Mail,
  AlertCircle,
  Zap,
  Shield,
  BookOpen,
  HelpCircle,
  MessageSquare,
} from "lucide-react"

const QUICK_TOPICS = [
  { icon: Zap,         label: "Challenge Setup Help",    subject: "Help with challenge setup" },
  { icon: Shield,      label: "Account / Access Issue",  subject: "Account or access issue" },
  { icon: BookOpen,    label: "Billing / Seats Request", subject: "Billing or seats request" },
  { icon: HelpCircle,  label: "General Question",        subject: "General question" },
  { icon: MessageSquare, label: "Feedback / Suggestion", subject: "Platform feedback or suggestion" },
]

export default function SupportForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  const handleQuickTopic = (topicSubject: string) => {
    setSubject(topicSubject)
    setTimeout(() => document.getElementById("support-message")?.focus(), 100)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setSaved(false)

    const formData = new FormData(e.currentTarget)
    const result = await submitSupportRequest(formData)

    if (result?.error) {
      toast.error(result.error)
    } else if (result?.success) {
      toast.success(result.success)
      setSaved(true)
      setSubject("")
      setMessage("")
      setTimeout(() => setSaved(false), 4000)
    }

    setIsLoading(false)
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: "1.5rem",
        alignItems: "start",
      }}
      className="support-layout"
    >
      {/* ── LEFT: Form ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* Success banner */}
        {saved && (
          <div style={{
            display: "flex", alignItems: "center", gap: "0.875rem",
            padding: "1rem 1.25rem",
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: "var(--cp-radius-lg, 16px)",
          }}>
            <CheckCircle2 style={{ width: "1.25rem", height: "1.25rem", color: "#16a34a", flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "#166534" }}>
                Request sent!
              </p>
              <p style={{ fontSize: "0.8rem", color: "#166534", opacity: 0.8 }}>
                Our admin team will review it and get back to you shortly.
              </p>
            </div>
          </div>
        )}

        {/* Form card */}
        <div className="cp-card">
          <div className="cp-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <div style={{
                width: "2rem", height: "2rem", borderRadius: "var(--cp-radius-md, 12px)",
                background: "var(--cp-coral-muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <MessageSquare style={{ width: "1rem", height: "1rem", color: "var(--cp-coral-dark)" }} />
              </div>
              <p className="cp-card-title">Contact Support</p>
            </div>
          </div>

          <div className="cp-card-body">
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
            >
              {/* Subject */}
              <div className="cp-form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="subject" className="cp-label">
                  Subject <span style={{ color: "var(--cp-coral)" }}>*</span>
                </label>
                <input
                  id="subject"
                  name="subject"
                  className="cp-input"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Issue with billing, Bug report, Challenge question…"
                  required
                />
              </div>

              {/* Message */}
              <div className="cp-form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="support-message" className="cp-label">
                  Message <span style={{ color: "var(--cp-coral)" }}>*</span>
                </label>
                <textarea
                  id="support-message"
                  name="message"
                  className="cp-textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail. Include any relevant challenge IDs, error messages, or steps to reproduce the problem…"
                  rows={6}
                  required
                />
                <p style={{ fontSize: "0.75rem", color: "var(--cp-text-muted)", marginTop: "0.375rem" }}>
                  The more detail you provide, the faster we can help you.
                </p>
              </div>

              {/* Submit */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="submit"
                  disabled={isLoading || !subject.trim() || !message.trim()}
                  className="cp-btn cp-btn-primary"
                  style={{
                    minWidth: "150px",
                    opacity: isLoading || !subject.trim() || !message.trim() ? 0.65 : 1,
                    cursor: isLoading || !subject.trim() || !message.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  {isLoading ? (
                    <>
                      <span style={{
                        width: "1rem", height: "1rem", borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.35)",
                        borderTopColor: "white",
                        animation: "cp-spin 0.7s linear infinite",
                        display: "inline-block", flexShrink: 0,
                      }} />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send style={{ width: "1rem", height: "1rem" }} />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Sidebar ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* Response time hero */}
        <div className="cp-support-card">
          <div style={{
            width: "2.5rem", height: "2.5rem", borderRadius: "var(--cp-radius-md, 12px)",
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "0.875rem",
          }}>
            <Clock style={{ width: "1.25rem", height: "1.25rem", color: "white" }} />
          </div>
          <p className="cp-support-card-title">Typical Response Time</p>
          <p style={{
            fontSize: "2.25rem", fontWeight: 800,
            color: "var(--cp-coral-light)", letterSpacing: "-0.04em",
            lineHeight: 1, marginBottom: "0.375rem",
          }}>
            &lt; 24h
          </p>
          <p className="cp-support-card-desc">
            Our team reviews all requests Mon–Fri, 8 AM – 6 PM PHT.
          </p>
        </div>

        {/* Quick topics */}
        <div className="cp-card">
          <div className="cp-card-header">
            <p className="cp-card-title">Quick Topics</p>
          </div>
          <div className="cp-card-body" style={{ padding: "0.75rem 1.25rem 1.25rem" }}>
            <p style={{ fontSize: "0.78rem", color: "var(--cp-text-muted)", marginBottom: "0.75rem" }}>
              Click a topic to pre-fill the subject line.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {QUICK_TOPICS.map((topic) => {
                const Icon = topic.icon
                const isSelected = subject === topic.subject
                return (
                  <button
                    key={topic.label}
                    type="button"
                    onClick={() => handleQuickTopic(topic.subject)}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.625rem 0.875rem",
                      borderRadius: "var(--cp-radius-md, 12px)",
                      background: isSelected ? "var(--cp-coral-muted)" : "var(--cp-surface)",
                      border: `1.5px solid ${isSelected ? "rgba(255,155,135,0.5)" : "var(--cp-border)"}`,
                      cursor: "pointer", textAlign: "left", width: "100%",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "var(--cp-coral-muted)"
                        e.currentTarget.style.borderColor = "rgba(255,155,135,0.4)"
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "var(--cp-surface)"
                        e.currentTarget.style.borderColor = "var(--cp-border)"
                      }
                    }}
                  >
                    <Icon style={{
                      width: "1rem", height: "1rem",
                      color: isSelected ? "var(--cp-coral-dark)" : "var(--cp-text-muted)",
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: "0.8125rem", fontWeight: 600,
                      color: isSelected ? "var(--cp-coral-dark)" : "var(--cp-navy)",
                    }}>
                      {topic.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="cp-card">
          <div className="cp-card-header">
            <p className="cp-card-title">Direct Contact</p>
          </div>
          <div className="cp-card-body" style={{ padding: "0.75rem 1.25rem 1.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <div style={{
                  width: "2rem", height: "2rem", borderRadius: "var(--cp-radius-md, 12px)",
                  background: "var(--cp-navy-muted)", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Mail style={{ width: "0.875rem", height: "0.875rem", color: "var(--cp-navy)" }} />
                </div>
                <div>
                  <p style={{
                    fontSize: "0.7rem", fontWeight: 700, color: "var(--cp-navy)",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>
                    Email Support
                  </p>
                  <a
                    href="mailto:support@zamhack.com"
                    style={{ fontSize: "0.8125rem", color: "var(--cp-coral-dark)", fontWeight: 600, textDecoration: "none" }}
                  >
                    support@zamhack.com
                  </a>
                </div>
              </div>

              <div style={{ height: "1px", background: "var(--cp-border)" }} />

              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <div style={{
                  width: "2rem", height: "2rem", borderRadius: "var(--cp-radius-md, 12px)",
                  background: "var(--cp-coral-muted)", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <AlertCircle style={{ width: "0.875rem", height: "0.875rem", color: "var(--cp-coral-dark)" }} />
                </div>
                <div>
                  <p style={{
                    fontSize: "0.7rem", fontWeight: 700, color: "var(--cp-navy)",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>
                    Urgent Issues
                  </p>
                  <p style={{ fontSize: "0.78rem", color: "var(--cp-text-muted)", lineHeight: 1.55 }}>
                    Mark your email <strong style={{ color: "var(--cp-navy)" }}>URGENT</strong> for critical platform issues.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="cp-card">
          <div className="cp-card-header">
            <p className="cp-card-title">Tips for Faster Help</p>
          </div>
          <div className="cp-card-body" style={{ padding: "0.75rem 1.25rem 1.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {[
                "Include your challenge ID or title",
                "Describe the exact steps to reproduce",
                "Mention your browser or device",
                "Attach screenshot URLs if available",
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                  <span style={{
                    width: "1.375rem", height: "1.375rem", borderRadius: "50%", flexShrink: 0,
                    background: "var(--cp-grad-coral)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.625rem", fontWeight: 800, color: "white",
                    marginTop: "0.05rem",
                  }}>
                    {i + 1}
                  </span>
                  <p style={{ fontSize: "0.8125rem", color: "var(--cp-text-secondary)", lineHeight: 1.55 }}>
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes cp-spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .support-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}