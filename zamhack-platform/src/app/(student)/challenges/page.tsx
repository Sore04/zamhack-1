import { createClient } from "@/utils/supabase/server"
import { ChallengeCard } from "@/components/challenge-card"
import { ChallengeFilters } from "@/components/challenge-filters"
import { Database } from "@/types/supabase"
import { redirect } from "next/navigation"

type Challenge = Database["public"]["Tables"]["challenges"]["Row"]

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
}): Promise<Challenge[]> {
  const supabase = await createClient()

  // Authenticate
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/login")
  }

  // Build query
  let query = supabase
    .from("challenges")
    .select("*")

  // 1. Search Filter
  if (searchParams.q) {
    const term = searchParams.q.trim()
    if (term) {
      // Use 'ilike' for case-insensitive search
      query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`)
    }
  }

  // 2. Difficulty Filter
  if (searchParams.difficulty) {
    // Cast to 'any' to bypass strict Enum checking for URL params
    query = query.eq("difficulty", searchParams.difficulty as any)
  }

  // 3. Status Filter (Default to active if not specified)
  if (searchParams.status) {
    query = query.eq("status", searchParams.status as any)
  } else {
    // By default, show approved (Open) and in_progress challenges
    query = query.in("status", ["approved", "in_progress"])
  }

  // Order results
  query = query.order("created_at", { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error("Error fetching challenges:", error)
    return []
  }

  return (data as Challenge[]) || []
}

export default async function ChallengesPage({ searchParams }: ChallengesPageProps) {
  // Await params for Next.js 15
  const params = await searchParams
  const challenges = await getChallenges(params)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Browse Challenges</h1>
        <p className="text-muted-foreground">
          Discover and join challenges that match your skills and interests.
        </p>
      </div>

      {/* Filters */}
      <ChallengeFilters />

      {/* Grid */}
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