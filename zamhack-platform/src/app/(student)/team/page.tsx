import { createClient } from "@/utils/supabase/server"
import { Database } from "@/types/supabase"
import { redirect } from "next/navigation"
import { TeamPageClient } from "./team-client"

type Team = Database["public"]["Tables"]["teams"]["Row"]
type TeamMember = Database["public"]["Tables"]["team_members"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface TeamMemberWithProfile extends TeamMember {
  profile: Profile | null
}

interface TeamData {
  team: Team
  members: TeamMemberWithProfile[]
  isLeader: boolean
}

async function getTeamData(): Promise<TeamData | null> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is in a team
  const { data: teamMember } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("profile_id", user.id)
    .maybeSingle()

  // FIX: Extract team_id to a variable first to satisfy TypeScript
  const teamId = teamMember?.team_id

  if (!teamId) {
    return null
  }

  // Fetch team details
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId) // Use the variable here
    .single()

  if (teamError || !team) {
    return null
  }

  // Fetch all team members
  const { data: members, error: membersError } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", team.id)
    .order("joined_at", { ascending: true })

  if (membersError) {
    console.error("Error fetching team members:", membersError)
    return null
  }

  // Fetch profiles for all members
  const profileIds = (members || [])
    .map((m) => m.profile_id)
    .filter((id): id is string => id !== null)

  let profilesMap: Record<string, Profile> = {}
  if (profileIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", profileIds)

    if (!profilesError && profiles) {
      profilesMap = profiles.reduce((acc, profile) => {
        acc[profile.id] = profile
        return acc
      }, {} as Record<string, Profile>)
    }
  }

  const membersWithProfiles: TeamMemberWithProfile[] = (members || []).map((member) => ({
    ...member,
    profile: member.profile_id ? profilesMap[member.profile_id] || null : null,
  }))

  const isLeader = team.leader_id === user.id

  return {
    team,
    members: membersWithProfiles,
    isLeader,
  }
}

const TeamPage = async () => {
  const teamData = await getTeamData()

  return <TeamPageClient initialData={teamData} />
}

export default TeamPage