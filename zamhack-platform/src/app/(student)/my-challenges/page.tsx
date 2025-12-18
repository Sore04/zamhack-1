import { createClient } from "@/utils/supabase/server"
import { ChallengeCard } from "@/components/challenge-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database } from "@/types/supabase"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type Challenge = Database["public"]["Tables"]["challenges"]["Row"]
type ChallengeParticipant = Database["public"]["Tables"]["challenge_participants"]["Row"]
type Organization = Database["public"]["Tables"]["organizations"]["Row"]

interface ChallengeWithProgress extends Challenge {
  organization?: Organization | null
  progress: number
  participantId: string
}

async function getMyChallenges(): Promise<{
  activeChallenges: ChallengeWithProgress[]
  completedChallenges: ChallengeWithProgress[]
}> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  // Fetch user's challenge participants with challenge details
  const { data: participants, error: participantsError } = await supabase
    .from("challenge_participants")
    .select(
      `
      id,
      challenge_id,
      status,
      challenges (
        *,
        organization:organizations (*)
      )
    `
    )
    .eq("user_id", user.id)
    .not("challenge_id", "is", null)

  if (participantsError) {
    console.error("Error fetching participants:", participantsError)
    return { activeChallenges: [], completedChallenges: [] }
  }

  if (!participants || participants.length === 0) {
    return { activeChallenges: [], completedChallenges: [] }
  }

  // Process each participant to calculate progress
  const challengesWithProgress: ChallengeWithProgress[] = []

  for (const participant of participants) {
    // Handle nested select - Supabase returns as object or array
    const challengeData = participant.challenges as unknown as
      | (Challenge & { organization?: Organization | null })
      | (Challenge & { organization?: Organization | null })[]
      | null

    if (!challengeData) continue

    // If it's an array, take the first item (shouldn't happen but handle it)
    const challenge = Array.isArray(challengeData) ? challengeData[0] : challengeData

    if (!challenge) continue

    // Fetch milestones for this challenge
    const { data: milestones, error: milestonesError } = await supabase
      .from("milestones")
      .select("id")
      .eq("challenge_id", challenge.id)

    if (milestonesError) {
      console.error("Error fetching milestones:", milestonesError)
      continue
    }

    const milestoneCount = milestones?.length || 0

    // Fetch submissions for this participant
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("id")
      .eq("participant_id", participant.id)

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError)
      continue
    }

    const submissionCount = submissions?.length || 0

    // Calculate progress percentage
    const progress =
      milestoneCount > 0 ? (submissionCount / milestoneCount) * 100 : 0

    challengesWithProgress.push({
      ...challenge,
      organization: challenge.organization || null,
      progress: Math.min(100, Math.max(0, progress)),
      participantId: participant.id,
    })
  }

  // Separate into active and completed
  const activeChallenges = challengesWithProgress.filter(
    (challenge) =>
      challenge.status === "approved" ||
      challenge.status === "in_progress" ||
      challenge.status === "under_review"
  )

  const completedChallenges = challengesWithProgress.filter(
    (challenge) => challenge.status === "completed"
  )

  // Sort active challenges by end_date (ascending - closest deadline first)
  activeChallenges.sort((a, b) => {
    if (!a.end_date) return 1
    if (!b.end_date) return -1
    return new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
  })

  // Sort completed challenges by end_date (descending - most recent first)
  completedChallenges.sort((a, b) => {
    if (!a.end_date) return 1
    if (!b.end_date) return -1
    return new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
  })

  return { activeChallenges, completedChallenges }
}

export default async function MyChallengesPage() {
  const { activeChallenges, completedChallenges } = await getMyChallenges()

  const hasAnyChallenges = activeChallenges.length > 0 || completedChallenges.length > 0

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Challenges</h1>
        <p className="text-muted-foreground">
          Track your progress and manage your active challenges.
        </p>
      </div>

      {!hasAnyChallenges ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card p-12 text-center">
          <p className="text-lg font-medium text-foreground">
            You haven't joined any challenges yet
          </p>
          <p className="text-sm text-muted-foreground mt-2 mb-4">
            Browse available challenges and start your journey.
          </p>
          <Button asChild>
            <Link href="/challenges">Browse Challenges</Link>
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeChallenges.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedChallenges.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeChallenges.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card p-12 text-center text-muted-foreground">
                <p className="text-lg font-medium">No active challenges</p>
                <p className="text-sm mt-2">
                  You don't have any active challenges at the moment.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    progress={challenge.progress}
                    buttonText="Continue"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedChallenges.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card p-12 text-center text-muted-foreground">
                <p className="text-lg font-medium">No completed challenges</p>
                <p className="text-sm mt-2">
                  Your completed challenges will appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {completedChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    progress={challenge.progress}
                    buttonText="View Results"
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

