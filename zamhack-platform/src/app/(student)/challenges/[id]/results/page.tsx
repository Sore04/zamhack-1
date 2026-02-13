import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Award, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Define the exact shape of our joined data to satisfy TypeScript
interface WinnerData {
  rank: number
  prize: string | null
  profile: {
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
    university: string | null
  } | null
}

export default async function ChallengeResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch Challenge Status
  const { data: challenge } = await supabase
    .from("challenges")
    .select("title, status, organization:organizations(name)")
    .eq("id", id)
    .single()

  if (!challenge) redirect("/challenges")

  // Only show results if closed
  if (challenge.status !== "closed" && challenge.status !== "completed") {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="bg-muted p-4 rounded-full">
          <Trophy className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Results Pending</h1>
        <p className="text-muted-foreground max-w-md">
          The winners for <span className="font-semibold">{challenge.title}</span> have not been announced yet.
        </p>
        <Button asChild variant="outline">
          <Link href={`/challenges/${id}`}>Back to Challenge</Link>
        </Button>
      </div>
    )
  }

  // 2. Fetch Winners
  // Removed "as any" from table name
  const { data } = await supabase
    .from("winners") 
    .select(`
      rank, 
      prize,
      profile:profiles (first_name, last_name, avatar_url, university)
    `)
    .eq("challenge_id", id)
    .order("rank", { ascending: true })

  // Safely cast the returned data to our defined interface
  const winners = data as unknown as WinnerData[] | null

  const getRankConfig = (rank: number) => {
    switch (rank) {
      case 1: return { color: "text-yellow-600", bg: "bg-yellow-100/50 border-yellow-200", icon: Trophy, height: "h-96", scale: "scale-105 z-10" }
      case 2: return { color: "text-slate-600", bg: "bg-slate-100/50 border-slate-200", icon: Medal, height: "h-80", scale: "scale-100" }
      case 3: return { color: "text-amber-700", bg: "bg-orange-100/50 border-orange-200", icon: Award, height: "h-72", scale: "scale-100" }
      default: return { color: "text-blue-600", bg: "bg-card", icon: Award, height: "h-auto", scale: "" }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20">
      <div className="container max-w-5xl py-12 px-4">
        <Button variant="ghost" asChild className="mb-8">
          <Link href={`/challenges/${id}`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Challenge</Link>
        </Button>

        <div className="text-center mb-16 space-y-2">
          <Badge variant="outline" className="mb-2 border-primary/20 text-primary bg-primary/5">Official Results</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Winners Announced</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Celebrating the top innovators for <span className="text-foreground font-semibold">{challenge.title}</span>
          </p>
        </div>

        {/* Podium Layout: 2nd, 1st, 3rd */}
        <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-6">
          {[2, 1, 3].map((rank) => {
            // Find the winner. Type is strictly WinnerData now.
            const winner = winners?.find((w) => w.rank === rank)
            if (!winner) return null 

            const config = getRankConfig(rank)
            const Icon = config.icon
            const profile = winner.profile

            return (
              <Card key={rank} className={`w-full md:w-1/3 border-2 flex flex-col items-center justify-between shadow-lg transition-transform ${config.bg} ${config.height} ${config.scale}`}>
                <div className="pt-8 flex flex-col items-center w-full px-4">
                  <div className={`p-3 rounded-full bg-white shadow-sm mb-4 ${config.color}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  
                  <Avatar className="h-20 w-20 border-4 border-white shadow-md mb-4">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-lg font-bold">
                      {profile?.first_name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="font-bold text-lg text-center leading-tight">
                    {profile?.first_name} {profile?.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    {profile?.university}
                  </p>
                </div>
                
                <div className="pb-8 flex flex-col items-center">
                  {winner.prize && (
                    <Badge className="bg-black/90 text-white hover:bg-black/80 mb-2">
                      {winner.prize}
                    </Badge>
                  )}
                  <div className={`text-6xl font-black opacity-10 select-none ${config.color}`}>
                    {rank}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}