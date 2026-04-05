"use client"

import { useState } from "react"
import { Zap, Info, X } from "lucide-react"

const RANK_STYLES: Record<string, string> = {
  beginner:     "text-teal-700 bg-teal-50 border-teal-200",
  intermediate: "text-purple-700 bg-purple-50 border-purple-200",
  advanced:     "text-amber-700 bg-amber-50 border-amber-200",
}

const RANK_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
}

const NEXT_RANK: Record<string, string | null> = {
  beginner: "intermediate",
  intermediate: "advanced",
  advanced: null,
}

const NEXT_RANK_XP: Record<string, number> = {
  beginner: 2001,
  intermediate: 5001,
}

const BAND_START_XP: Record<string, number> = {
  beginner: 0,
  intermediate: 2001,
  advanced: 5001,
}

interface XpCardProps {
  xpPoints: number
  xpRank: string
}

const MULTIPLIER_TABLE = [
  { rank: "Beginner",     beginner: "1.0×", intermediate: "1.5×", advanced: "2.0×" },
  { rank: "Intermediate", beginner: "0.5×", intermediate: "1.0×", advanced: "1.5×" },
  { rank: "Advanced",     beginner: "0.2×", intermediate: "0.5×", advanced: "1.0×" },
]

function XpInfoDialog({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white", borderRadius: "0.875rem",
          padding: "1.5rem", maxWidth: 480, width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          display: "flex", flexDirection: "column", gap: "1.125rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Zap style={{ width: 18, height: 18, color: "#eab308" }} />
            <span style={{ fontWeight: 700, fontSize: "1rem", color: "#2c3e50" }}>How to Earn XP</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "0.25rem" }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Base XP */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#374151" }}>Base XP from your score</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", background: "#fef3c7", color: "#92400e", borderRadius: "0.375rem", padding: "0.2rem 0.5rem", fontWeight: 600 }}>Score ≥ 70</span>
              <span style={{ fontSize: "0.8rem", color: "#4b5563" }}>50 – 400 base XP (scales linearly)</span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", background: "#fee2e2", color: "#991b1b", borderRadius: "0.375rem", padding: "0.2rem 0.5rem", fontWeight: 600 }}>Score &lt; 70</span>
              <span style={{ fontSize: "0.8rem", color: "#4b5563" }}>−50 XP penalty (advanced rank only)</span>
            </div>
          </div>
        </div>

        {/* Multipliers */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#374151" }}>Difficulty multipliers (by your rank)</p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <th style={{ padding: "0.4rem 0.6rem", textAlign: "left", color: "#6b7280", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>Your Rank</th>
                <th style={{ padding: "0.4rem 0.6rem", textAlign: "center", color: "#16a34a", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>Beginner</th>
                <th style={{ padding: "0.4rem 0.6rem", textAlign: "center", color: "#b45309", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>Intermediate</th>
                <th style={{ padding: "0.4rem 0.6rem", textAlign: "center", color: "#dc2626", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>Advanced</th>
              </tr>
            </thead>
            <tbody>
              {MULTIPLIER_TABLE.map((row) => (
                <tr key={row.rank} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.4rem 0.6rem", color: "#374151", fontWeight: 500 }}>{row.rank}</td>
                  <td style={{ padding: "0.4rem 0.6rem", textAlign: "center", color: "#374151" }}>{row.beginner}</td>
                  <td style={{ padding: "0.4rem 0.6rem", textAlign: "center", color: "#374151" }}>{row.intermediate}</td>
                  <td style={{ padding: "0.4rem 0.6rem", textAlign: "center", color: "#374151" }}>{row.advanced}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
            Tip: beginner-rank students earn 2× XP on advanced challenges.
          </p>
        </div>

        {/* Rank thresholds */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#374151" }}>Rank thresholds</p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.78rem", background: "#f0fdfa", color: "#0f766e", border: "1px solid #99f6e4", borderRadius: "0.375rem", padding: "0.25rem 0.625rem", fontWeight: 600 }}>
              Beginner · 0 – 2,000 XP
            </span>
            <span style={{ fontSize: "0.78rem", background: "#faf5ff", color: "#7e22ce", border: "1px solid #e9d5ff", borderRadius: "0.375rem", padding: "0.25rem 0.625rem", fontWeight: 600 }}>
              Intermediate · 2,001 – 5,000 XP
            </span>
            <span style={{ fontSize: "0.78rem", background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", borderRadius: "0.375rem", padding: "0.25rem 0.625rem", fontWeight: 600 }}>
              Advanced · 5,001+ XP
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            alignSelf: "flex-end", padding: "0.5rem 1.25rem",
            borderRadius: "0.5rem", border: "none", cursor: "pointer",
            background: "#2c3e50", color: "white", fontWeight: 600, fontSize: "0.85rem",
          }}
        >
          Got it
        </button>
      </div>
    </div>
  )
}

export const XpCard = ({ xpPoints, xpRank }: XpCardProps) => {
  const [showInfo, setShowInfo] = useState(false)

  const nextRank = NEXT_RANK[xpRank]
  const targetXp = nextRank ? NEXT_RANK_XP[xpRank] : null
  const bandStart = BAND_START_XP[xpRank] ?? 0
  const progress = targetXp
    ? Math.min(100, ((xpPoints - bandStart) / (targetXp - bandStart)) * 100)
    : 100
  const xpToNext = targetXp ? Math.max(0, targetXp - xpPoints) : 0

  return (
    <>
      {showInfo && <XpInfoDialog onClose={() => setShowInfo(false)} />}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="font-semibold text-sm">XP Rank</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="How to earn XP"
              style={{ background: "none", border: "none", cursor: "pointer", padding: "0.125rem", display: "flex" }}
            >
              <Info className="h-3.5 w-3.5" />
            </button>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${RANK_STYLES[xpRank] ?? ""}`}
            >
              {RANK_LABEL[xpRank] ?? xpRank}
            </span>
          </div>
        </div>

        <div className="text-2xl font-bold">{xpPoints.toLocaleString()} XP</div>

        {targetXp ? (
          <>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-primary rounded-full h-1.5 transition-all"
                style={{ width: `${progress.toFixed(1)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {xpToNext.toLocaleString()} XP to{" "}
              {RANK_LABEL[nextRank!]}
            </p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">Maximum rank reached</p>
        )}
      </div>
    </>
  )
}
