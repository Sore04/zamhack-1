import { createClient } from "@/utils/supabase/server"
import { ChallengeCard } from "@/components/challenge-card"
import { ChallengeFilters } from "@/components/challenge-filters"
import { redirect } from "next/navigation"
import { Database } from "@/types/supabase"

// Define the exact return type we need
type ChallengeWithOrg = Database["public"]["Tables"]["challenges"]["Row"] & {
  organization: { name: string } | null
}

interface ChallengesPageProps {
  searchParams: Promise<{
    q?: string
    difficulty?: string
    status?: string
  }>
}

async function getChallenges(searchParams: {
  q?: string
  difficulty?: string
  status?: string
}): Promise<ChallengeWithOrg[]> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/login")
  }

  // UPDATED QUERY: Select organization name relation
  let query = supabase
    .from("challenges")
    .select("*, organization:organizations(name)")

  // 1. Search Filter
  if (searchParams.q) {
    const term = searchParams.q.trim()
    if (term) {
      query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`)
    }
  }

  // 2. Difficulty Filter
  if (searchParams.difficulty) {
    query = query.eq("difficulty", searchParams.difficulty as any)
  }

  // 3. Status Filter
  if (searchParams.status) {
    query = query.eq("status", searchParams.status as any)
  } else {
    // Show open, in_progress, AND closed challenges (so students can see results)
    query = query.in("status", ["approved", "in_progress", "closed", "completed"])
  }

  query = query.order("created_at", { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error("Error fetching challenges:", error)
    return []
  }

  // Cast safely because we know the query shape matches
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