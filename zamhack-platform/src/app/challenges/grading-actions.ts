"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { Database } from "@/types/supabase"

type EvaluationInsert = Database["public"]["Tables"]["evaluations"]["Insert"]
type EvaluationUpdate = Database["public"]["Tables"]["evaluations"]["Update"]

export async function submitEvaluation(
  submissionId: string,
  score: number,
  feedback: string,
  isDraft: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "Not authenticated" }
  }

  // Verify user is company admin or member
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, organization_id")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return { success: false, error: "User profile not found" }
  }

  if (profile.role !== "company_admin" && profile.role !== "company_member") {
    return { success: false, error: "Unauthorized: Only company members can evaluate submissions" }
  }

  // Fetch submission to get challenge info
  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select("id, milestone_id, participant_id")
    .eq("id", submissionId)
    .single()

  if (submissionError || !submission) {
    return { success: false, error: "Submission not found" }
  }

  // Get milestone to get challenge_id
  const { data: milestone, error: milestoneError } = await supabase
    .from("milestones")
    .select("challenge_id")
    .eq("id", submission.milestone_id)
    .single()

  if (milestoneError || !milestone || !milestone.challenge_id) {
    return { success: false, error: "Milestone not found" }
  }

  // Get challenge to verify organization ownership
  const { data: challenge, error: challengeError } = await supabase
    .from("challenges")
    .select("id, organization_id")
    .eq("id", milestone.challenge_id)
    .single()

  if (challengeError || !challenge) {
    return { success: false, error: "Challenge not found" }
  }

  // Verify user's organization owns this challenge
  if (challenge.organization_id !== profile.organization_id) {
    return { success: false, error: "Unauthorized: You can only evaluate submissions for your organization's challenges" }
  }

  // Check if evaluation already exists
  const { data: existingEvaluation } = await supabase
    .from("evaluations")
    .select("id")
    .eq("submission_id", submissionId)
    .maybeSingle()

  const evaluationData: EvaluationInsert | EvaluationUpdate = {
    submission_id: submissionId,
    reviewer_id: user.id,
    score: score,
    feedback: feedback,
    is_draft: isDraft,
    updated_at: new Date().toISOString(),
  }

  let error: { error: string } | null = null

  if (existingEvaluation) {
    // Update existing evaluation
    const { error: updateError } = await supabase
      .from("evaluations")
      .update(evaluationData)
      .eq("id", existingEvaluation.id)

    if (updateError) {
      error = { error: updateError.message || "Failed to update evaluation" }
    }
  } else {
    // Insert new evaluation
    const { error: insertError } = await supabase
      .from("evaluations")
      .insert(evaluationData)

    if (insertError) {
      error = { error: insertError.message || "Failed to create evaluation" }
    }
  }

  if (error) {
    return { success: false, error: error.error }
  }

  // Revalidate the challenge page
  revalidatePath(`/company/challenges/${milestone.challenge_id}`)

  return { success: true }
}




