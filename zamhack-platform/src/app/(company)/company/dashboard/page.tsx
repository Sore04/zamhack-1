import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { Database } from "@/types/supabase"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Briefcase,
  Users,
  Clock,
  FileText,
  ArrowRight,
  MessageCircle,
  CalendarDays,
} from "lucide-react"

type Challenge = Database["public"]["Tables"]["challenges"]["Row"]

interface RecentSubmission {
  id: string
  submitted_at: string | null
  milestone: {
    id: string
    title: string
  } | null
  challenge: {
    id: string
    title: string
  } | null
  participant: {
    id: string
    profile: {
      id: string
      first_name: string | null
      last_name: string | null
      avatar_url: string | null
    } | null
  } | null
}

interface DashboardData {
  organizationName: string
  activeChallenges: Challenge[]
  activeChallengesCount: number
  totalParticipants: number
  pendingReviews: number
  recentSubmissions: RecentSubmission[]
}

async function getCompanyDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    redirect("/login")
  }

  if (profile.role !== "company_admin" && profile.role !== "company_member") {
    redirect("/dashboard")
  }

  // --- SELF-REPAIR LOGIC START ---
  if (!profile.organization_id && profile.role === "company_admin") {
    const companyName = user.user_metadata?.company_name || "My Company"

    console.log(`[Auto-Fix] Attempting to create organization '${companyName}' for user: ${user.id}`)

    const { data: newOrg, error: createOrgError } = await supabase
      .from("organizations")
      .insert({ name: companyName })
      .select("id")
      .single()

    if (newOrg && !createOrgError) {
      console.log(`[Auto-Fix] Organization created: ${newOrg.id}. Linking to profile...`)

      const { error: linkError } = await supabase
        .from("profiles")
        .update({ organization_id: newOrg.id })
        .eq("id", user.id)

      if (!linkError) {
        console.log(`[Auto-Fix] Success! Profile linked.`)
        profile.organization_id = newOrg.id
      } else {
        console.error("[Auto-Fix] Failed to link profile:", JSON.stringify(linkError, null, 2))
      }
    } else {
      console.error("[Auto-Fix] Failed to auto-create organization:", JSON.stringify(createOrgError, null, 2))
    }
  }
  // --- SELF-REPAIR LOGIC END ---

  if (!profile.organization_id) {
    throw new Error("User does not have an organization assigned. Please contact support.")
  }

  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", profile.organization_id)
    .single()

  if (orgError || !organization) {
    throw new Error("Organization not found in database")
  }

  // Active Challenges
  const { data: activeChallenges } = await supabase
    .from("challenges")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .in("status", ["approved", "in_progress", "draft", "pending_approval"])
    .order("created_at", { ascending: false })

  const activeChallengesList = (activeChallenges as Challenge[]) || []
  const activeChallengesCount = activeChallengesList.length
  const challengeIds = activeChallengesList.map((c) => c.id)

  // Total Participants
  let totalParticipants = 0
  if (challengeIds.length > 0) {
    const { count } = await supabase
      .from("challenge_participants")
      .select("*", { count: "exact", head: true })
      .in("challenge_id", challengeIds)
    totalParticipants = count || 0
  }

  // Pending Reviews
  let pendingReviews = 0
  if (challengeIds.length > 0) {
    const { data: participants } = await supabase
      .from("challenge_participants")
      .select("id")
      .in("challenge_id", challengeIds)

    if (participants && participants.length > 0) {
      const participantIds = participants.map((p) => p.id)
      const { data: submissions } = await supabase
        .from("submissions")
        .select("id")
        .in("participant_id", participantIds)

      if (submissions && submissions.length > 0) {
        const submissionIds = submissions.map((s) => s.id)
        const { data: evaluations } = await supabase
          .from("evaluations")
          .select("submission_id, is_draft")
          .in("submission_id", submissionIds)

        const evaluatedSubmissionIds = new Set(
          (evaluations || [])
            .filter((e) => e.is_draft === false)
            .map((e) => e.submission_id)
        )
        pendingReviews = submissionIds.filter(
          (id) => !evaluatedSubmissionIds.has(id)
        ).length
      }
    }
  }

  // Recent Submissions
  let recentSubmissions: RecentSubmission[] = []
  if (challengeIds.length > 0) {
    const { data: participants } = await supabase
      .from("challenge_participants")
      .select("id, challenge_id")
      .in("challenge_id", challengeIds)

    if (participants && participants.length > 0) {
      const participantIds = participants.map((p) => p.id)
      const participantMap = new Map(
        participants.map((p) => [p.id, p.challenge_id])
      )

      const { data: submissions } = await supabase
        .from("submissions")
        .select("id, submitted_at, milestone_id, participant_id")
        .in("participant_id", participantIds)
        .order("submitted_at", { ascending: false })
        .limit(5)

      if (submissions && submissions.length > 0) {
        const milestoneIds = submissions
          .map((s) => s.milestone_id)
          .filter(Boolean) as string[]

        const challengeIdsFromSubs = submissions
          .map((s) => (s.participant_id ? participantMap.get(s.participant_id) : null))
          .filter(Boolean) as string[]

        const profileIds = participants
          .map((p) => p.id)
          .filter((id) => submissions.some((s) => s.participant_id === id)) as string[]

        const { data: milestones } = milestoneIds.length
          ? await supabase.from("milestones").select("id, title").in("id", milestoneIds)
          : { data: null }

        const { data: challenges } = challengeIdsFromSubs.length
          ? await supabase.from("challenges").select("id, title").in("id", [...new Set(challengeIdsFromSubs)])
          : { data: null }

        const { data: participantData } = profileIds.length
          ? await supabase.from("challenge_participants").select("id, user_id").in("id", profileIds)
          : { data: null }

        const userIds = [
          ...new Set((participantData || []).map((p) => p.user_id).filter(Boolean)),
        ] as string[]

        const { data: profiles } = userIds.length
          ? await supabase.from("profiles").select("id, first_name, last_name, avatar_url").in("id", userIds)
          : { data: null }

        const milestoneMap = new Map((milestones || []).map((m) => [m.id, m]))
        const challengeMap = new Map((challenges || []).map((c) => [c.id, c]))
        const profileMap = new Map((profiles || []).map((p) => [p.id, p]))
        const participantToUserIdMap = new Map((participantData || []).map((p) => [p.id, p.user_id]))

        recentSubmissions = submissions.map((sub) => {
          const userId = sub.participant_id ? participantToUserIdMap.get(sub.participant_id) : null
          const profile = userId ? profileMap.get(userId) : null
          const challengeId = sub.participant_id ? participantMap.get(sub.participant_id) : null
          const challenge = challengeId ? challengeMap.get(challengeId) : null
          const milestone = sub.milestone_id ? milestoneMap.get(sub.milestone_id) : null

          return {
            id: sub.id,
            submitted_at: sub.submitted_at,
            milestone: milestone ? { id: milestone.id, title: milestone.title } : null,
            challenge: challenge ? { id: challenge.id, title: challenge.title } : null,
            participant: profile
              ? {
                  id: sub.participant_id as string,
                  profile: {
                    id: profile.id,
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    avatar_url: profile.avatar_url,
                  },
                }
              : null,
          }
        })
      }
    }
  }

  return {
    organizationName: organization.name,
    activeChallenges: activeChallengesList,
    activeChallengesCount,
    totalParticipants,
    pendingReviews,
    recentSubmissions,
  }
}

// ── Helpers ────────────────────────────────────────────────────────
function getStatusClass(status: string | null): string {
  switch (status) {
    case "approved":         return "active"
    case "in_progress":      return "in-progress"
    case "under_review":     return "under-review"
    case "draft":            return "draft"
    case "pending_approval": return "pending"
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
    default:                 return status ?? "Unknown"
  }
}

function getProgressWidth(status: string | null): string {
  switch (status) {
    case "completed":    return "100%"
    case "under_review": return "80%"
    case "in_progress":  return "60%"
    case "approved":     return "30%"
    default:             return "10%"
  }
}

// ── Page ───────────────────────────────────────────────────────────
export default async function CompanyDashboardPage() {
  const {
    organizationName,
    activeChallenges,
    activeChallengesCount,
    totalParticipants,
    pendingReviews,
    recentSubmissions,
  } = await getCompanyDashboardData()

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStudentName = (submission: RecentSubmission) => {
    if (submission.participant?.profile) {
      const { first_name, last_name } = submission.participant.profile
      return `${first_name || ""} ${last_name || ""}`.trim() || "Unknown Student"
    }
    return "Unknown Student"
  }

  return (
    <div className="space-y-6 p-6">

      {/* ── Welcome Banner ── */}
      <div className="cp-welcome-banner">
        <p className="cp-welcome-title">Welcome back, {organizationName}! 👋</p>
        <p className="cp-welcome-subtitle">
          Here&apos;s a snapshot of your challenges and recent activity.
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="cp-grid-4">
        <div className="cp-stat-card">
          <div className="cp-stat-icon">
            <Briefcase className="w-5 h-5" />
          </div>
          <p className="cp-stat-value">{activeChallengesCount}</p>
          <p className="cp-stat-label">Active Challenges</p>
        </div>

        <div className="cp-stat-card">
          <div className="cp-stat-icon">
            <Users className="w-5 h-5" />
          </div>
          <p className="cp-stat-value">{totalParticipants}</p>
          <p className="cp-stat-label">Total Participants</p>
        </div>

        <div className="cp-stat-card primary">
          <div className="cp-stat-icon">
            <Clock className="w-5 h-5" />
          </div>
          <p className="cp-stat-value">{pendingReviews}</p>
          <p className="cp-stat-label">Pending Reviews</p>
        </div>

        <div className="cp-stat-card navy">
          <div className="cp-stat-icon">
            <FileText className="w-5 h-5" />
          </div>
          <p className="cp-stat-value">{recentSubmissions.length}</p>
          <p className="cp-stat-label">New Submissions</p>
        </div>
      </div>

      {/* ── Middle Row: Submissions table + Quick Actions ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1rem", alignItems: "start" }}>

        {/* Recent Submissions */}
        <div className="cp-card">
          <div className="cp-card-header">
            <h2 className="cp-card-title">Recent Submissions</h2>
            <Link href="/company/challenges" className="cp-btn cp-btn-ghost cp-btn-sm">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentSubmissions.length === 0 ? (
            <div className="cp-empty-state">
              <div className="cp-empty-icon">
                <FileText className="w-7 h-7" />
              </div>
              <p className="cp-empty-title">No submissions yet</p>
              <p className="cp-empty-desc">
                Once students submit to your challenges, they&apos;ll appear here.
              </p>
            </div>
          ) : (
            <div className="cp-table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table className="cp-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Challenge</th>
                    <th>Milestone</th>
                    <th>Date</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSubmissions.map((submission) => (
                    <tr key={submission.id}>
                      <td>{getStudentName(submission)}</td>
                      <td style={{ color: "var(--cp-text-secondary)", fontWeight: 500 }}>
                        {submission.challenge?.title}
                      </td>
                      <td style={{ color: "var(--cp-text-muted)", fontWeight: 400 }}>
                        {submission.milestone?.title}
                      </td>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--cp-text-muted)", fontSize: "0.8125rem" }}>
                          <CalendarDays style={{ width: "0.875rem", height: "0.875rem", color: "var(--cp-coral)" }} />
                          {formatDate(submission.submitted_at)}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Link
                          href={`/company/challenges/${submission.challenge?.id}/submissions/${submission.id}`}
                          className="cp-btn cp-btn-outline cp-btn-sm"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column: Support + Quick Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="cp-support-card">
            <p className="cp-support-card-title">Need Help?</p>
            <p className="cp-support-card-desc">
              Our admin team is ready to assist with any challenges or questions.
            </p>
            <Link href="/company/support" className="cp-support-btn">
              <MessageCircle style={{ width: "0.875rem", height: "0.875rem" }} />
              Contact Support
            </Link>
          </div>

          <div className="cp-card">
            <div className="cp-card-body">
              <p className="cp-card-title" style={{ marginBottom: "0.75rem" }}>Quick Actions</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <Link
                  href="/company/challenges/create"
                  className="cp-btn cp-btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <Briefcase style={{ width: "1rem", height: "1rem" }} />
                  Create Challenge
                </Link>
                <Link
                  href="/company/talent"
                  className="cp-btn cp-btn-ghost"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <Users style={{ width: "1rem", height: "1rem" }} />
                  Search Talent
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Challenges Grid ── */}
      <div className="cp-card">
        <div className="cp-card-header">
          <h2 className="cp-card-title">Active Challenges</h2>
          <Link href="/company/challenges" className="cp-btn cp-btn-ghost cp-btn-sm">
            Manage all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeChallenges.length === 0 ? (
          <div className="cp-empty-state">
            <div className="cp-empty-icon">
              <Briefcase className="w-7 h-7" />
            </div>
            <p className="cp-empty-title">No challenges yet</p>
            <p className="cp-empty-desc">
              Create your first challenge to start finding great talent.
            </p>
            <Link href="/company/challenges/create" className="cp-btn cp-btn-primary">
              Create Challenge
            </Link>
          </div>
        ) : (
          <div className="cp-card-body">
            <div className="cp-grid-3">
              {activeChallenges.slice(0, 6).map((challenge) => (
                <div key={challenge.id} className="cp-challenge-card">
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
                    <p className="cp-challenge-title" title={challenge.title}>
                      {challenge.title}
                    </p>
                    <span className={`cp-badge ${getStatusClass(challenge.status)}`}>
                      <span className="cp-badge-dot" />
                      {getStatusLabel(challenge.status)}
                    </span>
                  </div>

                  {challenge.description && (
                    <p style={{
                      fontSize: "0.8125rem",
                      color: "var(--cp-text-muted)",
                      marginTop: "0.5rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical" as const,
                      overflow: "hidden",
                    }}>
                      {challenge.description}
                    </p>
                  )}

                  <div className="cp-challenge-meta">
                    {challenge.difficulty && (
                      <span className="cp-challenge-meta-item">
                        <span style={{ color: "var(--cp-coral)", fontSize: "0.6rem" }}>●</span>
                        {challenge.difficulty}
                      </span>
                    )}
                    {challenge.end_date && (
                      <span className="cp-challenge-meta-item">
                        <CalendarDays style={{ width: "0.875rem", height: "0.875rem", color: "var(--cp-coral)" }} />
                        Ends {formatDate(challenge.end_date)}
                      </span>
                    )}
                  </div>

                  <div className="cp-progress-bar">
                    <div
                      className="cp-progress-fill"
                      style={{ width: getProgressWidth(challenge.status) }}
                    />
                  </div>

                  <div style={{ marginTop: "1rem" }}>
                    <Link
                      href={`/company/challenges/${challenge.id}`}
                      className="cp-btn cp-btn-ghost cp-btn-sm"
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      Manage Challenge
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}