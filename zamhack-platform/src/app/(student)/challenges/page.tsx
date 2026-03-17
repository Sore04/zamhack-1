import { createClient } from "@/utils/supabase/server"
import { ChallengeCard } from "@/components/challenge-card"
import { ChallengeFilters } from "@/components/challenge-filters"
import { Database } from "@/types/supabase"
import { redirect } from "next/navigation"

type ChallengeWithOrg = Database["public"]["Tables"]["challenges"]["Row"] & {
  organization: { name: string } | null
}

interface ChallengesPageProps {
  searchParams: Promise<{
    q?: string
    difficulty?: string
    status?: string
    participation_type?: string
    entry_type?: string
    category?: string
    sort?: string
  }>
}

async function getChallenges(searchParams: {
  q?: string
  difficulty?: string
  status?: string
  participation_type?: string
  entry_type?: string
  category?: string
  sort?: string
}): Promise<ChallengeWithOrg[]> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect("/login")

  let query = supabase
    .from("challenges")
    .select("*, organization:organizations(name)")

  // 1. Search
  if (searchParams.q?.trim()) {
    const term = searchParams.q.trim()
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`)
  }

  // 2. Difficulty
  if (searchParams.difficulty && searchParams.difficulty !== "all") {
    query = query.filter("difficulty::text", "eq", searchParams.difficulty)
  }

  // 3. Status
  if (searchParams.status) {
    query = query.eq("status", searchParams.status as any)
  } else {
    query = query.in("status", ["approved", "in_progress", "closed", "completed"])
  }

  // 4. Participation Type
  if (searchParams.participation_type === "solo") {
    query = query.or("participation_type.eq.solo,participation_type.eq.both")
  } else if (searchParams.participation_type === "team") {
    query = query.or("participation_type.eq.team,participation_type.eq.both")
  }

  // 5. Entry Type
  if (searchParams.entry_type === "free") {
    query = query.or("entry_fee_amount.is.null,entry_fee_amount.eq.0")
  } else if (searchParams.entry_type === "paid") {
    query = query.gt("entry_fee_amount", 0)
  }

  // 6. Industry / Category
  if (searchParams.category) {
  const categories = searchParams.category
    .split(",")
    .map((c) => decodeURIComponent(c.trim()))
    .filter(Boolean)
  if (categories.length > 0) {
    query = query.in("industry", categories)
  }
  }

  // 7. Sort
  if (searchParams.sort === "closing_soon") {
    query = query.order("end_date", { ascending: true })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching challenges:", error.message, error.details)
    return []
  }

  return (data as unknown as ChallengeWithOrg[]) || []
}

export default async function ChallengesPage({ searchParams }: ChallengesPageProps) {
  const supabase = await createClient()
  const params = await searchParams
  const challenges = await getChallenges(params)

  // --- Build perpetualCompletedSet ---
  // Find which perpetual challenges the current user has fully submitted.
  // Used to show "View Results" on the card instead of "View Details".
  const perpetualCompletedSet = new Set<string>()

  const { data: { user } } = await supabase.auth.getUser()

  if (user && challenges.length > 0) {
    // 1. Get IDs of perpetual challenges in this result set (dedicated query)
    const challengeIds = challenges.map((c) => c.id)
    const { data: perpetualRows } = await supabase
      .from("challenges")
      .select("id")
      .in("id", challengeIds)
      .eq("is_perpetual", true)

    const perpetualIds = (perpetualRows ?? []).map((r) => r.id)

    if (perpetualIds.length > 0) {
      // 2. Get participations for these perpetual challenges
      const { data: participations } = await supabase
        .from("challenge_participants")
        .select("id, challenge_id")
        .eq("user_id", user.id)
        .in("challenge_id", perpetualIds)

      for (const participation of participations ?? []) {
        const challengeId = participation.challenge_id as string

        // 3. Compare milestone count vs submission count
        const { count: milestoneCount } = await supabase
          .from("milestones")
          .select("*", { count: "exact", head: true })
          .eq("challenge_id", challengeId)

        const { count: submissionCount } = await supabase
          .from("submissions")
          .select("*", { count: "exact", head: true })
          .eq("participant_id", participation.id)

        const total = milestoneCount ?? 0
        const submitted = submissionCount ?? 0

        if (total > 0 && submitted >= total) {
          perpetualCompletedSet.add(challengeId)
        }
      }
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Browse Challenges</h1>
        <p className="text-muted-foreground">
          Discover and join challenges that match your skills and interests.
        </p>
      </div>

      <ChallengeFilters />

      {challenges.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card p-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">No challenges found</p>
          <p className="text-sm">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              perpetualResultsHref={
                perpetualCompletedSet.has(challenge.id)
                  ? `/challenges/${challenge.id}`
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}