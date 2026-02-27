import { createClient } from "@/utils/supabase/server"
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog"
import { Database } from "@/types/supabase"
import { redirect } from "next/navigation"
import { Github, Linkedin, FileText, GraduationCap, BookOpen, ExternalLink } from "lucide-react"

// ── Types (identical to original) ─────────────────────────────────────────────
type Profile = Database["public"]["Tables"]["profiles"]["Row"]

// ── Data fetching (identical to original) ─────────────────────────────────────
async function getProfileData() {
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
    .select("*")
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.error("Error fetching profile:", profileError)
  }

  return {
    profile: profile as Profile | null,
    user,
  }
}

// ── Helper (identical to original) ────────────────────────────────────────────
const getInitials = (firstName: string | null, lastName: string | null): string => {
  const first = firstName?.charAt(0).toUpperCase() || ""
  const last  = lastName?.charAt(0).toUpperCase()  || ""
  return first + last || "U"
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function ProfilePage() {
  const { profile } = await getProfileData()

  const fullName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User"
    : "User"

  // Same headline logic as original
  const headline = profile
    ? [profile.university, profile.degree].filter(Boolean).join(" • ") || "No education information"
    : "No education information"

  const initials = getInitials(profile?.first_name || null, profile?.last_name || null)

  // Collect social links that actually exist
  const socialLinks = [
    { href: profile?.github_url,   label: "GitHub",   icon: Github   },
    { href: profile?.linkedin_url, label: "LinkedIn",  icon: Linkedin },
    { href: profile?.resume_link,  label: "Resume",    icon: FileText },
  ].filter((l) => Boolean(l.href))

  return (
    <div className="pf-page">

      {/* ── Hero card ──────────────────────────────────────────────────── */}
      <div className="pf-hero">
        {/* Gradient banner */}
        <div className="pf-hero-banner" />

        <div className="pf-hero-body">
          {/* Avatar */}
          <div className="pf-avatar-wrapper">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={fullName}
                className="pf-avatar-img"
              />
            ) : (
              <span className="pf-avatar-initials">{initials}</span>
            )}
          </div>

          {/* Identity + edit button */}
          <div className="pf-hero-info">
            <div className="pf-hero-name-row">
              <div>
                <h1 className="pf-name">{fullName}</h1>
                <p className="pf-headline">{headline}</p>
              </div>
              {/* EditProfileDialog is unchanged — just repositioned */}
              <EditProfileDialog profile={profile} />
            </div>

            {/* Social pills (only shown if links exist) */}
            {socialLinks.length > 0 && (
              <div className="pf-social-row">
                {socialLinks.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pf-social-pill"
                  >
                    <Icon size={13} />
                    {label}
                    <ExternalLink size={11} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content grid ───────────────────────────────────────────────── */}
      <div className="pf-grid">

        {/* ── Left column ────────────────────────────────────────────── */}
        <div className="pf-col">

          {/* About Me */}
          <div className="pf-card">
            <div className="pf-card-header">
              <div className="pf-card-icon">
                <BookOpen size={15} />
              </div>
              <h2 className="pf-card-title">About Me</h2>
            </div>
            <div className="pf-card-body">
              {profile?.bio ? (
                <p className="pf-bio">{profile.bio}</p>
              ) : (
                <p className="pf-empty">No bio added yet. Click Edit Profile to add one.</p>
              )}
            </div>
          </div>

          {/* Social Links (full list) */}
          <div className="pf-card">
            <div className="pf-card-header">
              <div className="pf-card-icon pf-card-icon-navy">
                <ExternalLink size={15} />
              </div>
              <h2 className="pf-card-title">Social Links</h2>
            </div>
            <div className="pf-links-list">
              {/* GitHub */}
              {profile?.github_url ? (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="pf-link-row">
                  <div className="pf-link-icon"><Github size={15} /></div>
                  <span className="pf-link-label">GitHub</span>
                  <ExternalLink size={12} className="pf-link-arrow" />
                </a>
              ) : (
                <div className="pf-link-row pf-link-empty">
                  <div className="pf-link-icon"><Github size={15} /></div>
                  <span className="pf-link-label pf-empty">No GitHub link added</span>
                </div>
              )}

              {/* LinkedIn */}
              {profile?.linkedin_url ? (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="pf-link-row">
                  <div className="pf-link-icon"><Linkedin size={15} /></div>
                  <span className="pf-link-label">LinkedIn</span>
                  <ExternalLink size={12} className="pf-link-arrow" />
                </a>
              ) : (
                <div className="pf-link-row pf-link-empty">
                  <div className="pf-link-icon"><Linkedin size={15} /></div>
                  <span className="pf-link-label pf-empty">No LinkedIn link added</span>
                </div>
              )}

              {/* Resume */}
              {profile?.resume_link ? (
                <a href={profile.resume_link} target="_blank" rel="noopener noreferrer" className="pf-link-row">
                  <div className="pf-link-icon"><FileText size={15} /></div>
                  <span className="pf-link-label">Resume</span>
                  <ExternalLink size={12} className="pf-link-arrow" />
                </a>
              ) : (
                <div className="pf-link-row pf-link-empty">
                  <div className="pf-link-icon"><FileText size={15} /></div>
                  <span className="pf-link-label pf-empty">No resume link added</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Right column ───────────────────────────────────────────── */}
        <div className="pf-col">

          {/* Education */}
          <div className="pf-card">
            <div className="pf-card-header">
              <div className="pf-card-icon pf-card-icon-navy">
                <GraduationCap size={15} />
              </div>
              <h2 className="pf-card-title">Education</h2>
            </div>
            <div className="pf-card-body">
              {profile?.university || profile?.degree || profile?.graduation_year ? (
                <div className="pf-edu-block">
                  {profile?.university && (
                    <div className="pf-edu-row">
                      <span className="pf-edu-label">University</span>
                      <span className="pf-edu-value">{profile.university}</span>
                    </div>
                  )}
                  {profile?.degree && (
                    <div className="pf-edu-row">
                      <span className="pf-edu-label">Degree</span>
                      <span className="pf-edu-value">{profile.degree}</span>
                    </div>
                  )}
                  {profile?.graduation_year && (
                    <div className="pf-edu-row">
                      <span className="pf-edu-label">Graduation Year</span>
                      <span className="pf-edu-value">{profile.graduation_year}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="pf-empty">No education information added yet.</p>
              )}
            </div>
          </div>

          {/* Skills — placeholder (identical to original) */}
          <div className="pf-card">
            <div className="pf-card-header">
              <div className="pf-card-icon pf-card-icon-navy">
                <span style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "-0.02em" }}>SK</span>
              </div>
              <h2 className="pf-card-title">Skills</h2>
            </div>
            <div className="pf-card-body">
              <p className="pf-empty">Skills section coming soon.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}