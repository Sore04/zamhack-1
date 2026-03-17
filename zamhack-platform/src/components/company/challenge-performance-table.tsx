"use client"

import { useState, useMemo } from "react"
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Trophy } from "lucide-react"

export interface ChallengePerf {
  title: string
  participants: number
  submissions: number
  avgScore: number | null
  completionRate: number
}

interface Props {
  data: ChallengePerf[]
}

type SortField = "title" | "participants" | "submissions" | "avgScore" | "completionRate"
type SortDir   = "asc" | "desc"

const PAGE_SIZE = 8

function scoreColor(score: number | null): string {
  if (score === null) return "var(--cp-text-muted)"
  if (score >= 80)   return "#10B981"
  if (score >= 60)   return "#F59E0B"
  return "var(--cp-coral)"
}

function scoreBg(score: number | null): string {
  if (score === null) return "var(--cp-surface-2)"
  if (score >= 80)   return "#10B98118"
  if (score >= 60)   return "#F59E0B18"
  return "var(--cp-coral-light, #FFE8E3)"
}

export function ChallengePerformanceTable({ data }: Props) {
  const [search,    setSearch]    = useState("")
  const [sortField, setSortField] = useState<SortField>("participants")
  const [sortDir,   setSortDir]   = useState<SortDir>("desc")
  const [page,      setPage]      = useState(1)

  const filtered = useMemo(() => {
    let list = data

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c => c.title.toLowerCase().includes(q))
    }

    list = [...list].sort((a, b) => {
      let aVal: string | number
      let bVal: string | number

      switch (sortField) {
        case "title":          aVal = a.title.toLowerCase();  bVal = b.title.toLowerCase();  break
        case "participants":   aVal = a.participants;          bVal = b.participants;          break
        case "submissions":    aVal = a.submissions;           bVal = b.submissions;           break
        case "avgScore":       aVal = a.avgScore ?? -1;        bVal = b.avgScore ?? -1;        break
        case "completionRate": aVal = a.completionRate;        bVal = b.completionRate;        break
      }

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1
      if (aVal > bVal) return sortDir === "asc" ?  1 : -1
      return 0
    })

    return list
  }, [data, search, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleSearch = (val: string) => { setSearch(val); setPage(1) }
  const toggleSort   = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  const SortBtn = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => toggleSort(field)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        background: "none",
        border: "none",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "inherit",
        color: sortField === field ? "var(--cp-coral-dark, #c0392b)" : "var(--cp-text-muted)",
        padding: 0,
      }}
    >
      {children}
      <ArrowUpDown style={{ width: "0.7rem", height: "0.7rem" }} />
    </button>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 340 }}>
          <Search style={{
            position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)",
            width: "0.875rem", height: "0.875rem", color: "var(--cp-text-muted)", pointerEvents: "none",
          }} />
          <input
            type="text"
            placeholder="Search challenges…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            style={{
              width: "100%",
              paddingLeft: "2.25rem",
              paddingRight: "0.75rem",
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
              borderRadius: "var(--cp-radius-lg, 10px)",
              border: "1.5px solid var(--cp-border)",
              background: "var(--cp-white)",
              fontSize: "0.875rem",
              color: "var(--cp-navy)",
              outline: "none",
            }}
          />
        </div>
        <span style={{ fontSize: "0.8125rem", color: "var(--cp-text-muted)", whiteSpace: "nowrap" }}>
          {filtered.length} challenge{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="cp-table-wrapper">
        <table className="cp-table">
          <thead>
            <tr>
              <th><SortBtn field="title">Challenge</SortBtn></th>
              <th style={{ textAlign: "right" }}><SortBtn field="participants">Participants</SortBtn></th>
              <th style={{ textAlign: "right" }}><SortBtn field="submissions">Submissions</SortBtn></th>
              <th style={{ textAlign: "right" }}><SortBtn field="avgScore">Avg Score</SortBtn></th>
              <th><SortBtn field="completionRate">Completion Rate</SortBtn></th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "2rem 0", color: "var(--cp-text-muted)", fontSize: "0.875rem" }}>
                  No challenges match your search.
                </td>
              </tr>
            ) : paginated.map((c, i) => (
              <tr key={i}>

                {/* Title */}
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: "var(--cp-coral-light, #FFE8E3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Trophy style={{ width: "0.875rem", height: "0.875rem", color: "var(--cp-coral)" }} />
                    </div>
                    <span style={{
                      fontWeight: 600, color: "var(--cp-navy)", fontSize: "0.875rem",
                      maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block",
                    }}>
                      {c.title}
                    </span>
                  </div>
                </td>

                {/* Participants */}
                <td style={{ textAlign: "right" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--cp-navy)" }}>
                    {c.participants}
                  </span>
                </td>

                {/* Submissions */}
                <td style={{ textAlign: "right" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--cp-navy)" }}>
                    {c.submissions}
                  </span>
                </td>

                {/* Avg Score */}
                <td style={{ textAlign: "right" }}>
                  {c.avgScore !== null ? (
                    <span style={{
                      display: "inline-block",
                      padding: "0.2rem 0.6rem",
                      borderRadius: 99,
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      color: scoreColor(c.avgScore),
                      background: scoreBg(c.avgScore),
                    }}>
                      {c.avgScore}/100
                    </span>
                  ) : (
                    <span style={{ color: "var(--cp-text-muted)", fontSize: "0.875rem" }}>—</span>
                  )}
                </td>

                {/* Completion Rate */}
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <div style={{
                      flex: 1, height: 7, background: "var(--cp-surface-2)", borderRadius: 99, overflow: "hidden",
                      minWidth: 80,
                    }}>
                      <div style={{
                        width: `${c.completionRate}%`,
                        height: "100%",
                        background: c.completionRate >= 75
                          ? "#10B981"
                          : c.completionRate >= 40
                            ? "#F59E0B"
                            : "var(--cp-coral)",
                        borderRadius: 99,
                        transition: "width 0.3s ease",
                      }} />
                    </div>
                    <span style={{
                      fontSize: "0.8125rem", fontWeight: 700,
                      color: c.completionRate >= 75 ? "#10B981" : c.completionRate >= 40 ? "#F59E0B" : "var(--cp-coral)",
                      minWidth: 38, textAlign: "right",
                    }}>
                      {c.completionRate}%
                    </span>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: "0.25rem", gap: "0.5rem", flexWrap: "wrap",
        }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--cp-text-muted)" }}>
            Page {safePage} of {totalPages}
          </span>
          <div style={{ display: "flex", gap: "0.375rem" }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32, borderRadius: 8,
                border: "1.5px solid var(--cp-border)",
                background: "var(--cp-white)",
                cursor: safePage === 1 ? "not-allowed" : "pointer",
                opacity: safePage === 1 ? 0.4 : 1,
                color: "var(--cp-navy)",
              }}
            >
              <ChevronLeft style={{ width: "1rem", height: "1rem" }} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: n === safePage ? "1.5px solid var(--cp-coral)" : "1.5px solid var(--cp-border)",
                  background: n === safePage ? "var(--cp-coral)" : "var(--cp-white)",
                  color: n === safePage ? "#fff" : "var(--cp-navy)",
                  fontWeight: 600, fontSize: "0.8125rem",
                  cursor: "pointer",
                }}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32, borderRadius: 8,
                border: "1.5px solid var(--cp-border)",
                background: "var(--cp-white)",
                cursor: safePage === totalPages ? "not-allowed" : "pointer",
                opacity: safePage === totalPages ? 0.4 : 1,
                color: "var(--cp-navy)",
              }}
            >
              <ChevronRight style={{ width: "1rem", height: "1rem" }} />
            </button>
          </div>
        </div>
      )}

    </div>
  )
}