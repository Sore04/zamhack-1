import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Database } from "@/types/supabase"
import { Building2, ShieldAlert } from "lucide-react"
import { OrgForm } from "./org-form"

type Organization = Database["public"]["Tables"]["organizations"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface OrgPageData {
  organization: Organization
  members: Profile[]
  challengeCount: number
  currentUserId: string
}

async function getOrgData(): Promise<OrgPageData | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single()

  if (!profile?.organization_id) redirect("/company/dashboard")

  if (profile.role !== "company_admin") return null

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", profile.organization_id)
    .single()

  if (!organization) redirect("/company/dashboard")

  // Fetch team members in same org
  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .in("role", ["company_admin", "company_member"])
    .order("created_at", { ascending: true })

  // Fetch total challenge count
  const { count: challengeCount } = await supabase
    .from("challenges")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", profile.organization_id)

  return {
    organization,
    members: (members as Profile[]) || [],
    challengeCount: challengeCount || 0,
    currentUserId: user.id,
  }
}

export default async function OrganizationPage() {
  const data = await getOrgData()

  if (!data) {
    return (
      <div className="p-6 max-w-lg">
        <div className="cp-card" style={{ padding: "2rem", textAlign: "center" }}>
          <div style={{
            width: "3.5rem", height: "3.5rem", borderRadius: "50%",
            background: "rgba(239,68,68,0.1)", color: "#B91C1C",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1rem",
          }}>
            <ShieldAlert style={{ width: "1.5rem", height: "1.5rem" }} />
          </div>
          <h2 style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--cp-navy)", marginBottom: "0.5rem" }}>
            Access Denied
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--cp-text-muted)" }}>
            Only company administrators can manage organization settings.
          </p>
        </div>
      </div>
    )
  }

  const { organization, members, challengeCount, currentUserId } = data

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="cp-page-title">Organization Settings</h1>
        <p className="cp-page-subtitle">Manage your company profile, branding, and team.</p>
      </div>

      {/* Main layout — form left, sidebar right */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>
        {/* ── Left: Form ── */}
        <OrgForm organization={organization} />

        {/* ── Right: Sidebar ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Org Identity Card */}
          <div className="cp-card">
            <div style={{
              height: "72px",
              background: "var(--cp-grad-hero)",
              borderRadius: "var(--cp-radius-xl, 20px) var(--cp-radius-xl, 20px) 0 0",
              position: "relative",
            }} />
            <div style={{ padding: "0 1.25rem 1.25rem", marginTop: "-2rem" }}>
              <div style={{
                width: "4rem", height: "4rem",
                borderRadius: "var(--cp-radius-lg, 16px)",
                background: organization.logo_url ? "transparent" : "var(--cp-grad-coral)",
                border: "3px solid white",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                marginBottom: "0.75rem",
              }}>
                {organization.logo_url ? (
                  <img src={organization.logo_url} alt={organization.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Building2 style={{ width: "1.5rem", height: "1.5rem", color: "white" }} />
                )}
              </div>
              <p style={{ fontWeight: 800, fontSize: "1rem", color: "var(--cp-navy)", letterSpacing: "-0.01em" }}>
                {organization.name}
              </p>
              {organization.industry && (
                <p style={{ fontSize: "0.8125rem", color: "var(--cp-text-muted)", marginTop: "0.2rem" }}>
                  {organization.industry}
                </p>
              )}
              {organization.website && (
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.3rem",
                    fontSize: "0.75rem", color: "var(--cp-coral-dark)",
                    textDecoration: "none", marginTop: "0.5rem", fontWeight: 600,
                  }}
                >
                  {organization.website.replace(/^https?:\/\//, "")} ↗
                </a>
              )}

              {/* Status badge */}
              <div style={{ marginTop: "0.875rem" }}>
                <span className={`cp-badge ${(organization as any).status === "approved" || !(organization as any).status ? "active" : "pending"}`}>
                  <span className="cp-badge-dot" />
                  {(organization as any).status === "approved" || !(organization as any).status ? "Verified" : "Pending Approval"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="cp-card">
            <div className="cp-card-header" style={{ paddingBottom: "0.875rem" }}>
              <p className="cp-card-title">Overview</p>
            </div>
            <div className="cp-card-body" style={{ padding: "0.875rem 1.25rem 1.25rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8125rem", color: "var(--cp-text-muted)" }}>Total Challenges</span>
                  <span style={{ fontWeight: 700, color: "var(--cp-navy)", fontSize: "0.9375rem" }}>{challengeCount}</span>
                </div>
                <div style={{ height: "1px", background: "var(--cp-border)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8125rem", color: "var(--cp-text-muted)" }}>Team Members</span>
                  <span style={{ fontWeight: 700, color: "var(--cp-navy)", fontSize: "0.9375rem" }}>{members.length}</span>
                </div>
                <div style={{ height: "1px", background: "var(--cp-border)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8125rem", color: "var(--cp-text-muted)" }}>Member Since</span>
                  <span style={{ fontWeight: 600, color: "var(--cp-text-secondary)", fontSize: "0.8125rem" }}>
                    {organization.created_at
                      ? new Date(organization.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="cp-card">
            <div className="cp-card-header">
              <p className="cp-card-title">Team Members</p>
              <span style={{
                fontSize: "0.75rem", fontWeight: 700,
                background: "var(--cp-coral-muted)", color: "var(--cp-coral-dark)",
                padding: "0.2rem 0.5rem", borderRadius: "99px",
              }}>
                {members.length}
              </span>
            </div>
            <div className="cp-card-body" style={{ padding: "0.75rem 1.25rem 1.25rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {members.map((member) => {
                  const name = `${member.first_name || ""} ${member.last_name || ""}`.trim() || "Team Member"
                  const initials = `${member.first_name?.charAt(0) || ""}${member.last_name?.charAt(0) || ""}`.toUpperCase() || "?"
                  const isAdmin = member.role === "company_admin"
                  const isYou = member.id === currentUserId

                  return (
                    <div key={member.id} style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.625rem",
                      borderRadius: "var(--cp-radius-md, 12px)",
                      background: isYou ? "var(--cp-coral-muted)" : "var(--cp-surface)",
                    }}>
                      {/* Avatar */}
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={name}
                          style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{
                          width: "2.25rem", height: "2.25rem", borderRadius: "50%", flexShrink: 0,
                          background: isAdmin ? "var(--cp-grad-navy)" : "var(--cp-grad-coral)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "white", fontWeight: 700, fontSize: "0.75rem",
                        }}>
                          {initials}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                          <p style={{
                            fontWeight: 600, fontSize: "0.8125rem", color: "var(--cp-navy)",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}>
                            {name}
                          </p>
                          {isYou && (
                            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--cp-coral-dark)", flexShrink: 0 }}>You</span>
                          )}
                        </div>
                        <p style={{ fontSize: "0.7rem", color: "var(--cp-text-muted)", marginTop: "0.1rem" }}>
                          {isAdmin ? "Admin" : "Member"}
                        </p>
                      </div>
                      {isAdmin && (
                        <div style={{
                          width: "1.5rem", height: "1.5rem", borderRadius: "50%",
                          background: "var(--cp-navy-muted)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          <ShieldAlert style={{ width: "0.75rem", height: "0.75rem", color: "var(--cp-navy)" }} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}