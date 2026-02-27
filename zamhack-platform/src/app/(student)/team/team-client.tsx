"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createTeam, joinTeam, leaveTeam, deleteTeam } from "./actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Copy, LogOut, Trash2, Users, AlertCircle,
  CheckCircle2, Crown, UserPlus, Plus, Hash, ArrowRight,
} from "lucide-react"
import { Database } from "@/types/supabase"

// ── Types (identical to original) ─────────────────────────────────────────────
type Team        = Database["public"]["Tables"]["teams"]["Row"]
type TeamMember  = Database["public"]["Tables"]["team_members"]["Row"]
type Profile     = Database["public"]["Tables"]["profiles"]["Row"]

interface TeamMemberWithProfile extends TeamMember { profile: Profile | null }
interface TeamData { team: Team; members: TeamMemberWithProfile[]; isLeader: boolean }
interface TeamPageClientProps { initialData: TeamData | null }

// ── Schemas (identical to original) ───────────────────────────────────────────
const createTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters").max(50, "Team name is too long"),
})
const joinTeamSchema = z.object({
  code: z.string().length(6, "Join code must be 6 characters").toUpperCase(),
})
type CreateTeamFormValues = z.infer<typeof createTeamSchema>
type JoinTeamFormValues   = z.infer<typeof joinTeamSchema>

// ── Helpers (identical to original) ───────────────────────────────────────────
const getInitials = (profile: Profile | null): string => {
  if (!profile) return "?"
  const f = profile.first_name?.charAt(0).toUpperCase() || ""
  const l = profile.last_name?.charAt(0).toUpperCase()  || ""
  return f && l ? `${f}${l}` : f || "?"
}
const getFullName = (profile: Profile | null): string => {
  if (!profile) return "Unknown"
  return `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Unknown"
}

// ── Small avatar sub-component ────────────────────────────────────────────────
function MemberAvatar({ profile }: { profile: Profile | null }) {
  if (profile?.avatar_url) {
    return <img src={profile.avatar_url} alt={getFullName(profile)} className="tm-avatar-img" />
  }
  return <span>{getInitials(profile)}</span>
}

// ── Main export ───────────────────────────────────────────────────────────────
export const TeamPageClient = ({ initialData }: TeamPageClientProps) => {
  const [teamData,     setTeamData]     = useState<TeamData | null>(initialData)
  const [error,        setError]        = useState<string | null>(null)
  const [success,      setSuccess]      = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied,       setCopied]       = useState(false)

  const createTeamForm = useForm<CreateTeamFormValues>({ resolver: zodResolver(createTeamSchema) })
  const joinTeamForm   = useForm<JoinTeamFormValues>  ({ resolver: zodResolver(joinTeamSchema) })

  // ── Handlers (logic identical to original) ──────────────────────────────────
  const handleCreateTeam = async (data: CreateTeamFormValues) => {
    setError(null); setSuccess(null); setIsSubmitting(true)
    try {
      const result = await createTeam(data.name)
      if (result?.error)        setError(result.error)
      else if (result?.success) { setSuccess("Team created successfully!"); window.location.reload() }
    } catch { setError("Something went wrong. Please try again.") }
    finally  { setIsSubmitting(false) }
  }

  const handleJoinTeam = async (data: JoinTeamFormValues) => {
    setError(null); setSuccess(null); setIsSubmitting(true)
    try {
      const result = await joinTeam(data.code)
      if (result?.error)        setError(result.error)
      else if (result?.success) { setSuccess("Successfully joined the team!"); window.location.reload() }
    } catch { setError("Something went wrong. Please try again.") }
    finally  { setIsSubmitting(false) }
  }

  const handleLeaveTeam = async () => {
    if (!confirm("Are you sure you want to leave this team?")) return
    setError(null); setSuccess(null); setIsSubmitting(true)
    try {
      const result = await leaveTeam()
      if (result?.error)        setError(result.error)
      else if (result?.success) { setSuccess("You have left the team"); setTeamData(null) }
    } catch { setError("Something went wrong. Please try again.") }
    finally  { setIsSubmitting(false) }
  }

  const handleDeleteTeam = async () => {
    if (!confirm("Are you sure you want to delete this team? This action cannot be undone.")) return
    setError(null); setSuccess(null); setIsSubmitting(true)
    try {
      const result = await deleteTeam()
      if (result?.error)        setError(result.error)
      else if (result?.success) { setSuccess("Team deleted successfully"); setTeamData(null) }
    } catch { setError("Something went wrong. Please try again.") }
    finally  { setIsSubmitting(false) }
  }

  const handleCopyCode = () => {
    if (!teamData?.team.join_code) return
    navigator.clipboard.writeText(teamData.team.join_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Feedback banner ──────────────────────────────────────────────────────────
  const Feedback = () => (
    <div className="tm-feedback">
      {error   && (
        <div className="tm-alert tm-alert-error">
          <AlertCircle size={15} /><span>{error}</span>
        </div>
      )}
      {success && (
        <div className="tm-alert tm-alert-success">
          <CheckCircle2 size={15} /><span>{success}</span>
        </div>
      )}
    </div>
  )

  // ════════════════════════════════════════════════════════════════════════════
  // NO TEAM STATE
  // ════════════════════════════════════════════════════════════════════════════
  if (!teamData) {
    return (
      <div className="tm-page">

        {/* Page header */}
        <div className="tm-page-header">
          <div className="tm-page-header-icon">
            <Users size={20} />
          </div>
          <div>
            <h1 className="page-title">My Team</h1>
            <p className="page-subtitle">Create or join a team to collaborate on challenges</p>
          </div>
        </div>

        <Feedback />

        {/* Action cards */}
        <div className="tm-setup-grid">

          {/* Create */}
          <div className="tm-setup-card">
            <div className="tm-setup-card-icon tm-setup-card-icon-coral">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="tm-setup-card-title">Create a Team</h2>
              <p className="tm-setup-card-desc">Start a new team and invite others to join</p>
            </div>
            <form onSubmit={createTeamForm.handleSubmit(handleCreateTeam)} className="tm-form">
              <div className="tm-field">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  placeholder="e.g. Code Rangers"
                  {...createTeamForm.register("name")}
                  disabled={isSubmitting}
                />
                {createTeamForm.formState.errors.name && (
                  <p className="tm-field-error">{createTeamForm.formState.errors.name.message}</p>
                )}
              </div>
              <button type="submit" disabled={isSubmitting} className="tm-btn-primary">
                {isSubmitting ? "Creating…" : <><Plus size={14} /> Create Team</>}
              </button>
            </form>
          </div>

          {/* Join */}
          <div className="tm-setup-card">
            <div className="tm-setup-card-icon tm-setup-card-icon-navy">
              <Hash size={20} />
            </div>
            <div>
              <h2 className="tm-setup-card-title">Join a Team</h2>
              <p className="tm-setup-card-desc">Enter a 6-character code to join an existing team</p>
            </div>
            <form onSubmit={joinTeamForm.handleSubmit(handleJoinTeam)} className="tm-form">
              <div className="tm-field">
                <Label htmlFor="joinCode">Join Code</Label>
                <Input
                  id="joinCode"
                  placeholder="ABC123"
                  maxLength={6}
                  {...joinTeamForm.register("code")}
                  disabled={isSubmitting}
                  className="uppercase font-mono tracking-widest text-center text-lg font-bold"
                />
                {joinTeamForm.formState.errors.code && (
                  <p className="tm-field-error">{joinTeamForm.formState.errors.code.message}</p>
                )}
              </div>
              <button type="submit" disabled={isSubmitting} className="tm-btn-navy">
                {isSubmitting ? "Joining…" : <><ArrowRight size={14} /> Join Team</>}
              </button>
            </form>
          </div>

        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HAS TEAM STATE
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="tm-page">

      {/* Page header */}
      <div className="tm-page-header">
        <div className="tm-team-avatar-large">
          {teamData.team.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="page-title truncate">{teamData.team.name}</h1>
          <p className="page-subtitle">
            {teamData.members.length} / 4 members ·{" "}
            {teamData.isLeader ? "You are the leader" : "You are a member"}
          </p>
        </div>
        <button
          onClick={handleLeaveTeam}
          disabled={isSubmitting || teamData.isLeader}
          title={teamData.isLeader ? "Leaders cannot leave — delete the team instead." : "Leave this team"}
          className="tm-btn-ghost-danger"
        >
          <LogOut size={15} />
          Leave Team
        </button>
      </div>

      <Feedback />

      <div className="tm-has-team-grid">

        {/* ── LEFT col: Members list ─────────────────────────────────── */}
        <div className="tm-col">
          <div className="tm-card">

            <div className="tm-card-header">
              <div>
                <h2 className="tm-card-title">Team Members</h2>
                <p className="tm-card-desc">{teamData.members.length} of 4 slots filled</p>
              </div>
              {teamData.isLeader && (
                <button
                  onClick={handleDeleteTeam}
                  disabled={isSubmitting}
                  className="tm-btn-danger-sm"
                >
                  <Trash2 size={13} /> Delete Team
                </button>
              )}
            </div>

            <div className="tm-members-list">
              {teamData.members.map((member) => {
                const isLeaderMember = teamData.team.leader_id === member.profile?.id
                return (
                  <div key={member.id} className="tm-member-row">
                    <div className="tm-avatar tm-avatar-md">
                      <MemberAvatar profile={member.profile} />
                    </div>
                    <p className="tm-member-name flex-1 min-w-0 truncate">
                      {getFullName(member.profile)}
                    </p>
                    {isLeaderMember
                      ? <span className="tm-role-leader"><Crown size={10} /> Leader</span>
                      : <span className="tm-role-member">Member</span>
                    }
                  </div>
                )
              })}

              {/* Ghost empty slots */}
              {Array.from({ length: Math.max(0, 4 - teamData.members.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="tm-member-row tm-member-empty">
                  <div className="tm-avatar tm-avatar-md tm-avatar-empty">
                    <UserPlus size={15} />
                  </div>
                  <p className="tm-empty-slot-label">Open slot</p>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── RIGHT col: Invite code ─────────────────────────────────── */}
        <div className="tm-col">
          <div className="tm-card">

            <div className="tm-card-header">
              <div>
                <h2 className="tm-card-title">Invite Members</h2>
                <p className="tm-card-desc">Share this code with anyone you want to invite</p>
              </div>
            </div>

            <div className="tm-invite-block">
              <div className="tm-invite-code-wrapper">
                <span className="tm-invite-code">{teamData.team.join_code}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className={`tm-copy-btn${copied ? " tm-copy-btn-success" : ""}`}
              >
                {copied
                  ? <><CheckCircle2 size={14} /> Copied!</>
                  : <><Copy size={14} /> Copy Code</>
                }
              </button>
              <p className="tm-invite-hint">
                Share via <strong>My Team → Join a Team</strong> and enter this code.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}