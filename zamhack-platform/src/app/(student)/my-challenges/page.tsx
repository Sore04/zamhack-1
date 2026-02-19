import { createClient } from "@/utils/supabase/server"
import { ChallengeCard } from "@/components/challenge-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Database } from "@/types/supabase"

type ChallengeWithOrg = Database["public"]["Tables"]["challenges"]["Row"] & {
  organization: {
    name: string
  } | null
}

// Challenge statuses that mean the challenge is still ongoing
const ACTIVE_CHALLENGE_STATUSES = ["approved", "in_progress", "under_review"]

// Challenge statuses that mean the challenge is over
const PAST_CHALLENGE_STATUSES = ["closed", "completed", "cancelled"]

export default async function MyChallengesPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/login")
  }

  // Step 1: Fetch the student's participation records to get challenge IDs
  const { data: participations, error: participationError } = await supabase
    .from("challenge_participants")
    .select("id, status, challenge_id")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false })

  if (participationError) {
    console.error("Error fetching participations:", participationError)
  }

  const allParticipations = participations || []
  const challengeIds = allParticipations.map((p) => p.challenge_id).filter(Boolean)

  // Step 2: Fetch the actual challenges separately (bypasses RLS nested join issue)
  // This query runs as the student but directly on challenges table,
  // so the RLS policy for closed/completed challenges must allow it.
  let challenges: ChallengeWithOrg[] = []

  if (challengeIds.length > 0) {
    const { data: challengeData, error: challengeError } = await supabase
      .from("challenges")
      .select("*, organization:organizations(name)")
      .in("id", challengeIds as string[])

    if (challengeError) {
      console.error("Error fetching challenges:", challengeError)
    } else {
      challenges = (challengeData as unknown as ChallengeWithOrg[]) || []
    }
  }

  // Step 3: Build a map for quick lookup
  const challengeMap = new Map(challenges.map((c) => [c.id, c]))

  // Step 4: Split into Active vs Past based on the CHALLENGE's status,
  // not the participant's status row
  const activeChallenges: ChallengeWithOrg[] = []
  const pastChallenges: ChallengeWithOrg[] = []

  for (const participation of allParticipations) {
    const challenge = challengeMap.get(participation.challenge_id as string)
    if (!challenge) continue // RLS blocked it or it was deleted

    if (PAST_CHALLENGE_STATUSES.includes(challenge.status as string)) {
      pastChallenges.push(challenge)
    } else {
      activeChallenges.push(challenge)
    }
  }

  const hasAnyChallenges = activeChallenges.length > 0 || pastChallenges.length > 0

  return (
    <div className="space-y-6 p-6">
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
            <TabsTrigger value="past">
              Past ({pastChallenges.length})
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
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {pastChallenges.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card p-12 text-center text-muted-foreground">
                <p className="text-lg font-medium">No past challenges</p>
                <p className="text-sm mt-2">
                  Your completed challenges will appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastChallenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}