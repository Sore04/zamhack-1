import { Users, Trophy, Building2, Timer, ArrowRight, CheckCircle2, Lock, Zap, CalendarDays } from "lucide-react"
import Link from "next/link"
import { Database } from "@/types/supabase"

// ── Types (unchanged from original) ──────────────────────────────────────────
type ChallengeWithOrg = Database["public"]["Tables"]["challenges"]["Row"] & {
  organization: {
    name: string
  } | null
}

interface ChallengeCardProps {
  challenge: ChallengeWithOrg
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getStatusLabel(status: string | null): string {
  switch (status) {
    case "approved":
    case "in_progress":       return "In Progress"
    case "pending_approval":  return "Pending Approval"
    case "under_review":      return "Under Review"
    case "completed":         return "Completed"
    case "closed":            return "Closed"
    case "cancelled":         return "Cancelled"
    case "draft":             return "Draft"
    default:                  return status?.replace(/_/g, " ") ?? "Unknown"
  }
}

function getStatusClass(status: string | null): string {
  switch (status) {
    case "approved":
    case "in_progress":       return "cc-status-active"
    case "under_review":      return "cc-status-review"
    case "completed":
    case "closed":            return "cc-status-closed"
    case "cancelled":         return "cc-status-cancelled"
    default:                  return "cc-status-draft"
  }
}

function getDiffClass(difficulty: string | null): string {
  switch (difficulty?.toLowerCase()) {
    case "beginner":     return "cc-diff-beginner"
    case "intermediate": return "cc-diff-intermediate"
    case "advanced":     return "cc-diff-advanced"
    case "expert":       return "cc-diff-expert"
    default:             return "cc-diff-beginner"
  }
}

function formatCurrency(amount: number | null, currency: string | null): string {
  if (!amount || amount === 0) return "Free"
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: currency || "PHP",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDeadline(dateStr: string | null): { label: string; urgent: boolean } {
  if (!dateStr) return { label: "No deadline", urgent: false }
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
  if (diff < 0)  return { label: "Ended",        urgent: false }
  if (diff === 0) return { label: "Ends today",   urgent: true }
  if (diff === 1) return { label: "1 day left",   urgent: true }
  if (diff <= 7)  return { label: `${diff} days left`, urgent: true }
  return {
    label: new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    urgent: false,
  }
}

// Deterministic accent stripe color per org name
function orgAccentClass(name: string | undefined | null): string {
  const palette = ["cc-accent-coral", "cc-accent-navy", "cc-accent-indigo", "cc-accent-emerald", "cc-accent-amber"]
  const idx = (name ?? "").split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  return palette[idx % palette.length]
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const isClosed    = challenge.status === "closed" || challenge.status === "completed"
  const isCancelled = challenge.status === "cancelled"
  const isInactive  = isClosed || isCancelled

  const deadline    = formatDeadline(challenge.end_date)
  const accentClass = orgAccentClass(challenge.organization?.name)

  return (
    <article className={`cc-card${isInactive ? " cc-card-inactive" : ""}`}>

      {/* ── Coloured top stripe ────────────────────────────────────────── */}
      <div className={`cc-stripe ${accentClass}`} />

      {/* ── Card header ───────────────────────────────────────────────── */}
      <div className="cc-header">
        <div className="cc-header-top">
          <span className={`cc-status-badge ${getStatusClass(challenge.status)}`}>
            {getStatusLabel(challenge.status)}
          </span>
          {challenge.difficulty && (
            <span className={`cc-diff-badge ${getDiffClass(challenge.difficulty)}`}>
              {challenge.difficulty}
            </span>
          )}
        </div>

        <h3 className="cc-title">{challenge.title}</h3>

        <div className="cc-org">
          <Building2 size={12} />
          <span>{challenge.organization?.name ?? "Unknown Org"}</span>
        </div>
      </div>

      {/* ── Description ───────────────────────────────────────────────── */}
      <div className="cc-body">
        <p className="cc-desc">{challenge.description}</p>
      </div>

      {/* ── Meta strip ────────────────────────────────────────────────── */}
      <div className="cc-meta">
        <div className="cc-meta-item">
          <Users size={13} />
          <span>{challenge.max_participants ? `${challenge.max_participants} slots` : "Unlimited"}</span>
        </div>

        <div className="cc-meta-item">
          <Trophy size={13} />
          <span>{formatCurrency(challenge.entry_fee_amount, challenge.currency)}</span>
        </div>

        <div className={`cc-meta-item cc-meta-deadline${deadline.urgent ? " cc-urgent" : ""}`}>
          <CalendarDays size={13} />
          <span>{deadline.label}</span>
        </div>
      </div>

      {/* ── Participation type pill ────────────────────────────────────── */}
      {challenge.participation_type && (
        <div className="cc-pills">
          <span className="cc-pill">
            <Zap size={10} strokeWidth={2.5} />
            {challenge.participation_type.charAt(0).toUpperCase() + challenge.participation_type.slice(1)}
          </span>
        </div>
      )}

      {/* ── CTA footer ────────────────────────────────────────────────── */}
      <div className="cc-footer">
        <Link
          href={`/challenges/${challenge.id}`}
          className={`cc-cta ${isInactive ? "cc-cta-muted" : "cc-cta-primary"}`}
        >
          {isClosed ? (
            <><CheckCircle2 size={14} /> View Results</>
          ) : isCancelled ? (
            <><Lock size={14} /> Cancelled</>
          ) : (
            <>View Details <ArrowRight size={14} /></>
          )}
        </Link>
      </div>

    </article>
  )
}