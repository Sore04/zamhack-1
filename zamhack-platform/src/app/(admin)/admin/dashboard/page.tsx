import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Database } from "@/types/supabase"
import Link from "next/link"
import { OrgApprovalActions } from "@/components/admin/org-approval-actions"
import {
  Users,
  Building2,
  Trophy,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import "@/app/(admin)/admin.css"

type Organization = Database["public"]["Tables"]["organizations"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface DashboardData {
  pendingOrgs: Organization[]
  pendingChallenges: any[]
  stats: {
    totalUsers: number
    totalOrganizations: number
    totalChallenges: number
  }
  recentUsers: (Profile & { email?: string | null })[]
}

async function getAdminDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) redirect("/login")

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile || profile.role !== "admin") redirect("/dashboard")

  const { data: pendingOrgs } = await supabase
    .from("organizations")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  const { data: pendingChallenges, error: challengeError } = await supabase
    .from("challenges")
    .select(`*, organizations (name)`)
    .eq("status", "pending_approval")
    .order("created_at", { ascending: false })

  if (challengeError) console.error("Error fetching pending challenges:", challengeError)

  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  const { count: orgCount } = await supabase
    .from("organizations")
    .select("*", { count: "exact", head: true })

  const { count: challengeCount } = await supabase
    .from("challenges")
    .select("*", { count: "exact", head: true })

  const { data: recentProfiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  return {
    pendingOrgs: pendingOrgs || [],
    pendingChallenges: pendingChallenges || [],
    stats: {
      totalUsers: userCount || 0,
      totalOrganizations: orgCount || 0,
      totalChallenges: challengeCount || 0,
    },
    recentUsers: recentProfiles || [],
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString()
}

const getUserName = (user: Profile) => {
  return `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unnamed User"
}

export default async function AdminDashboardPage() {
  const { pendingOrgs, pendingChallenges, stats, recentUsers } = await getAdminDashboardData()

  return (
    <div className="space-y-6" data-layout="admin">

      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          Super Admin <span>Dashboard</span>
        </h1>
        <p className="admin-page-subtitle">
          Manage organizations, users, and platform settings.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card coral">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Total Users</span>
            <div className="admin-stat-icon coral">
              <Users />
            </div>
          </div>
          <div className="admin-stat-value coral">{stats.totalUsers}</div>
          <p className="admin-stat-description">Registered accounts across all roles</p>
        </div>

        <div className="admin-stat-card blue">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Organizations</span>
            <div className="admin-stat-icon blue">
              <Building2 />
            </div>
          </div>
          <div className="admin-stat-value blue">{stats.totalOrganizations}</div>
          <p className="admin-stat-description">Active company accounts</p>
        </div>

        <div className="admin-stat-card green">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Challenges</span>
            <div className="admin-stat-icon green">
              <Trophy />
            </div>
          </div>
          <div className="admin-stat-value">{stats.totalChallenges}</div>
          <p className="admin-stat-description">Total created challenges</p>
        </div>

        <div className="admin-stat-card yellow">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Pending Review</span>
            <div className="admin-stat-icon yellow">
              <Clock />
            </div>
          </div>
          <div className="admin-stat-value">
            {pendingOrgs.length + pendingChallenges.length}
          </div>
          <p className="admin-stat-description">Actions requiring your attention</p>
        </div>
      </div>

      {/* Pending Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pending Organizations */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <div className="admin-card-title">Pending Organizations</div>
              <div className="admin-card-subtitle">Companies awaiting approval</div>
            </div>
            {pendingOrgs.length > 0 && (
              <span className="admin-badge yellow">
                <span className="admin-badge-dot" />
                {pendingOrgs.length} pending
              </span>
            )}
          </div>

          {pendingOrgs.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="admin-empty-title">All caught up!</div>
              <div className="admin-empty-text">No organizations awaiting approval</div>
            </div>
          ) : (
            <div>
              {pendingOrgs.slice(0, 5).map((org) => (
                <div key={org.id} className="admin-action-card">
                  <div className="admin-action-card-info">
                    <div className="admin-action-card-avatar">
                      {(org.name || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="admin-action-card-name">{org.name || "Unnamed Org"}</div>
                      <div className="admin-action-card-meta">
                        {(org as any).industry || "No industry"} · {formatDate(org.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="admin-action-card-actions">
                    <OrgApprovalActions orgId={org.id} />
                  </div>
                </div>
              ))}
              {pendingOrgs.length > 5 && (
                <div className="p-4 text-center">
                  <Link href="/admin/users?tab=companies" className="admin-btn admin-btn-outline admin-btn-sm">
                    View all {pendingOrgs.length} pending
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pending Challenges */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <div className="admin-card-title">Pending Challenges</div>
              <div className="admin-card-subtitle">Challenges awaiting approval</div>
            </div>
            {pendingChallenges.length > 0 && (
              <span className="admin-badge coral">
                <span className="admin-badge-dot" />
                {pendingChallenges.length} pending
              </span>
            )}
          </div>

          {pendingChallenges.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="admin-empty-title">All caught up!</div>
              <div className="admin-empty-text">No challenges awaiting approval</div>
            </div>
          ) : (
            <div>
              {pendingChallenges.slice(0, 5).map((challenge) => (
                <div key={challenge.id} className="admin-action-card">
                  <div className="admin-action-card-info">
                    <div
                      className="admin-action-card-avatar"
                      style={{ background: "var(--admin-coral-glow)", color: "var(--admin-coral)" }}
                    >
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="admin-action-card-name">
                        {challenge.title || "Untitled Challenge"}
                      </div>
                      <div className="admin-action-card-meta">
                        {challenge.organizations?.name || "Unknown company"} · {formatDate(challenge.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="admin-action-card-actions">
                    <Link href={`/admin/challenges?id=${challenge.id}`}>
                      <button className="admin-btn admin-btn-coral admin-btn-sm">
                        Review
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
              {pendingChallenges.length > 5 && (
                <div className="p-4 text-center">
                  <Link href="/admin/challenges" className="admin-btn admin-btn-outline admin-btn-sm">
                    View all {pendingChallenges.length} pending
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Users */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <div className="admin-card-title">Recent Users</div>
            <div className="admin-card-subtitle">Newest registrations on the platform</div>
          </div>
          <Link href="/admin/users">
            <button className="admin-btn admin-btn-outline admin-btn-sm">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>

        {recentUsers.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">
              <Users className="w-6 h-6" />
            </div>
            <div className="admin-empty-title">No users found</div>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => {
                  const name = getUserName(user)
                  const initials = name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="admin-avatar sm">{initials}</div>
                          <span
                            className="font-medium text-sm"
                            style={{ color: "var(--admin-gray-800)" }}
                          >
                            {name}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`admin-badge ${
                            user.role === "admin" ? "red" :
                            user.role === "company_admin" ? "blue" :
                            user.role === "company_member" ? "coral" :
                            "gray"
                          }`}
                        >
                          {user.role || "student"}
                        </span>
                      </td>
                      <td style={{ color: "var(--admin-gray-500)", fontSize: "0.8rem" }}>
                        {(user as any).email || "Hidden"}
                      </td>
                      <td style={{ color: "var(--admin-gray-500)", fontSize: "0.8rem" }}>
                        {formatDate(user.created_at)}
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