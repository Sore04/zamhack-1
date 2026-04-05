"use client"

import { useState } from "react"
import { Zap, Info } from "lucide-react"
import { toast } from "sonner"
import { updateXpGlobalSettings, updateChallengeXpMultiplier } from "@/app/admin/actions"

interface ChallengeRow {
  id: string
  title: string
  difficulty: string | null
  xp_multiplier: number | null
}

interface XpSettingsFormProps {
  scoreThreshold: number
  penalty: number
  baseMin: number
  baseMax: number
  challenges: ChallengeRow[]
}

const DIFFICULTY_COLOR: Record<string, { bg: string; color: string }> = {
  beginner:     { bg: "rgba(34,197,94,0.1)",  color: "#15803d" },
  intermediate: { bg: "rgba(234,179,8,0.1)",  color: "#b45309" },
  advanced:     { bg: "rgba(239,68,68,0.1)",  color: "#dc2626" },
}

export function XpSettingsForm({
  scoreThreshold,
  penalty,
  baseMin,
  baseMax,
  challenges,
}: XpSettingsFormProps) {
  // Global formula state
  const [threshold, setThreshold] = useState(String(scoreThreshold))
  const [pen, setPen] = useState(String(penalty))
  const [min, setMin] = useState(String(baseMin))
  const [max, setMax] = useState(String(baseMax))
  const [savingGlobal, setSavingGlobal] = useState(false)

  // Per-challenge multiplier state: { [challengeId]: string }
  const [multipliers, setMultipliers] = useState<Record<string, string>>(
    Object.fromEntries(challenges.map((c) => [c.id, String(c.xp_multiplier ?? 1.0)]))
  )
  const [savingId, setSavingId] = useState<string | null>(null)

  const handleSaveGlobal = async () => {
    const t = parseInt(threshold, 10)
    const p = parseInt(pen, 10)
    const mn = parseInt(min, 10)
    const mx = parseInt(max, 10)

    if ([t, p, mn, mx].some(isNaN) || t < 0 || t > 100 || p < 0 || mn < 0 || mx <= mn) {
      toast.error("Invalid values. Ensure threshold is 0–100, penalty ≥ 0, base min < base max.")
      return
    }

    setSavingGlobal(true)
    const result = await updateXpGlobalSettings({ scoreThreshold: t, penalty: p, baseMin: mn, baseMax: mx })
    if (result.success) {
      toast.success("Global XP formula saved")
    } else {
      toast.error(result.error ?? "Failed to save")
    }
    setSavingGlobal(false)
  }

  const handleSaveMultiplier = async (challengeId: string) => {
    const raw = multipliers[challengeId] ?? "1"
    const val = parseFloat(raw)
    if (isNaN(val) || val <= 0) {
      toast.error("Multiplier must be a positive number")
      return
    }

    setSavingId(challengeId)
    const result = await updateChallengeXpMultiplier(challengeId, val)
    if (result.success) {
      toast.success("Multiplier saved")
    } else {
      toast.error(result.error ?? "Failed to save")
    }
    setSavingId(null)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: 760 }}>

      {/* ── Section header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{
          padding: "0.5rem", borderRadius: "0.5rem",
          background: "color-mix(in srgb, #eab308 12%, transparent)",
          color: "#b45309", display: "flex",
        }}>
          <Zap style={{ width: 22, height: 22 }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--admin-gray-800)" }}>
            XP Settings
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--admin-gray-400)" }}>
            Configure how XP is calculated globally and set per-challenge multipliers
          </div>
        </div>
      </div>

      {/* ── Info callout ── */}
      <div style={{
        display: "flex", gap: "0.625rem", padding: "0.875rem 1rem",
        borderRadius: "0.5rem",
        border: "1px solid color-mix(in srgb, #eab308 30%, transparent)",
        background: "color-mix(in srgb, #eab308 6%, transparent)",
        fontSize: "0.82rem", color: "#92400e",
      }}>
        <Info style={{ width: 15, height: 15, flexShrink: 0, marginTop: 2 }} />
        <span>
          XP is awarded when a challenge closes. Base XP scales from <strong>base min</strong> (at the threshold score)
          to <strong>base max</strong> (at 100). Scores below the threshold apply a penalty to advanced-rank students only.
          Each challenge can also have a custom multiplier applied on top of the rank multiplier.
        </span>
      </div>

      {/* ── Global formula card ── */}
      <div className="admin-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--admin-gray-800)", marginBottom: "0.25rem" }}>
          Global XP Formula
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--admin-gray-700)", marginBottom: "0.3rem" }}>
              Score Threshold (0–100)
            </label>
            <p style={{ fontSize: "0.73rem", color: "var(--admin-gray-400)", marginBottom: "0.4rem" }}>
              Scores below this earn a penalty instead of XP
            </p>
            <input
              type="number" min={0} max={100} step={1}
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="admin-input"
              style={{ width: 100 }}
              disabled={savingGlobal}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--admin-gray-700)", marginBottom: "0.3rem" }}>
              Penalty (XP)
            </label>
            <p style={{ fontSize: "0.73rem", color: "var(--admin-gray-400)", marginBottom: "0.4rem" }}>
              XP deducted for low scores (advanced rank only)
            </p>
            <input
              type="number" min={0} step={1}
              value={pen}
              onChange={(e) => setPen(e.target.value)}
              className="admin-input"
              style={{ width: 100 }}
              disabled={savingGlobal}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--admin-gray-700)", marginBottom: "0.3rem" }}>
              Base XP Min
            </label>
            <p style={{ fontSize: "0.73rem", color: "var(--admin-gray-400)", marginBottom: "0.4rem" }}>
              XP earned at exactly the threshold score
            </p>
            <input
              type="number" min={0} step={1}
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className="admin-input"
              style={{ width: 100 }}
              disabled={savingGlobal}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--admin-gray-700)", marginBottom: "0.3rem" }}>
              Base XP Max
            </label>
            <p style={{ fontSize: "0.73rem", color: "var(--admin-gray-400)", marginBottom: "0.4rem" }}>
              XP earned at a perfect score of 100
            </p>
            <input
              type="number" min={1} step={1}
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className="admin-input"
              style={{ width: 100 }}
              disabled={savingGlobal}
            />
          </div>
        </div>

        <div>
          <button
            className="admin-btn admin-btn-primary"
            onClick={handleSaveGlobal}
            disabled={savingGlobal}
          >
            {savingGlobal ? "Saving…" : "Save Formula"}
          </button>
        </div>

        <div style={{
          padding: "0.75rem", borderRadius: "0.375rem",
          background: "var(--admin-gray-50)", border: "1px solid var(--admin-gray-100)",
          fontSize: "0.78rem", color: "var(--admin-gray-500)",
        }}>
          <strong>Current formula:</strong>{" "}
          Score ≥ {scoreThreshold} → {baseMin}–{baseMax} XP · Score &lt; {scoreThreshold} → −{penalty} XP (advanced only)
        </div>
      </div>

      {/* ── Per-challenge multiplier card ── */}
      <div className="admin-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--admin-gray-800)" }}>
            Per-Challenge XP Multiplier
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--admin-gray-400)", marginTop: "0.25rem" }}>
            Applied after the rank multiplier. Set to 2.0 to double XP for a specific challenge.
          </p>
        </div>

        {challenges.length === 0 ? (
          <p style={{ fontSize: "0.82rem", color: "var(--admin-gray-400)" }}>No challenges available.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Challenge</th>
                  <th>Difficulty</th>
                  <th style={{ width: 140 }}>XP Multiplier</th>
                  <th style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {challenges.map((c) => {
                  const diff = c.difficulty?.toLowerCase() ?? ""
                  const diffStyle = DIFFICULTY_COLOR[diff] ?? { bg: "#f3f4f6", color: "#6b7280" }
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 500, fontSize: "0.85rem", color: "var(--admin-gray-800)", maxWidth: 280 }}>
                        <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.title}
                        </span>
                      </td>
                      <td>
                        {c.difficulty ? (
                          <span style={{
                            fontSize: "0.75rem", fontWeight: 600, padding: "0.2rem 0.5rem",
                            borderRadius: "0.375rem", textTransform: "capitalize",
                            background: diffStyle.bg, color: diffStyle.color,
                          }}>
                            {c.difficulty}
                          </span>
                        ) : (
                          <span style={{ color: "var(--admin-gray-300)", fontSize: "0.8rem" }}>—</span>
                        )}
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0.1}
                          step={0.1}
                          value={multipliers[c.id] ?? "1"}
                          onChange={(e) => setMultipliers((prev) => ({ ...prev, [c.id]: e.target.value }))}
                          className="admin-input"
                          style={{ width: 90 }}
                          disabled={savingId === c.id}
                        />
                      </td>
                      <td>
                        <button
                          className="admin-btn admin-btn-outline admin-btn-sm"
                          onClick={() => handleSaveMultiplier(c.id)}
                          disabled={savingId === c.id}
                        >
                          {savingId === c.id ? "…" : "Save"}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
