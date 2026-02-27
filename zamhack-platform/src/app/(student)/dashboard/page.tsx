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

  // 2. Difficulty — cast to text for safe comparison against the enum
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
  // "solo"  → challenges that allow solo play (type = 'solo' OR 'both')
  // "team"  → challenges that allow team play (type = 'team' OR 'both')
  if (searchParams.participation_type === "solo") {
    query = query.or("participation_type.eq.solo,participation_type.eq.both")
  } else if (searchParams.participation_type === "team") {
    query = query.or("participation_type.eq.team,participation_type.eq.both")
  }

  // 5. Entry Type
  // "free" → entry_fee_amount IS NULL or 0
  // "paid" → entry_fee_amount > 0 (and not null)
  if (searchParams.entry_type === "free") {
    query = query.or("entry_fee_amount.is.null,entry_fee_amount.eq.0")
  } else if (searchParams.entry_type === "paid") {
    query = query.gt("entry_fee_amount", 0)
  }

  // 6. Industry / Category
  if (searchParams.category && searchParams.category !== "all") {
    query = query.eq("industry", searchParams.category)
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
  const params = await searchParams
  const challenges = await getChallenges(params)

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
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  )
}