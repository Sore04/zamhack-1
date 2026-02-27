import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Users, Building2, FileText, Trophy } from "lucide-react"
import "@/app/(admin)/admin.css"

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (currentUserProfile?.role !== "admin") redirect("/dashboard")

  const [students, companies, submissions, challenges] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("organizations").select("*", { count: "exact", head: true }),
    supabase.from("submissions").select("*", { count: "exact", head: true }),
    supabase.from("challenges").select("*", { count: "exact", head: true }),
  ])

  const stats = [
    {
      title: "Total Students",
      value: students.count || 0,
      icon: Users,
      description: "Registered student accounts",
      variant: "coral" as const,
    },
    {
      title: "Total Companies",
      value: companies.count || 0,
      icon: Building2,
      description: "Active organizations on the platform",
      variant: "blue" as const,
    },
    {
      title: "Total Submissions",
      value: submissions.count || 0,
      icon: FileText,
      description: "Project submissions across all challenges",
      variant: "green" as const,
    },
    {
      title: "Total Challenges",
      value: challenges.count || 0,
      icon: Trophy,
      description: "Challenges created by companies",
      variant: "yellow" as const,
    },
  ]

  return (
    <div className="space-y-6" data-layout="admin">

      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          Analytics <span>Overview</span>
        </h1>
        <p className="admin-page-subtitle">Real-time metrics and insights for the ZamHack platform.</p>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className={`admin-stat-card ${stat.variant}`}>
              <div className="admin-stat-header">
                <span className="admin-stat-label">{stat.title}</span>
                <div className={`admin-stat-icon ${stat.variant}`}>
                  <Icon />
                </div>
              </div>
              <div className={`admin-stat-value ${stat.variant === "coral" ? "coral" : stat.variant === "blue" ? "blue" : ""}`}>
                {stat.value.toLocaleString()}
              </div>
              <p className="admin-stat-description">{stat.description}</p>
            </div>
          )
        })}
      </div>

      {/* Placeholder for future charts */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <div className="admin-card-title">Engagement Trends</div>
            <div className="admin-card-subtitle">Charts and detailed analytics coming soon</div>
          </div>
        </div>
        <div className="admin-empty" style={{ padding: "4rem 1.5rem" }}>
          <div className="admin-empty-icon">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="admin-empty-title">Advanced Analytics</div>
          <div className="admin-empty-text">
            User growth charts, challenge metrics, and engagement reports will appear here.
          </div>
        </div>
      </div>

    </div>
  )
}