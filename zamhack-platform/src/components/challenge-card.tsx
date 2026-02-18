import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users, Trophy, Building2, Timer } from "lucide-react"
import Link from "next/link"
import { Database } from "@/types/supabase"

// 1. Define the joined type explicitly
type ChallengeWithOrg = Database["public"]["Tables"]["challenges"]["Row"] & {
  organization: {
    name: string
  } | null
}

interface ChallengeCardProps {
  challenge: ChallengeWithOrg
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  // Helper to format currency
  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (!amount) return "Free"
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: currency || 'PHP'
    }).format(amount)
  }

  const isClosed = challenge.status === 'closed' || challenge.status === 'completed'

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow border-t-4 border-t-primary/20">
      <CardHeader className="pb-3 space-y-2">
        <div className="flex justify-between items-start">
          <Badge variant={isClosed ? "secondary" : "default"} className="capitalize">
            {challenge.status?.replace("_", " ")}
          </Badge>
          <Badge variant="outline">{challenge.difficulty}</Badge>
        </div>
        <div>
          <h3 className="text-xl font-bold line-clamp-1">{challenge.title}</h3>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <Building2 className="mr-1 h-3 w-3" />
            <span className="line-clamp-1">
              {/* Safe access to organization name */}
              {challenge.organization?.name || "Unknown Org"}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {challenge.description}
        </p>
        
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Users className="mr-1 h-3 w-3" />
            <span>{challenge.max_participants || "Unltd"} Slots</span>
          </div>
          <div className="flex items-center">
            <Trophy className="mr-1 h-3 w-3" />
            <span>{formatCurrency(challenge.entry_fee_amount, challenge.currency)}</span>
          </div>
          <div className="flex items-center col-span-2">
            <Timer className="mr-1 h-3 w-3" />
            <span>Due: {new Date(challenge.end_date!).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild className="w-full">
          <Link href={`/challenges/${challenge.id}`}>
            {isClosed ? "View Results" : "View Details"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}