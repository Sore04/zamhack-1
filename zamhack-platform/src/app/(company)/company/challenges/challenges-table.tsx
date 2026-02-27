"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Users,
  FileText,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react"

interface ChallengeWithStats {
  id: string
  title: string
  status: string | null
  difficulty: string | null
  start_date: string | null
  end_date: string | null
  created_at: string | null
  participation_type: string | null
  participantCount: number
  submissionCount: number
}

interface ChallengesTableProps {
  challenges: ChallengeWithStats[]
}

const PAGE_SIZE = 10

const STATUS_TABS = [
  { key: "all",              label: "All" },
  { key: "draft",            label: "Draft" },
  { key: "pending_approval", label: "Pending" },
  { key: "approved",         label: "Active" },
  { key: "in_progress",      label: "In Progress" },
  { key: "under_review",     label: "Under Review" },
  { key: "completed",        label: "Completed" },
  { key: "cancelled",        label: "Cancelled" },
]

function getStatusClass(status: string | null): string {
  switch (status) {
    case "approved":         return "active"
    case "in_progress":      return "in-progress"
    case "under_review":     return "under-review"
    case "draft":            return "draft"
    case "pending_approval": return "pending"
    case "completed":        return "completed"
    case "cancelled":        return "cancelled"
    default:                 return "draft"
  }
}

function getStatusLabel(status: string | null): string {
  switch (status) {
    case "approved":         return "Active"
    case "in_progress":      return "In Progress"
    case "under_review":     return "Under Review"
    case "draft":            return "Draft"
    case "pending_approval": return "Pending"
    case "completed":        return "Completed"
    case "cancelled":        return "Cancelled"
    default:                 return status ?? "Unknown"
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "—"
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return "—"
  if (!end) return formatDate(start)
  return `${formatDate(start)} → ${formatDate(end)}`
}

export function ChallengesTable({ challenges }: ChallengesTableProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<"title" | "created_at" | "participantCount">("created_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  // ── Filter by tab + search ────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = challenges

    if (activeTab !== "all") {
      list = list.filter((c) => c.status === activeTab)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((c) => c.title.toLowerCase().includes(q))
    }

    list = [...list].sort((a, b) => {
      let aVal: string | number
      let bVal: string | number

      if (sortField === "title") {
        aVal = a.title.toLowerCase()
        bVal = b.title.toLowerCase()
      } else if (sortField === "participantCount") {
        aVal = a.participantCount
        bVal = b.participantCount
      } else {
        aVal = a.created_at ?? ""
        bVal = b.created_at ?? ""
      }

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1
      return 0
    })

    return list
  }, [challenges, activeTab, search, sortField, sortDir])

  // ── Pagination ────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleTabChange = (key: string) => { setActiveTab(key); setPage(1) }
  const handleSearch = (val: string) => { setSearch(val); setPage(1) }

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const countFor = (key: string) =>
    key === "all"
      ? challenges.length
      : challenges.filter((c) => c.status === key).length

  return (
    <div className="cp-card">

      {/* ── Tabs ── */}
      <div style={{ padding: "1rem 1.5rem 0", borderBottom: "1px solid var(--cp-border)" }}>
        <div style={{ display: "flex", gap: "0", overflowX: "auto" }}>
          {STATUS_TABS.map((tab) => {
            const count = countFor(tab.key)
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                style={{
                  padding: "0.625rem 1rem",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: isActive ? "var(--cp-coral-dark)" : "var(--cp-text-muted)",
                  // ✅ FIX: avoid mixing border shorthand with borderBottom
                  borderTop: "none",
                  borderLeft: "none",
                  borderRight: "none",
                  borderBottom: isActive ? "2px solid var(--cp-coral)" : "2px solid transparent",
                  background: "transparent",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "color 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  marginBottom: "-1px",
                  outline: "none",
                }}
              >
                {tab.label}
                {count > 0 && (
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "1.25rem",
                    height: "1.25rem",
                    padding: "0 0.3rem",
                    borderRadius: "99px",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    background: isActive ? "var(--cp-coral-muted)" : "var(--cp-surface-2)",
                    color: isActive ? "var(--cp-coral-dark)" : "var(--cp-text-muted)",
                  }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--cp-border)" }}>
        <div className="cp-search-wrapper" style={{ maxWidth: "360px" }}>
          <Search className="cp-search-icon" />
          <input
            className="cp-search-input"
            type="text"
            placeholder="Search challenges..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Table ── */}
      {paginated.length === 0 ? (
        <div className="cp-empty-state" style={{ padding: "3rem 2rem" }}>
          <div className="cp-empty-icon">
            <FileText style={{ width: "1.5rem", height: "1.5rem" }} />
          </div>
          <p className="cp-empty-title">No challenges found</p>
          <p className="cp-empty-desc">
            {search ? `No results for "${search}"` : "No challenges in this category yet."}
          </p>
        </div>
      ) : (
        <div className="cp-table-wrapper" style={{ border: "none", borderRadius: 0 }}>
          <table className="cp-table">
            <thead>
              <tr>
                <th style={{ minWidth: 220 }}>
                  <button
                    onClick={() => toggleSort("title")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      color: sortField === "title" ? "var(--cp-coral-dark)" : "var(--cp-text-muted)",
                      padding: 0,
                    }}
                  >
                    Challenge
                    <ArrowUpDown style={{ width: "0.75rem", height: "0.75rem" }} />
                  </button>
                </th>
                <th>Status</th>
                <th>Difficulty</th>
                <th>Timeline</th>
                <th>
                  <button
                    onClick={() => toggleSort("participantCount")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      color: sortField === "participantCount" ? "var(--cp-coral-dark)" : "var(--cp-text-muted)",
                      padding: 0,
                    }}
                  >
                    Participants
                    <ArrowUpDown style={{ width: "0.75rem", height: "0.75rem" }} />
                  </button>
                </th>
                <th>Submissions</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((challenge) => (
                <tr key={challenge.id}>
                  <td>
                    <Link
                      href={`/company/challenges/${challenge.id}`}
                      style={{
                        fontWeight: 700,
                        color: "var(--cp-navy)",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--cp-coral-dark)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--cp-navy)")}
                    >
                      <span style={{
                        maxWidth: "220px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                      }}>
                        {challenge.title}
                      </span>
                    </Link>
                    {challenge.participation_type && (
                      <span style={{
                        fontSize: "0.72rem",
                        color: "var(--cp-text-muted)",
                        fontWeight: 400,
                        marginTop: "0.2rem",
                        display: "block",
                        textTransform: "capitalize",
                      }}>
                        {challenge.participation_type}
                      </span>
                    )}
                  </td>

                  <td>
                    <span className={`cp-badge ${getStatusClass(challenge.status)}`}>
                      <span className="cp-badge-dot" />
                      {getStatusLabel(challenge.status)}
                    </span>
                  </td>

                  <td>
                    {challenge.difficulty ? (
                      <span style={{
                        fontSize: "0.8125rem",
                        color: "var(--cp-text-secondary)",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}>
                        {challenge.difficulty}
                      </span>
                    ) : (
                      <span style={{ color: "var(--cp-text-muted)" }}>—</span>
                    )}
                  </td>

                  <td>
                    <span style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      fontSize: "0.8125rem",
                      color: "var(--cp-text-muted)",
                    }}>
                      <CalendarDays style={{ width: "0.875rem", height: "0.875rem", color: "var(--cp-coral)", flexShrink: 0 }} />
                      {formatDateRange(challenge.start_date, challenge.end_date)}
                    </span>
                  </td>

                  <td>
                    <span style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: challenge.participantCount > 0 ? "var(--cp-navy)" : "var(--cp-text-muted)",
                    }}>
                      <Users style={{ width: "0.875rem", height: "0.875rem", color: "var(--cp-coral)", flexShrink: 0 }} />
                      {challenge.participantCount}
                    </span>
                  </td>

                  <td>
                    <span style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: challenge.submissionCount > 0 ? "var(--cp-navy)" : "var(--cp-text-muted)",
                    }}>
                      <FileText style={{ width: "0.875rem", height: "0.875rem", color: "var(--cp-coral)", flexShrink: 0 }} />
                      {challenge.submissionCount}
                    </span>
                  </td>

                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                      <Link
                        href={`/company/challenges/${challenge.id}`}
                        className="cp-btn cp-btn-primary cp-btn-sm"
                      >
                        Manage
                      </Link>
                      <Link
                        href={`/company/challenges/${challenge.id}`}
                        className="cp-btn cp-btn-ghost cp-btn-sm cp-btn-icon"
                        title="Open"
                      >
                        <ExternalLink style={{ width: "0.875rem", height: "0.875rem" }} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{
          padding: "1rem 1.5rem",
          borderTop: "1px solid var(--cp-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}>
          <p style={{ fontSize: "0.8125rem", color: "var(--cp-text-muted)" }}>
            Showing{" "}
            <span style={{ fontWeight: 700, color: "var(--cp-navy)" }}>
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}
            </span>
            {" "}of{" "}
            <span style={{ fontWeight: 700, color: "var(--cp-navy)" }}>{filtered.length}</span>
            {" "}challenges
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="cp-btn cp-btn-ghost cp-btn-sm cp-btn-icon"
              style={{ opacity: safePage === 1 ? 0.4 : 1, cursor: safePage === 1 ? "not-allowed" : "pointer" }}
            >
              <ChevronLeft style={{ width: "1rem", height: "1rem" }} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (totalPages <= 7) return true
                if (p === 1 || p === totalPages) return true
                if (Math.abs(p - safePage) <= 1) return true
                return false
              })
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (idx > 0 && typeof arr[idx - 1] === "number" && (p as number) - (arr[idx - 1] as number) > 1) {
                  acc.push("…")
                }
                acc.push(p)
                return acc
              }, [])
              .map((p, idx) =>
                p === "…" ? (
                  <span key={`ellipsis-${idx}`} style={{ padding: "0 0.25rem", color: "var(--cp-text-muted)", fontSize: "0.875rem" }}>
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    style={{
                      minWidth: "2rem",
                      height: "2rem",
                      padding: "0 0.5rem",
                      borderRadius: "var(--cp-radius-md, 12px)",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      background: safePage === p ? "var(--cp-coral)" : "transparent",
                      color: safePage === p ? "white" : "var(--cp-text-secondary)",
                      boxShadow: safePage === p ? "0 2px 8px rgba(255,155,135,0.4)" : "none",
                    }}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="cp-btn cp-btn-ghost cp-btn-sm cp-btn-icon"
              style={{ opacity: safePage === totalPages ? 0.4 : 1, cursor: safePage === totalPages ? "not-allowed" : "pointer" }}
            >
              <ChevronRight style={{ width: "1rem", height: "1rem" }} />
            </button>
          </div>
        </div>
      )}

      {totalPages === 1 && filtered.length > 0 && (
        <div style={{ padding: "0.875rem 1.5rem", borderTop: "1px solid var(--cp-border)" }}>
          <p style={{ fontSize: "0.8125rem", color: "var(--cp-text-muted)" }}>
            Showing all <span style={{ fontWeight: 700, color: "var(--cp-navy)" }}>{filtered.length}</span> challenges
          </p>
        </div>
      )}
    </div>
  )
}