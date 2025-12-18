import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Database } from "@/types/supabase"

type Challenge = Database["public"]["Tables"]["challenges"]["Row"]

interface ChallengeCardProps {
  challenge: Challenge
  progress?: number
  buttonText?: string
}

const getDifficultyColor = (difficulty: string | null) => {
  switch (difficulty) {
    case "beginner":
      return "success"
    case "intermediate":
      return "warning"
    case "advanced":
      return "destructive"
    default:
      return "secondary"
  }
}

const getStatusColor = (status: string | null) => {
  switch (status) {
    case "approved":
      return "success"
    case "in_progress":
      return "default"
    case "under_review":
      return "warning"
    default:
      return "secondary"
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "No date set"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export const ChallengeCard = ({ challenge, progress, buttonText = "View Details" }: ChallengeCardProps) => {
  const linkHref = progress !== undefined ? `/my-challenges/${challenge.id}` : `/challenges/${challenge.id}`

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{challenge.title}</CardTitle>
          <div className="flex gap-2">
            {challenge.difficulty && (
              <Badge variant={getDifficultyColor(challenge.difficulty) as any}>
                {challenge.difficulty}
              </Badge>
            )}
            {challenge.status && (
              <Badge variant={getStatusColor(challenge.status) as any}>
                {challenge.status.replace(/_/g, " ")}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {challenge.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {challenge.description}
            </p>
          )}
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">End Date:</span>{" "}
            {formatDate(challenge.end_date)}
          </div>
          {progress !== undefined && (
            <div className="space-y-1 pt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={linkHref}>{buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

