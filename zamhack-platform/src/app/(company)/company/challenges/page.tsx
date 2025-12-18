import { createClient } from "@/utils/supabase/server"
import { Database } from "@/types/supabase"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

type Challenge = Database["public"]["Tables"]["challenges"]["Row"]

interface ChallengeWithStats extends Challenge {
  participantCount: number
  submissionCount: number
}

async function getChallengesList(): Promise<ChallengeWithStats[]> {
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
    .select("role, organization_id")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    redirect("/login")
  }

  if (profile.role !== "company_admin" && profile.role !== "company_member") {
    redirect("/dashboard")
  }

  if (!profile.organization_id) {
    throw new Error("User does not have an organization assigned")
  }

  // Fetch all challenges for this organization
  const { data: challenges, error: challengesError } = await supabase
    .from("challenges")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false })

  if (challengesError) {
    console.error("Error fetching challenges:", challengesError)
    return []
  }

  const challengesList = (challenges as Challenge[]) || []

  if (challengesList.length === 0) {
    return []
  }

  // Get challenge IDs
  const challengeIds = challengesList.map((c) => c.id)

  // Fetch participant counts for each challenge
  const { data: participants } = await supabase
    .from("challenge_participants")
    .select("challenge_id")
    .in("challenge_id", challengeIds)

  // Count participants per challenge
  const participantCountMap = new Map<string, number>()
  if (participants) {
    participants.forEach((p) => {
      if (p.challenge_id) {
        const current = participantCountMap.get(p.challenge_id) || 0
        participantCountMap.set(p.challenge_id, current + 1)
      }
    })
  }

  // Fetch submission counts
  // First get participant IDs for all challenges
  const { data: allParticipants } = await supabase
    .from("challenge_participants")
    .select("id, challenge_id")
    .in("challenge_id", challengeIds)

  const participantIds = allParticipants?.map((p) => p.id) || []
  const participantToChallengeMap = new Map<string, string>()
  allParticipants?.forEach((p) => {
    if (p.challenge_id && p.id) {
      participantToChallengeMap.set(p.id, p.challenge_id)
    }
  })

  // Count submissions per challenge
  const submissionCountMap = new Map<string, number>()
  if (participantIds.length > 0) {
    const { data: submissions } = await supabase
      .from("submissions")
      .select("participant_id")
      .in("participant_id", participantIds)

    if (submissions) {
      submissions.forEach((s) => {
        if (s.participant_id) {
          const challengeId = participantToChallengeMap.get(s.participant_id)
          if (challengeId) {
            const current = submissionCountMap.get(challengeId) || 0
            submissionCountMap.set(challengeId, current + 1)
          }
        }
      })
    }
  }

  // Combine challenges with stats
  const challengesWithStats: ChallengeWithStats[] = challengesList.map(
    (challenge) => ({
      ...challenge,
      participantCount: participantCountMap.get(challenge.id) || 0,
      submissionCount: submissionCountMap.get(challenge.id) || 0,
    })
  )

  return challengesWithStats
}

const getStatusBadgeVariant = (status: string | null) => {
  switch (status) {
    case "draft":
      return "outline" // Gray
    case "approved":
    case "in_progress":
      return "success" // Green
    case "completed":
      return "default" // Blue (using default as blue)
    case "pending_approval":
    case "under_review":
      return "warning" // Yellow
    case "cancelled":
      return "destructive" // Red
    default:
      return "outline"
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const formatDateRange = (startDate: string | null, endDate: string | null) => {
  const start = formatDate(startDate)
  const end = formatDate(endDate)
  if (start === "N/A" && end === "N/A") return "N/A"
  if (start === "N/A") return `Ends: ${end}`
  if (end === "N/A") return `Starts: ${start}`
  return `${start} - ${end}`
}

export default async function ChallengesListPage() {
  const challenges = await getChallengesList()

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Challenges</h1>
          <p className="text-muted-foreground">
            Manage your hackathons and assessments
          </p>
        </div>
        <Button asChild>
          <Link href="/company/challenges/create">Create Challenge</Link>
        </Button>
      </div>

      {/* Table / List */}
      {challenges.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              You haven't created any challenges yet.
            </p>
            <Button asChild>
              <Link href="/company/challenges/create">
                Create your first challenge
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border bg-card">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Title
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Timeline
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Participants
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {challenges.map((challenge) => (
                  <tr
                    key={challenge.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle font-medium">
                      <Link
                        href={`/company/challenges/${challenge.id}`}
                        className="hover:underline"
                      >
                        {challenge.title}
                      </Link>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge
                        variant={getStatusBadgeVariant(challenge.status) as any}
                      >
                        {challenge.status?.replace("_", " ") || "Unknown"}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {formatDateRange(challenge.start_date, challenge.end_date)}
                    </td>
                    <td className="p-4 align-middle">{challenge.participantCount}</td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/company/challenges/${challenge.id}`}>
                            Manage
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/company/challenges/${challenge.id}`}>
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}










