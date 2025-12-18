"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { Database } from "@/types/supabase"

type ChallengeStatus = Database["public"]["Enums"]["challenge_status"]
type ProficiencyLevel = Database["public"]["Enums"]["proficiency_level"]

interface MilestoneInput {
  title: string
  description?: string
  dueDate: string
  requiresGithub: boolean
  requiresUrl: boolean
  requiresText: boolean
}

interface CreateChallengeInput {
  title: string
  description: string
  industry: string
  difficulty: ProficiencyLevel
  participationType: "solo" | "team" | "both"
  maxParticipants?: number
  maxTeams?: number
  maxTeamSize?: number
  startDate: string
  endDate: string
  registrationDeadline?: string
  milestones: MilestoneInput[]
  skills: string[]
  organizationId: string
}

export const createChallenge = async (
  input: CreateChallengeInput
): Promise<{ success: boolean; challengeId?: string; error?: string }> => {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "Not authenticated" }
  }

  // Verify user has organization
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return { success: false, error: "User profile not found" }
  }

  if (profile.role !== "company_admin" && profile.role !== "company_member") {
    return { success: false, error: "Unauthorized" }
  }

  if (profile.organization_id !== input.organizationId) {
    return { success: false, error: "Organization mismatch" }
  }

  try {
    // Step 1: Create or get skill IDs
    const skillIds: string[] = []
    for (const skillName of input.skills) {
      // Check if skill exists
      const { data: existingSkill } = await supabase
        .from("skills")
        .select("id")
        .eq("name", skillName)
        .single()

      if (existingSkill) {
        skillIds.push(existingSkill.id)
      } else {
        // Create new skill
        const { data: newSkill, error: skillError } = await supabase
          .from("skills")
          .insert({ name: skillName })
          .select("id")
          .single()

        if (skillError || !newSkill) {
          console.error("Error creating skill:", skillError)
          // Continue with other skills even if one fails
        } else {
          skillIds.push(newSkill.id)
        }
      }
    }

    // Step 2: Insert challenge
    const challengeData = {
      title: input.title,
      description: input.description,
      industry: input.industry,
      difficulty: input.difficulty,
      participation_type: input.participationType,
      max_participants: input.maxParticipants ?? null,
      max_teams: input.maxTeams ?? null,
      max_team_size: input.maxTeamSize ?? null,
      start_date: input.startDate,
      end_date: input.endDate,
      registration_deadline: input.registrationDeadline ?? null,
      organization_id: input.organizationId,
      created_by: user.id,
      status: "draft" as ChallengeStatus,
    }

    const { data: challenge, error: challengeError } = await supabase
      .from("challenges")
      .insert(challengeData)
      .select("id")
      .single()

    if (challengeError || !challenge) {
      return {
        success: false,
        error: challengeError?.message || "Failed to create challenge",
      }
    }

    const challengeId = challenge.id

    // Step 3: Insert milestones
    const milestonesData = input.milestones.map((milestone, index) => ({
      challenge_id: challengeId,
      title: milestone.title,
      description: milestone.description || null,
      due_date: milestone.dueDate,
      sequence_order: index + 1,
      requires_github: milestone.requiresGithub,
      requires_url: milestone.requiresUrl,
      requires_text: milestone.requiresText,
    }))

    const { error: milestonesError } = await supabase
      .from("milestones")
      .insert(milestonesData)

    if (milestonesError) {
      // Rollback: delete the challenge if milestones fail
      await supabase.from("challenges").delete().eq("id", challengeId)
      return {
        success: false,
        error: milestonesError.message || "Failed to create milestones",
      }
    }

    // Step 4: Link skills to challenge
    if (skillIds.length > 0) {
      const challengeSkillsData = skillIds.map((skillId) => ({
        challenge_id: challengeId,
        skill_id: skillId,
      }))

      const { error: skillsError } = await supabase
        .from("challenge_skills")
        .insert(challengeSkillsData)

      if (skillsError) {
        // Rollback: delete challenge and milestones
        await supabase.from("milestones").delete().eq("challenge_id", challengeId)
        await supabase.from("challenges").delete().eq("id", challengeId)
        return {
          success: false,
          error: skillsError.message || "Failed to link skills",
        }
      }
    }

    // Revalidate relevant paths
    revalidatePath("/company/challenges")
    revalidatePath("/company/dashboard")

    return { success: true, challengeId }
  } catch (error) {
    console.error("Error creating challenge:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}












