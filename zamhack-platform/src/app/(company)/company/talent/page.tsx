import { createClient } from "@/utils/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { Database } from "@/types/supabase"
import { Users } from "lucide-react"
import { TalentGrid } from "./talent-grid"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export interface StudentWithStats extends Profile {
  completedChallenges: number
  activeChallenges: number
}

function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const COMPLETED_STATUSES = new Set(["completed", "closed"])
const INACTIVE_STATUSES = new Set(["cancelled", "rejected", "draft", "pending_approval"])

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

  // ── DEBUG: Find Harry Potter's ID ──
  const harryPotter = students.find(
    (s) => `${s.first_name} ${s.last_name}`.toLowerCase().includes("harry")
  )
  console.log("🔍 [TALENT DEBUG] Harry Potter profile:", {
    id: harryPotter?.id,
    name: `${harryPotter?.first_name} ${harryPotter?.last_name}`,
  })

  // ── Step 1a: Direct participations ──
  const { data: directParticipations, error: dpError } = await supabase
    .from("challenge_participants")
    .select("user_id, challenge_id")
    .in("user_id", studentIds)
    .not("challenge_id", "is", null)

  console.log("🔍 [TALENT DEBUG] directParticipations error:", dpError)
  console.log("🔍 [TALENT DEBUG] directParticipations count:", directParticipations?.length)

  if (harryPotter) {
    const harryDirect = (directParticipations || []).filter(
      (p) => p.user_id === harryPotter.id
    )
    console.log("🔍 [TALENT DEBUG] Harry direct participations:", harryDirect)
  }

  // ── Step 1b: Team memberships ──
  const { data: teamMemberships, error: tmError } = await supabase
    .from("team_members")
    .select("profile_id, team_id")
    .in("profile_id", studentIds)

  console.log("🔍 [TALENT DEBUG] teamMemberships error:", tmError)

  if (harryPotter) {
    const harryTeams = (teamMemberships || []).filter(
      (tm) => tm.profile_id === harryPotter.id
    )
    console.log("🔍 [TALENT DEBUG] Harry team memberships:", harryTeams)
  }

  const teamIds = [
    ...new Set(
      (teamMemberships || []).map((tm) => tm.team_id).filter(Boolean) as string[]
    ),
  ]

  let teamParticipations: { team_id: string | null; challenge_id: string | null }[] = []
  if (teamIds.length > 0) {
    const { data, error: tpError } = await supabase
      .from("challenge_participants")
      .select("team_id, challenge_id")
      .in("team_id", teamIds)
      .not("challenge_id", "is", null)

    console.log("🔍 [TALENT DEBUG] teamParticipations error:", tpError)
    console.log("🔍 [TALENT DEBUG] teamParticipations:", data)
    teamParticipations = data || []
  }

  // Build maps
  const teamChallengeMap = new Map<string, string[]>()
  for (const tp of teamParticipations) {
    if (!tp.team_id || !tp.challenge_id) continue
    const existing = teamChallengeMap.get(tp.team_id) || []
    existing.push(tp.challenge_id)
    teamChallengeMap.set(tp.team_id, existing)
  }

  const studentChallengeMap = new Map<string, Set<string>>()

  for (const p of directParticipations || []) {
    if (!p.user_id || !p.challenge_id) continue
    const set = studentChallengeMap.get(p.user_id) || new Set<string>()
    set.add(p.challenge_id)
    studentChallengeMap.set(p.user_id, set)
  }

  for (const tm of teamMemberships || []) {
    if (!tm.profile_id || !tm.team_id) continue
    const challengeIds = teamChallengeMap.get(tm.team_id) || []
    const set = studentChallengeMap.get(tm.profile_id) || new Set<string>()
    for (const cid of challengeIds) set.add(cid)
    studentChallengeMap.set(tm.profile_id, set)
  }

  if (harryPotter) {
    const harryChallenges = studentChallengeMap.get(harryPotter.id)
    console.log("🔍 [TALENT DEBUG] Harry combined challenge IDs:", [...(harryChallenges || [])])
  }

  // ── Step 2: Fetch statuses via service role ──
  const allChallengeIds = [
    ...new Set([...studentChallengeMap.values()].flatMap((set) => [...set])),
  ]

  console.log("🔍 [TALENT DEBUG] Total unique challenge IDs to fetch:", allChallengeIds.length)

  const challengeStatusMap = new Map<string, string>()
  if (allChallengeIds.length > 0) {
    const adminSupabase = createServiceClient()
    const { data: challengeData, error: cdError } = await adminSupabase
      .from("challenges")
      .select("id, status")
      .in("id", allChallengeIds)

    console.log("🔍 [TALENT DEBUG] challenge status fetch error:", cdError)
    console.log("🔍 [TALENT DEBUG] challenges fetched:", challengeData?.length)
    console.log("🔍 [TALENT DEBUG] challenge statuses:", challengeData?.map(c => ({ id: c.id, status: c.status })))

    for (const c of challengeData || []) {
      if (c.id && c.status) challengeStatusMap.set(c.id, c.status)
    }
  }

  if (harryPotter) {
    const harryChallenges = studentChallengeMap.get(harryPotter.id) || new Set()
    for (const cid of harryChallenges) {
      console.log(`🔍 [TALENT DEBUG] Harry challenge ${cid} → status: ${challengeStatusMap.get(cid)} → classify: ${challengeStatusMap.has(cid) ? classifyStatus(challengeStatusMap.get(cid)!) : "NOT FOUND"}`)
    }
  }

  // ── Step 3: Count ──
  const completedMap = new Map<string, number>()
  const activeMap = new Map<string, number>()

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

  if (harryPotter) {
    console.log("🔍 [TALENT DEBUG] Harry FINAL → completed:", completedMap.get(harryPotter.id) || 0, "active:", activeMap.get(harryPotter.id) || 0)
  }

  return (students as Profile[]).map((s) => ({
    ...s,
    completedChallenges: completedMap.get(s.id) || 0,
    activeChallenges: activeMap.get(s.id) || 0,
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
          <div className="cp-stat-icon">
            <Users className="w-5 h-5" />
          </div>
          <p className="cp-stat-value">{students.length}</p>
          <p className="cp-stat-label">Total Students</p>
        </div>
        <div className="cp-stat-card primary">
          <p className="cp-stat-value">
            {students.filter((s) => s.completedChallenges > 0).length}
          </p>
          <p className="cp-stat-label">With Experience</p>
        </div>
        <div className="cp-stat-card">
          <p className="cp-stat-value">
            {students.filter((s) => s.activeChallenges > 0).length}
          </p>
          <p className="cp-stat-label">Currently Active</p>
        </div>
        <div className="cp-stat-card navy">
          <p className="cp-stat-value">
            {students.filter((s) => s.bio).length}
          </p>
          <p className="cp-stat-label">Full Profiles</p>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="cp-card">
          <div className="cp-empty-state">
            <div className="cp-empty-icon">
              <Users style={{ width: "1.75rem", height: "1.75rem" }} />
            </div>
            <p className="cp-empty-title">No students yet</p>
            <p className="cp-empty-desc">
              Students will appear here once they register on the platform.
            </p>
          </div>
        </div>
      ) : (
        <TalentGrid students={students} />
      )}
    </div>
  )
}