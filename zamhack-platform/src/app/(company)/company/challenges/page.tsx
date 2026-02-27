import { createClient } from "@/utils/supabase/server"
import { Database } from "@/types/supabase"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, FileText } from "lucide-react"
import { ChallengesTable } from "./challenges-table"

type Challenge = Database["public"]["Tables"]["challenges"]["Row"]

interface ChallengeWithStats extends Challenge {
  participantCount: number
  submissionCount: number
}

async function getChallengesList(): Promise<ChallengeWithStats[]> {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) redirect("/login")

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) redirect("/login")

  if (profile.role !== "company_admin" && profile.role !== "company_member") {
    redirect("/dashboard")
  }

  if (!profile.organization_id) {
    throw new Error("User does not have an organization assigned")
  }

  const { data: challenges, error: challengesError } = await supabase
    .from("challenges")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false })

  if (challengesError) {
    console.error("Error fetching challenges:", challengesError)
    return []
  }

  const challengesList = (challenges as Challenge[]) || []
  if (challengesList.length === 0) return []

  const challengeIds = challengesList.map((c) => c.id)

  // Participant counts
  const { data: participants } = await supabase
    .from("challenge_participants")
    .select("challenge_id")
    .in("challenge_id", challengeIds)

  const participantCountMap = new Map<string, number>()
  participants?.forEach((p) => {
    if (p.challenge_id) {
      participantCountMap.set(p.challenge_id, (participantCountMap.get(p.challenge_id) || 0) + 1)
    }
  })

  // Submission counts
  const { data: allParticipants } = await supabase
    .from("challenge_participants")
    .select("id, challenge_id")
    .in("challenge_id", challengeIds)

  const participantIds = allParticipants?.map((p) => p.id) || []
  const participantToChallengeMap = new Map<string, string>()
  allParticipants?.forEach((p) => {
    if (p.challenge_id && p.id) participantToChallengeMap.set(p.id, p.challenge_id)
  })

  const submissionCountMap = new Map<string, number>()
  if (participantIds.length > 0) {
    const { data: submissions } = await supabase
      .from("submissions")
      .select("participant_id")
      .in("participant_id", participantIds)

    submissions?.forEach((s) => {
      if (s.participant_id) {
        const challengeId = participantToChallengeMap.get(s.participant_id)
        if (challengeId) {
          submissionCountMap.set(challengeId, (submissionCountMap.get(challengeId) || 0) + 1)
        }
      }
    })
  }

  return challengesList.map((challenge) => ({
    ...challenge,
    participantCount: participantCountMap.get(challenge.id) || 0,
    submissionCount: submissionCountMap.get(challenge.id) || 0,
  }))
}

export default async function CompanyChallengesPage() {
  const challenges = await getChallengesList()

  const stats = {
    total: challenges.length,
    active: challenges.filter((c) => c.status === "approved" || c.status === "in_progress").length,
    pending: challenges.filter((c) => c.status === "pending_approval" || c.status === "draft").length,
    completed: challenges.filter((c) => c.status === "completed").length,
  }

  return (
    <div className="space-y-6 p-6">

      {/* ── Page Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 className="cp-page-title">Challenges</h1>
          <p className="cp-page-subtitle">Manage and track all your hackathon challenges.</p>
        </div>
        <Link href="/company/challenges/create" className="cp-btn cp-btn-primary">
          <Plus style={{ width: "1rem", height: "1rem" }} />
          Create Challenge
        </Link>
      </div>

      {/* ── Summary Stats ── */}
      <div className="cp-grid-4">
        <div className="cp-stat-card">
          <p className="cp-stat-value">{stats.total}</p>
          <p className="cp-stat-label">Total Challenges</p>
        </div>
        <div className="cp-stat-card primary">
          <p className="cp-stat-value">{stats.active}</p>
          <p className="cp-stat-label">Active</p>
        </div>
        <div className="cp-stat-card">
          <p className="cp-stat-value">{stats.pending}</p>
          <p className="cp-stat-label">Draft / Pending</p>
        </div>
        <div className="cp-stat-card navy">
          <p className="cp-stat-value">{stats.completed}</p>
          <p className="cp-stat-label">Completed</p>
        </div>
      </div>

      {/* ── Challenges Table (Client Component) ── */}
      {challenges.length === 0 ? (
        <div className="cp-card">
          <div className="cp-empty-state">
            <div className="cp-empty-icon">
              <FileText style={{ width: "1.75rem", height: "1.75rem" }} />
            </div>
            <p className="cp-empty-title">No challenges yet</p>
            <p className="cp-empty-desc">
              Create your first challenge to start attracting student talent.
            </p>
            <Link href="/company/challenges/create" className="cp-btn cp-btn-primary">
              <Plus style={{ width: "1rem", height: "1rem" }} />
              Create Challenge
            </Link>
          </div>
        </div>
      ) : (
        <ChallengesTable challenges={challenges} />
      )}
    </div>
  )
}