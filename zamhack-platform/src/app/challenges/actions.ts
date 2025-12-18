"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { Database } from "@/types/supabase"

// We can keep this type for reference, but we'll use 'any' for the insert object
// to allow the database default for 'status' to take over.
type ChallengeParticipant = Database["public"]["Tables"]["challenge_participants"]["Insert"]

export async function joinChallenge(challengeId: string, teamId?: string) {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to join a challenge" }
  }

  // Check if challenge exists and is joinable
  const { data: challenge, error: challengeError } = await supabase
    .from("challenges")
    .select("id, status, max_participants, max_teams")
    .eq("id", challengeId)
    .single()

  if (challengeError || !challenge) {
    return { error: "Challenge not found" }
  }

  // Check if challenge is in a joinable status
  if (challenge.status !== "approved" && challenge.status !== "in_progress") {
    return { error: "This challenge is not currently accepting participants" }
  }

  // Team join logic
  if (teamId) {
    // Verify user is the leader of the team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id, leader_id")
      .eq("id", teamId)
      .single()

    if (teamError || !team) {
      return { error: "Team not found" }
    }

    if (team.leader_id !== user.id) {
      return { error: "Only team leaders can register the team for challenges" }
    }

    // Check if team is already participating
    const { data: existingTeamParticipation } = await supabase
      .from("challenge_participants")
      .select("id")
      .eq("challenge_id", challengeId)
      .eq("team_id", teamId)
      .maybeSingle()

    if (existingTeamParticipation) {
      return { error: "This team is already participating in this challenge" }
    }

    // Check team limit
    if (challenge.max_teams) {
      const { count } = await supabase
        .from("challenge_participants")
        .select("*", { count: "exact", head: true })
        .eq("challenge_id", challengeId)
        .not("team_id", "is", null)

      if (count && count >= challenge.max_teams) {
        return { error: "This challenge has reached its maximum number of teams" }
      }
    }

    // Insert team participation (user_id must be null when team_id is set)
    const participantData: any = {
      challenge_id: challengeId,
      user_id: null,
      team_id: teamId,
      joined_at: new Date().toISOString(),
    }

    const { error: insertError } = await supabase
      .from("challenge_participants")
      .insert(participantData)

    if (insertError) {
      if (insertError.code === "23505") {
        return { error: "This team is already participating in this challenge" }
      }
      return { error: insertError.message || "Failed to join challenge" }
    }
  } else {
    // Solo join logic
    // Check if user is already a participant
    const { data: existingParticipation } = await supabase
      .from("challenge_participants")
      .select("id")
      .eq("challenge_id", challengeId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (existingParticipation) {
      return { error: "You are already participating in this challenge" }
    }

    // Check participant limit
    if (challenge.max_participants) {
      const { count } = await supabase
        .from("challenge_participants")
        .select("*", { count: "exact", head: true })
        .eq("challenge_id", challengeId)
        .is("team_id", null)

      if (count && count >= challenge.max_participants) {
        return { error: "This challenge has reached its maximum number of participants" }
      }
    }

    // Insert solo participation record
    const participantData: any = {
      challenge_id: challengeId,
      user_id: user.id,
      team_id: null,
      joined_at: new Date().toISOString(),
    }

    const { error: insertError } = await supabase
      .from("challenge_participants")
      .insert(participantData)

    if (insertError) {
      // Handle unique constraint violation or other errors
      if (insertError.code === "23505") {
        return { error: "You are already participating in this challenge" }
      }
      return { error: insertError.message || "Failed to join challenge" }
    }
  }

  // Revalidate paths to update UI immediately
  revalidatePath(`/challenges/${challengeId}`)
  revalidatePath("/dashboard")
  revalidatePath("/my-challenges")

  return { success: true }
}