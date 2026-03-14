import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Users, FileText, Star, TrendingUp } from "lucide-react"
import {
  TopSchoolsChart,
  TopSkillsChart,
  ChallengeComparisonChart,
  SubmissionsOverTimeChart,
  DegreeBreakdownChart,
  type TopSchool,
  type TopSkill,
  type ChallengePerf,
  type WeeklySubmission,
  type DegreeSlice,
} from "@/components/company/analytics-charts"

// ── Data Fetching ──────────────────────────────────────────────────────────

async function getAnalyticsData(organizationId: string) {
  const supabase = await createClient()

  // All challenges for this org
  const { data: challenges } = await supabase
    .from("challenges")
    .select("id, title, status")
    .eq("organization_id", organizationId)

  const challengeIds = (challenges || []).map(c => c.id)

  if (!challengeIds.length) {
    return { challenges: [], overview: { totalParticipants: 0, totalSubmissions: 0, avgScore: null, completionRate: 0 }, topSchools: [], topSkills: [], challengePerformance: [], submissionsOverTime: [], degreeBreakdown: [] }
  }

  // All participants across all challenges
  const { data: participants } = await supabase
    .from("challenge_participants")
    .select("id, user_id, challenge_id")
    .in("challenge_id", challengeIds)

  const participantsList = participants || []
  const participantIds = participantsList.map(p => p.id)
  const userIds = [...new Set(participantsList.map(p => p.user_id).filter(Boolean) as string[])]

  // Profiles for participants
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, first_name, last_name, university, degree").in("id", userIds)
    : { data: [] }

  const profileMap = new Map((profiles || []).map(p => [p.id, p]))

  // Submissions
  const { data: submissions } = participantIds.length
    ? await supabase.from("submissions").select("id, participant_id, submitted_at").in("participant_id", participantIds)
    : { data: [] }

  const submissionsList = submissions || []
  const submissionIds = submissionsList.map(s => s.id)

  // Evaluations
  const { data: evaluations } = submissionIds.length
    ? await supabase.from("evaluations").select("submission_id, score").in("submission_id", submissionIds).eq("is_draft", false)
    : { data: [] }

  const evaluationsList = evaluations || []

  // Student skills for these users
  const { data: studentSkills } = userIds.length
    ? await supabase.from("student_skills").select("profile_id, level, skill_id").in("profile_id", userIds)
    : { data: [] }

  // Skill names
  const skillIds = [...new Set((studentSkills || []).map(s => s.skill_id).filter(Boolean) as string[])]
  const { data: skillDefs } = skillIds.length
    ? await supabase.from("skills").select("id, name").in("id", skillIds)
    : { data: [] }

  const skillNameMap = new Map((skillDefs || []).map(s => [s.id, s.name]))

  // ── Overview ────────────────────────────────────────────────────────────

  const uniqueParticipants = userIds.length
  const totalSubmissions = submissionsList.length
  const scores = evaluationsList.map(e => e.score).filter((s): s is number => s !== null)
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
  const participantsWhoSubmitted = new Set(submissionsList.map(s => s.participant_id).filter(Boolean))
  const completionRate = uniqueParticipants > 0 ? Math.round((participantsWhoSubmitted.size / uniqueParticipants) * 100) : 0

  // ── Top Schools ─────────────────────────────────────────────────────────

  const schoolCounts = new Map<string, number>()
  for (const uid of userIds) {
    const profile = profileMap.get(uid)
    const uni = profile?.university?.trim() || "Unknown"
    schoolCounts.set(uni, (schoolCounts.get(uni) || 0) + 1)
  }
  const topSchools: TopSchool[] = [...schoolCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([university, count]) => ({ university, count }))

  // ── Degree Breakdown ────────────────────────────────────────────────────

  const degreeCounts = new Map<string, number>()
  for (const uid of userIds) {
    const profile = profileMap.get(uid)
    const deg = profile?.degree?.trim() || "Not specified"
    degreeCounts.set(deg, (degreeCounts.get(deg) || 0) + 1)
  }
  const degreeBreakdown: DegreeSlice[] = [...degreeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([degree, count]) => ({ degree, count }))

  // ── Skills Breakdown ────────────────────────────────────────────────────

  const skillMap = new Map<string, { count: number; beginner: number; intermediate: number; advanced: number }>()
  for (const ss of (studentSkills || [])) {
    if (!ss.skill_id) continue
    const name = skillNameMap.get(ss.skill_id) || "Unknown"
    const existing = skillMap.get(name) || { count: 0, beginner: 0, intermediate: 0, advanced: 0 }
    existing.count++
    if (ss.level === "beginner") existing.beginner++
    else if (ss.level === "intermediate") existing.intermediate++
    else if (ss.level === "advanced") existing.advanced++
    skillMap.set(name, existing)
  }
  const topSkills: TopSkill[] = [...skillMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 12)
    .map(([skill, v]) => ({ skill, ...v }))

  // ── Challenge Performance ───────────────────────────────────────────────

  const challengePerformance: ChallengePerf[] = (challenges || []).map(challenge => {
    const cParticipants = participantsList.filter(p => p.challenge_id === challenge.id)
    const cParticipantIds = new Set(cParticipants.map(p => p.id))
    const cSubmissions = submissionsList.filter(s => s.participant_id && cParticipantIds.has(s.participant_id))
    const cSubIds = new Set(cSubmissions.map(s => s.id))
    const cEvals = evaluationsList.filter(e => e.submission_id && cSubIds.has(e.submission_id))
    const cScores = cEvals.map(e => e.score).filter((s): s is number => s !== null)
    const cAvgScore = cScores.length > 0 ? Math.round(cScores.reduce((a, b) => a + b, 0) / cScores.length) : null
    const cWhoSubmitted = new Set(cSubmissions.map(s => s.participant_id).filter(Boolean))
    const cCompletionRate = cParticipants.length > 0
      ? Math.round((cWhoSubmitted.size / cParticipants.length) * 100)
      : 0

    return {
      title: challenge.title,
      participants: cParticipants.length,
      submissions: cSubmissions.length,
      avgScore: cAvgScore,
      completionRate: cCompletionRate,
    }
  })

  // ── Submissions Over Time (last 8 weeks) ────────────────────────────────

  const weeklyMap = new Map<string, number>()
  const now = new Date()
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i * 7)
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    weeklyMap.set(label, 0)
  }

  for (const sub of submissionsList) {
    if (!sub.submitted_at) continue
    const d = new Date(sub.submitted_at)
    // Find which week bucket it belongs to
    for (const [label] of weeklyMap.entries()) {
      const bucketDate = new Date(label + ` ${now.getFullYear()}`)
      const diff = (now.getTime() - bucketDate.getTime()) / (1000 * 60 * 60 * 24)
      const subDiff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
      if (subDiff <= diff + 7 && subDiff > diff) {
        weeklyMap.set(label, (weeklyMap.get(label) || 0) + 1)
        break
      }
    }
  }

  const submissionsOverTime: WeeklySubmission[] = [...weeklyMap.entries()].map(([week, count]) => ({ week, count }))

  return {
    challenges: challenges || [],
    overview: { totalParticipants: uniqueParticipants, totalSubmissions, avgScore, completionRate },
    topSchools,
    topSkills,
    challengePerformance,
    submissionsOverTime,
    degreeBreakdown,
  }
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function CompanyAnalyticsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .single()

  if (!profile || (profile.role !== "company_admin" && profile.role !== "company_member")) {
    redirect("/dashboard")
  }

  if (!profile.organization_id) redirect("/company/dashboard")

  const data = await getAnalyticsData(profile.organization_id)
  const { overview, topSchools, topSkills, challengePerformance, submissionsOverTime, degreeBreakdown } = data

  const statCards = [
    { label: "Unique Participants",  value: overview.totalParticipants, icon: Users,     color: "var(--cp-coral)" },
    { label: "Total Submissions",    value: overview.totalSubmissions,   icon: FileText,  color: "var(--cp-navy)" },
    { label: "Avg Score",            value: overview.avgScore !== null ? `${overview.avgScore}` : "N/A", icon: Star, color: "#6366F1" },
    { label: "Completion Rate",      value: `${overview.completionRate}%`, icon: TrendingUp, color: "#10B981" },
  ]

  return (
    <div className="cp-page space-y-8">

      {/* Header */}
      <div className="cp-page-header">
        <h1 className="cp-page-title">Talent <span>Analytics</span></h1>
        <p className="cp-page-subtitle">Insights across all your challenges and participants.</p>
      </div>

      {/* Overview stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="cp-stat-card" style={{ background: "var(--cp-white)", border: "1px solid var(--cp-border)", borderRadius: "var(--cp-radius-xl)", padding: "1.25rem", boxShadow: "var(--cp-shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--cp-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</span>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon style={{ width: 18, height: 18, color: s.color }} />
                </div>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--cp-navy)", letterSpacing: "-0.03em" }}>{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Row 1: Top Schools + Degree Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <Section title="Top Schools" subtitle="Universities most represented across your challenges">
          <TopSchoolsChart data={topSchools} />
        </Section>
        <Section title="Degree Breakdown" subtitle="Academic backgrounds of your participants">
          <DegreeBreakdownChart data={degreeBreakdown} />
        </Section>
      </div>

      {/* Row 2: Skills (full width) */}
      <Section title="Participant Skills" subtitle="Top skills across all participants, stacked by proficiency level">
        <TopSkillsChart data={topSkills} />
      </Section>

      {/* Row 3: Challenge comparison + Submissions over time */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <Section title="Challenge Comparison" subtitle="Participants vs submissions per challenge">
          <ChallengeComparisonChart data={challengePerformance} />
        </Section>
        <Section title="Submission Activity" subtitle="Weekly submissions over the last 8 weeks">
          <SubmissionsOverTimeChart data={submissionsOverTime} />
        </Section>
      </div>

      {/* Row 4: Challenge performance table */}
      <Section title="Challenge Performance" subtitle="Detailed stats per challenge">
        {challengePerformance.length === 0 ? (
          <p style={{ color: "var(--cp-text-muted)", fontSize: "0.875rem", padding: "2rem 0", textAlign: "center" }}>
            No challenge data yet.
          </p>
        ) : (
          <div className="cp-table-wrapper">
            <table className="cp-table">
              <thead>
                <tr>
                  <th>Challenge</th>
                  <th>Participants</th>
                  <th>Submissions</th>
                  <th>Avg Score</th>
                  <th>Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {challengePerformance.map((c, i) => (
                  <tr key={i}>
                    <td>{c.title}</td>
                    <td>{c.participants}</td>
                    <td>{c.submissions}</td>
                    <td>{c.avgScore !== null ? `${c.avgScore}/100` : "—"}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: "var(--cp-surface-2)", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ width: `${c.completionRate}%`, height: "100%", background: "var(--cp-coral)", borderRadius: 99 }} />
                        </div>
                        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--cp-navy)", minWidth: 36 }}>{c.completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

    </div>
  )
}

// ── Section wrapper ────────────────────────────────────────────────────────

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--cp-white)", border: "1px solid var(--cp-border)", borderRadius: "var(--cp-radius-xl)", padding: "1.5rem", boxShadow: "var(--cp-shadow-sm)" }}>
      <div style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--cp-navy)", letterSpacing: "-0.01em" }}>{title}</h2>
        {subtitle && <p style={{ fontSize: "0.8125rem", color: "var(--cp-text-muted)", marginTop: 2 }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}