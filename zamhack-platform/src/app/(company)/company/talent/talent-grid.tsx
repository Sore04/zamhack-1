"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Search,
  GraduationCap,
  Trophy,
  Zap,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  ExternalLink,
  MessageCircle,
  BookOpen,
} from "lucide-react"
import type { StudentWithStats } from "./page"

interface TalentGridProps {
  students: StudentWithStats[]
}

const PAGE_SIZE = 9 // 3 cols × 3 rows

const SORT_OPTIONS = [
  { value: "newest",    label: "Newest First" },
  { value: "name",      label: "Name A–Z" },
  { value: "completed", label: "Most Experienced" },
  { value: "active",    label: "Most Active" },
]

function getInitials(first: string | null, last: string | null): string {
  return `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase() || "?"
}

// Deterministic gradient per student (based on name)
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #FF9B87 0%, #E8836F 100%)",
  "linear-gradient(135deg, #2C3E50 0%, #3D5166 100%)",
  "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
  "linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)",
  "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)",
  "linear-gradient(135deg, #10B981 0%, #059669 100%)",
]

function avatarGradient(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length]
}

export function TalentGrid({ students }: TalentGridProps) {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterExperience, setFilterExperience] = useState<"all" | "experienced" | "active" | "new">("all")
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)

  // ── Filter + Sort ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...students]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((s) => {
        const name = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase()
        const bio = (s.bio || "").toLowerCase()
        const uni = (s.university || "").toLowerCase()
        const degree = (s.degree || "").toLowerCase()
        return name.includes(q) || bio.includes(q) || uni.includes(q) || degree.includes(q)
      })
    }

    // Experience filter
    if (filterExperience === "experienced") list = list.filter((s) => s.completedChallenges > 0)
    if (filterExperience === "active") list = list.filter((s) => s.activeChallenges > 0)
    if (filterExperience === "new") list = list.filter((s) => s.completedChallenges === 0 && s.activeChallenges === 0)

    // Sort
    switch (sortBy) {
      case "name":
        list.sort((a, b) => {
          const an = `${a.first_name || ""} ${a.last_name || ""}`.toLowerCase()
          const bn = `${b.first_name || ""} ${b.last_name || ""}`.toLowerCase()
          return an.localeCompare(bn)
        })
        break
      case "completed":
        list.sort((a, b) => b.completedChallenges - a.completedChallenges)
        break
      case "active":
        list.sort((a, b) => b.activeChallenges - a.activeChallenges)
        break
      default:
        list.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
    }

    return list
  }, [students, search, sortBy, filterExperience])

  // ── Pagination ─────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const resetPage = () => setPage(1)

  const activeFiltersCount = [
    filterExperience !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

      {/* ── Toolbar ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        flexWrap: "wrap",
      }}>
        {/* Search */}
        <div className="cp-search-wrapper" style={{ flex: "1", minWidth: "200px", maxWidth: "400px" }}>
          <Search className="cp-search-icon" />
          <input
            className="cp-search-input"
            type="text"
            placeholder="Search by name, school, degree..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage() }}
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="cp-btn cp-btn-ghost"
          style={{
            gap: "0.5rem",
            borderColor: activeFiltersCount > 0 ? "var(--cp-coral)" : undefined,
            color: activeFiltersCount > 0 ? "var(--cp-coral-dark)" : undefined,
          }}
        >
          <SlidersHorizontal style={{ width: "1rem", height: "1rem" }} />
          Filters
          {activeFiltersCount > 0 && (
            <span style={{
              minWidth: "1.25rem", height: "1.25rem", borderRadius: "99px",
              background: "var(--cp-coral)", color: "white",
              fontSize: "0.6875rem", fontWeight: 700,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              padding: "0 0.3rem",
            }}>
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); resetPage() }}
          className="cp-input"
          style={{ width: "auto", minWidth: "160px", padding: "0.5rem 0.875rem" }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Result count */}
        <p style={{ fontSize: "0.8125rem", color: "var(--cp-text-muted)", marginLeft: "auto", whiteSpace: "nowrap" }}>
          <span style={{ fontWeight: 700, color: "var(--cp-navy)" }}>{filtered.length}</span> students found
        </p>
      </div>

      {/* ── Filter Panel ── */}
      {showFilters && (
        <div className="cp-card" style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--cp-navy)" }}>Filter By</p>
            {activeFiltersCount > 0 && (
              <button
                onClick={() => { setFilterExperience("all"); resetPage() }}
                style={{
                  fontSize: "0.75rem", color: "var(--cp-coral-dark)", fontWeight: 600,
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "0.25rem",
                }}
              >
                <X style={{ width: "0.75rem", height: "0.75rem" }} /> Clear all
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--cp-text-muted)" }}>
              Experience Level
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {[
                { value: "all",         label: "All Students" },
                { value: "experienced", label: "Has Completed Challenges" },
                { value: "active",      label: "Currently Active" },
                { value: "new",         label: "New / No Challenges" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setFilterExperience(opt.value as any); resetPage() }}
                  style={{
                    padding: "0.375rem 0.875rem",
                    borderRadius: "99px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    border: "1.5px solid",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    borderColor: filterExperience === opt.value ? "var(--cp-coral)" : "var(--cp-border-strong)",
                    background: filterExperience === opt.value ? "var(--cp-coral-muted)" : "transparent",
                    color: filterExperience === opt.value ? "var(--cp-coral-dark)" : "var(--cp-text-secondary)",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Grid ── */}
      {paginated.length === 0 ? (
        <div className="cp-card">
          <div className="cp-empty-state">
            <div className="cp-empty-icon">
              <Search style={{ width: "1.5rem", height: "1.5rem" }} />
            </div>
            <p className="cp-empty-title">No students found</p>
            <p className="cp-empty-desc">
              {search ? `No results for "${search}". Try a different search term.` : "No students match your current filters."}
            </p>
            <button
              onClick={() => { setSearch(""); setFilterExperience("all"); resetPage() }}
              className="cp-btn cp-btn-outline"
            >
              Clear filters
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
        }}
          className="talent-grid"
        >
          {paginated.map((student) => {
            const name = `${student.first_name || ""} ${student.last_name || ""}`.trim() || "Student"
            const initials = getInitials(student.first_name, student.last_name)
            const gradient = avatarGradient(name)
            const headline = [student.degree, student.university].filter(Boolean).join(" · ")
            const hasExperience = student.completedChallenges > 0

            return (
              <div
                key={student.id}
                style={{
                  background: "white",
                  border: "1px solid var(--cp-border)",
                  borderRadius: "var(--cp-radius-xl, 20px)",
                  overflow: "hidden",
                  boxShadow: "var(--cp-shadow-sm)",
                  transition: "all 0.25s ease",
                  display: "flex",
                  flexDirection: "column",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  el.style.transform = "translateY(-3px)"
                  el.style.boxShadow = "var(--cp-shadow-md)"
                  el.style.borderColor = "rgba(255,155,135,0.35)"
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.transform = "translateY(0)"
                  el.style.boxShadow = "var(--cp-shadow-sm)"
                  el.style.borderColor = "var(--cp-border)"
                }}
              >
                {/* Card top accent strip */}
                <div style={{ height: "4px", background: gradient }} />

                {/* Card body */}
                <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>

                  {/* Avatar + Name row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                    {student.avatar_url ? (
                      <img
                        src={student.avatar_url}
                        alt={name}
                        style={{
                          width: "3rem", height: "3rem",
                          borderRadius: "50%",
                          objectFit: "cover",
                          flexShrink: 0,
                          border: "2px solid var(--cp-border)",
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "3rem", height: "3rem",
                        borderRadius: "50%",
                        background: gradient,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white",
                        fontWeight: 800,
                        fontSize: "1rem",
                        flexShrink: 0,
                        letterSpacing: "-0.02em",
                      }}>
                        {initials}
                      </div>
                    )}

                    <div style={{ overflow: "hidden", flex: 1 }}>
                      <p style={{
                        fontWeight: 700,
                        fontSize: "0.9375rem",
                        color: "var(--cp-navy)",
                        letterSpacing: "-0.01em",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                        {name}
                      </p>
                      {headline && (
                        <p style={{
                          fontSize: "0.75rem",
                          color: "var(--cp-text-muted)",
                          marginTop: "0.125rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}>
                          {headline}
                        </p>
                      )}
                    </div>

                    {/* Experience badge */}
                    {hasExperience && (
                      <span style={{
                        flexShrink: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "99px",
                        background: "rgba(34,197,94,0.10)",
                        color: "#166534",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                      }}>
                        <Trophy style={{ width: "0.625rem", height: "0.625rem" }} />
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Bio */}
                  {student.bio && (
                    <p style={{
                      fontSize: "0.8125rem",
                      color: "var(--cp-text-secondary)",
                      lineHeight: 1.6,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical" as const,
                      overflow: "hidden",
                    }}>
                      {student.bio}
                    </p>
                  )}

                  {/* Stats row */}
                  <div style={{
                    display: "flex",
                    gap: "0.5rem",
                  }}>
                    <div style={{
                      flex: 1,
                      background: "var(--cp-surface)",
                      borderRadius: "var(--cp-radius-md, 12px)",
                      padding: "0.625rem 0.75rem",
                      textAlign: "center",
                    }}>
                      <p style={{ fontWeight: 800, fontSize: "1.125rem", color: "var(--cp-coral-dark)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                        {student.completedChallenges}
                      </p>
                      <p style={{ fontSize: "0.6875rem", color: "var(--cp-text-muted)", fontWeight: 500, marginTop: "0.2rem" }}>
                        Completed
                      </p>
                    </div>
                    <div style={{
                      flex: 1,
                      background: "var(--cp-surface)",
                      borderRadius: "var(--cp-radius-md, 12px)",
                      padding: "0.625rem 0.75rem",
                      textAlign: "center",
                    }}>
                      <p style={{ fontWeight: 800, fontSize: "1.125rem", color: "var(--cp-navy)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                        {student.activeChallenges}
                      </p>
                      <p style={{ fontSize: "0.6875rem", color: "var(--cp-text-muted)", fontWeight: 500, marginTop: "0.2rem" }}>
                        Active
                      </p>
                    </div>
                    {student.graduation_year && (
                      <div style={{
                        flex: 1,
                        background: "var(--cp-surface)",
                        borderRadius: "var(--cp-radius-md, 12px)",
                        padding: "0.625rem 0.75rem",
                        textAlign: "center",
                      }}>
                        <p style={{ fontWeight: 800, fontSize: "1.125rem", color: "var(--cp-navy)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                          {student.graduation_year}
                        </p>
                        <p style={{ fontSize: "0.6875rem", color: "var(--cp-text-muted)", fontWeight: 500, marginTop: "0.2rem" }}>
                          Grad Year
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Education chips */}
                  {(student.university || student.degree) && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                      {student.university && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "0.3rem",
                          padding: "0.25rem 0.625rem",
                          background: "var(--cp-navy-muted)",
                          color: "var(--cp-navy)",
                          borderRadius: "var(--cp-radius-sm, 8px)",
                          fontSize: "0.72rem", fontWeight: 600,
                        }}>
                          <GraduationCap style={{ width: "0.75rem", height: "0.75rem" }} />
                          {student.university}
                        </span>
                      )}
                      {student.degree && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "0.3rem",
                          padding: "0.25rem 0.625rem",
                          background: "var(--cp-coral-muted)",
                          color: "var(--cp-coral-dark)",
                          borderRadius: "var(--cp-radius-sm, 8px)",
                          fontSize: "0.72rem", fontWeight: 600,
                        }}>
                          <BookOpen style={{ width: "0.75rem", height: "0.75rem" }} />
                          {student.degree}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Spacer */}
                  <div style={{ flex: 1 }} />

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                    <Link
                      href={`/profiles/${student.id}`}
                      className="cp-btn cp-btn-primary cp-btn-sm"
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      <ExternalLink style={{ width: "0.875rem", height: "0.875rem" }} />
                      View Profile
                    </Link>
                    <Link
                      href={`/company/messages?student=${student.id}`}
                      className="cp-btn cp-btn-ghost cp-btn-sm cp-btn-icon"
                      title="Message"
                    >
                      <MessageCircle style={{ width: "0.875rem", height: "0.875rem" }} />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 0",
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
            {" "}students
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
                  <span key={`ellipsis-${idx}`} style={{ padding: "0 0.25rem", color: "var(--cp-text-muted)", fontSize: "0.875rem" }}>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    style={{
                      minWidth: "2rem", height: "2rem",
                      padding: "0 0.5rem",
                      borderRadius: "var(--cp-radius-md, 12px)",
                      fontSize: "0.8125rem", fontWeight: 600,
                      border: "none", cursor: "pointer",
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

      {/* Responsive grid CSS */}
      <style>{`
        @media (max-width: 1024px) {
          .talent-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .talent-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}