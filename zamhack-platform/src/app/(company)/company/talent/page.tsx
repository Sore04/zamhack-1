import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Database } from "@/types/supabase"
import { Users } from "lucide-react"
import { TalentGrid } from "./talent-grid"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export interface StudentWithStats extends Profile {
  completedChallenges: number
  activeChallenges: number
}

const COMPLETED_STATUSES = new Set(["completed", "closed"])
const INACTIVE_STATUSES  = new Set(["cancelled", "rejected", "draft", "pending_approval"])

function classifyStatus(status: string): "completed" | "active" | "none" {
  if (COMPLETED_STATUSES.has(status)) return "completed"
  if (INACTIVE_STATUSES.has(status))  return "none"
  return "active"
}

async function getTalentData(): Promise<StudentWithStats[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || (profile.role !== "company_admin" && profile.role !== "company_member")) {
    redirect("/dashboard")
  }

  const { data: students, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("created_at", { ascending: false })

  if (error || !students || students.length === 0) return []

  const studentIds = students.map((s) => s.id)

  // ── Direct participations ──
  const { data: directParticipations } = await supabase
    .from("challenge_participants")
    .select("user_id, challenge_id")
    .in("user_id", studentIds)
    .not("challenge_id", "is", null)

  // ── Team-based participations ──
  const { data: teamMemberships } = await supabase
    .from("team_members")
    .select("profile_id, team_id")
    .in("profile_id", studentIds)

  const teamIds = [
    ...new Set(
      (teamMemberships || []).map((tm) => tm.team_id).filter(Boolean) as string[]
    ),
  ]

  const leaderByTeam = new Map<string, string>()
  if (teamIds.length > 0) {
    const { data: teamsData } = await supabase
      .from("teams")
      .select("id, leader_id")
      .in("id", teamIds)
    for (const t of teamsData || []) {
      if (t.id && t.leader_id) leaderByTeam.set(t.id, t.leader_id)
    }
  }

  const leaderIds = [...new Set([...leaderByTeam.values()])]
  const leaderChallengeMap = new Map<string, string[]>()

  if (leaderIds.length > 0) {
    const { data: leaderParticipations } = await supabase
      .from("challenge_participants")
      .select("user_id, challenge_id")
      .in("user_id", leaderIds)
      .not("challenge_id", "is", null)
    for (const lp of leaderParticipations || []) {
      if (!lp.user_id || !lp.challenge_id) continue
      const existing = leaderChallengeMap.get(lp.user_id) || []
      existing.push(lp.challenge_id)
      leaderChallengeMap.set(lp.user_id, existing)
    }
  }

  // ── Build per-student challenge set ──
  const studentChallengeMap = new Map<string, Set<string>>()

  for (const p of directParticipations || []) {
    if (!p.user_id || !p.challenge_id) continue
    const set = studentChallengeMap.get(p.user_id) || new Set<string>()
    set.add(p.challenge_id)
    studentChallengeMap.set(p.user_id, set)
  }

  for (const tm of teamMemberships || []) {
    if (!tm.profile_id || !tm.team_id) continue
    const leaderId = leaderByTeam.get(tm.team_id)
    if (!leaderId) continue
    const leaderChallenges = leaderChallengeMap.get(leaderId) || []
    const set = studentChallengeMap.get(tm.profile_id) || new Set<string>()
    for (const cid of leaderChallenges) set.add(cid)
    studentChallengeMap.set(tm.profile_id, set)
  }

  // ── Fetch challenge statuses ──
  const allChallengeIds = [
    ...new Set([...studentChallengeMap.values()].flatMap((s) => [...s])),
  ]

  const challengeStatusMap = new Map<string, string>()
  if (allChallengeIds.length > 0) {
    const { data: challengeData } = await supabase
      .from("challenges")
      .select("id, status")
      .in("id", allChallengeIds)
    for (const c of challengeData || []) {
      if (c.id && c.status) challengeStatusMap.set(c.id, c.status)
    }
  }

  // ── Count per student ──
  const completedMap = new Map<string, number>()
  const activeMap    = new Map<string, number>()

  for (const [studentId, challengeIds] of studentChallengeMap.entries()) {
    for (const challengeId of challengeIds) {
      const status = challengeStatusMap.get(challengeId)
      if (!status) continue
      const classification = classifyStatus(status)
      if (classification === "completed") {
        completedMap.set(studentId, (completedMap.get(studentId) || 0) + 1)
      } else if (classification === "active") {
        activeMap.set(studentId, (activeMap.get(studentId) || 0) + 1)
      }
    }
  }

  return (students as Profile[]).map((s) => ({
    ...s,
    completedChallenges: completedMap.get(s.id) || 0,
    activeChallenges:    activeMap.get(s.id)    || 0,
  }))
}

export default async function TalentPage() {
  const students = await getTalentData()

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="cp-page-title">Talent Search</h1>
        <p className="cp-page-subtitle">
          Discover and connect with students ready to solve your challenges.
        </p>
      </div>

      <div className="cp-grid-4">
        <div className="cp-stat-card">
          <div className="cp-stat-icon"><Users className="w-5 h-5" /></div>
          <p className="cp-stat-value">{students.length}</p>
          <p className="cp-stat-label">Total Students</p>
        </div>
        <div className="cp-stat-card primary">
          <p className="cp-stat-value">{students.filter((s) => s.completedChallenges > 0).length}</p>
          <p className="cp-stat-label">With Experience</p>
        </div>
        <div className="cp-stat-card">
          <p className="cp-stat-value">{students.filter((s) => s.activeChallenges > 0).length}</p>
          <p className="cp-stat-label">Currently Active</p>
        </div>
        <div className="cp-stat-card navy">
          <p className="cp-stat-value">{students.filter((s) => s.bio).length}</p>
          <p className="cp-stat-label">Full Profiles</p>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="cp-card">
          <div className="cp-empty-state">
            <div className="cp-empty-icon"><Users style={{ width: "1.75rem", height: "1.75rem" }} /></div>
            <p className="cp-empty-title">No students yet</p>
            <p className="cp-empty-desc">Students will appear here once they register on the platform.</p>
          </div>
        </div>
      ) : (
        <TalentGrid students={students} />
      )}
    </div>
  )
}