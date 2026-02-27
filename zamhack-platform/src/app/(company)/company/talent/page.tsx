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

async function getTalentData(): Promise<StudentWithStats[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Verify company role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (
    !profile ||
    (profile.role !== "company_admin" && profile.role !== "company_member")
  ) {
    redirect("/dashboard")
  }

  // Fetch all students
  const { data: students, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("created_at", { ascending: false })

  if (error || !students || students.length === 0) return []

  const studentIds = students.map((s) => s.id)

  // Fetch challenge participation counts per student
  const { data: participations } = await supabase
    .from("challenge_participants")
    .select("user_id, challenge_id, challenges(status)")
    .in("user_id", studentIds)

  // Build maps
  const completedMap = new Map<string, number>()
  const activeMap = new Map<string, number>()

  if (participations) {
    participations.forEach((p: any) => {
      const uid = p.user_id
      if (!uid) return
      const status = p.challenges?.status
      if (status === "completed") {
        completedMap.set(uid, (completedMap.get(uid) || 0) + 1)
      } else if (status === "approved" || status === "in_progress") {
        activeMap.set(uid, (activeMap.get(uid) || 0) + 1)
      }
    })
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
      {/* Header */}
      <div>
        <h1 className="cp-page-title">Talent Search</h1>
        <p className="cp-page-subtitle">
          Discover and connect with students ready to solve your challenges.
        </p>
      </div>

      {/* Summary Stats */}
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

      {/* Talent Grid (Client Component) */}
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