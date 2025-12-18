"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { Database } from "@/types/supabase"

type SubmissionInsert = Database["public"]["Tables"]["submissions"]["Insert"]

export async function submitMilestone(formData: FormData) {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to submit a milestone" }
  }

  // Extract form data
  const milestoneId = formData.get("milestone_id") as string
  const participantId = formData.get("participant_id") as string
  const githubLink = formData.get("github_link") as string | null
  const demoUrl = formData.get("demo_url") as string | null
  const writtenResponse = formData.get("written_response") as string | null

  // Validate required fields
  if (!milestoneId || !participantId) {
    return { error: "Missing required fields: milestone_id and participant_id are required" }
  }

  // Verify participant belongs to the current user
  const { data: participant, error: participantError } = await supabase
    .from("challenge_participants")
    .select("id, user_id")
    .eq("id", participantId)
    .single()

  if (participantError || !participant) {
    return { error: "Participant record not found" }
  }

  if (participant.user_id !== user.id) {
    return { error: "You are not authorized to submit for this participant" }
  }

  // Check if submission already exists
  const { data: existingSubmission } = await supabase
    .from("submissions")
    .select("id")
    .eq("milestone_id", milestoneId)
    .eq("participant_id", participantId)
    .maybeSingle()

  const submissionData: SubmissionInsert = {
    milestone_id: milestoneId,
    participant_id: participantId,
    github_link: githubLink || null,
    demo_url: demoUrl || null,
    written_response: writtenResponse || null,
    submitted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  let error: { error: string } | null = null

  if (existingSubmission) {
    // Update existing submission
    const { error: updateError } = await supabase
      .from("submissions")
      .update(submissionData)
      .eq("id", existingSubmission.id)

    if (updateError) {
      error = { error: updateError.message || "Failed to update submission" }
    }
  } else {
    // Insert new submission
    const { error: insertError } = await supabase
      .from("submissions")
      .insert(submissionData)

    if (insertError) {
      error = { error: insertError.message || "Failed to create submission" }
    }
  }

  if (error) {
    return error
  }

  // Revalidate the challenge page to update UI immediately
  // We need to get the challenge_id from the milestone to revalidate the correct path
  const { data: milestone } = await supabase
    .from("milestones")
    .select("challenge_id")
    .eq("id", milestoneId)
    .single()

  if (milestone?.challenge_id) {
    revalidatePath(`/my-challenges/${milestone.challenge_id}`)
    revalidatePath(`/challenges/${milestone.challenge_id}`)
  }

  return { success: true }
}












