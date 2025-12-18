import { createClient } from "@/utils/supabase/server"
import { Database } from "@/types/supabase"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { SubmissionForm } from "@/components/submission-form"
import { JoinChallengeDialog } from "@/components/join-challenge-dialog"
import { AlertCircle, CheckCircle2, Lock, MessageSquare } from "lucide-react"
import Link from "next/link"

type Challenge = Database["public"]["Tables"]["challenges"]["Row"]
type Organization = Database["public"]["Tables"]["organizations"]["Row"]
type Milestone = Database["public"]["Tables"]["milestones"]["Row"]
type Submission = Database["public"]["Tables"]["submissions"]["Row"]
type Evaluation = Database["public"]["Tables"]["evaluations"]["Row"]
type ChallengeParticipant = Database["public"]["Tables"]["challenge_participants"]["Row"]

interface ChallengeProgressData {
  challenge: Challenge & {
    organization: Organization | null
  }
  milestones: Milestone[]
  participant: ChallengeParticipant | null
  submissions: Submission[]
  evaluations: Evaluation[]
  userTeam: { id: string; name: string; leader_id: string } | null
  userId: string
}

type MilestoneStatus = "completed" | "in_progress" | "locked"

interface MilestoneWithStatus extends Milestone {
  status: MilestoneStatus
  submission: Submission | null
  evaluation: Evaluation | null
}

async function getChallengeProgress(
  challengeId: string
): Promise<ChallengeProgressData | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch challenge with organization
  const { data: challenge, error: challengeError } = await supabase
    .from("challenges")
    .select(
      `
      *,
      organization:organizations(*)
    `
    )
    .eq("id", challengeId)
    .single()

  if (challengeError || !challenge) {
    return null
  }

  // Fetch milestones ordered by sequence
  const { data: milestones, error: milestonesError } = await supabase
    .from("milestones")
    .select("*")
    .eq("challenge_id", challengeId)
    .order("sequence_order", { ascending: true })

  if (milestonesError) {
    console.error("Error fetching milestones:", milestonesError)
  }

  // Fetch user's team
  let userTeam: { id: string; name: string; leader_id: string } | null = null
  const { data: teamMember } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("profile_id", user.id)
    .maybeSingle()

  if (teamMember?.team_id) {
    const { data: team } = await supabase
      .from("teams")
      .select("id, name, leader_id")
      .eq("id", teamMember.team_id)
      .single()

    if (team) {
      userTeam = {
        id: team.id,
        name: team.name,
        leader_id: team.leader_id || "",
      }
    }
  }

  // Fetch participant record for current user (check both solo and team participation)
  const { data: soloParticipant } = await supabase
    .from("challenge_participants")
    .select("*")
    .eq("challenge_id", challengeId)
    .eq("user_id", user.id)
    .maybeSingle()

  // Also check if user's team is participating
  let teamParticipant: ChallengeParticipant | null = null
  if (userTeam) {
    const { data: teamPart } = await supabase
      .from("challenge_participants")
      .select("*")
      .eq("challenge_id", challengeId)
      .eq("team_id", userTeam.id)
      .maybeSingle()
    teamParticipant = teamPart || null
  }

  const participant = soloParticipant || teamParticipant || null

  // Fetch submissions for this participant (if exists)
  let submissions: Submission[] = []
  let evaluations: Evaluation[] = []

  if (participant) {
    const { data: subs, error: submissionsError } = await supabase
      .from("submissions")
      .select("*")
      .eq("participant_id", participant.id)

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError)
    } else {
      submissions = subs || []
    }

    // Fetch evaluations for these submissions
    const submissionIds = submissions.map((s) => s.id)
    if (submissionIds.length > 0) {
      const { data: evals, error: evaluationsError } = await supabase
        .from("evaluations")
        .select("*")
        .in("submission_id", submissionIds)
        .eq("is_draft", false)

      if (evaluationsError) {
        console.error("Error fetching evaluations:", evaluationsError)
      } else {
        evaluations = evals || []
      }
    }
  }

  return {
    challenge: challenge as any,
    milestones: milestones || [],
    participant,
    submissions,
    evaluations,
    userTeam,
    userId: user.id,
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "No date set"
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

interface ChallengeProgressPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ChallengeProgressPage({
  params,
}: ChallengeProgressPageProps) {
  const { id } = await params
  const data = await getChallengeProgress(id)

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="rounded-full bg-muted p-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Challenge not found</h2>
        <p className="text-muted-foreground max-w-[500px]">
          The challenge you are looking for doesn't exist.
        </p>
        <Button asChild variant="outline">
          <Link href="/challenges">Back to Challenges</Link>
        </Button>
      </div>
    )
  }

  const { challenge, milestones, participant, submissions, evaluations, userTeam, userId } = data

  // If user is not a participant, show challenge details with join dialog
  if (!participant) {
    return (
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{challenge.title}</h1>
              {challenge.status && (
                <Badge variant={challenge.status === "approved" ? "default" : "secondary"}>
                  {challenge.status.replace(/_/g, " ")}
                </Badge>
              )}
            </div>
            {challenge.organization && (
              <p className="text-muted-foreground">by {challenge.organization.name}</p>
            )}
          </div>
        </div>

        {/* Challenge Details */}
        <Card>
          <CardHeader>
            <CardTitle>Challenge Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {challenge.description && (
              <div>
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {challenge.description}
                </p>
              </div>
            )}
            {challenge.problem_brief && (
              <div>
                <h3 className="text-sm font-medium mb-2">Problem Brief</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {challenge.problem_brief}
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {challenge.difficulty && (
                <Badge variant="outline">Difficulty: {challenge.difficulty}</Badge>
              )}
              {challenge.industry && <Badge variant="outline">Industry: {challenge.industry}</Badge>}
            </div>
          </CardContent>
        </Card>

        {/* Join Section */}
        <Card>
          <CardHeader>
            <CardTitle>Join Challenge</CardTitle>
          </CardHeader>
          <CardContent>
            <JoinChallengeDialog
              challengeId={id}
              userTeam={userTeam}
              userId={userId}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Create a map of milestone_id -> submission
  const submissionMap = new Map<string, Submission>()
  submissions.forEach((sub) => {
    if (sub.milestone_id) {
      submissionMap.set(sub.milestone_id, sub)
    }
  })

  // Create a map of submission_id -> evaluation
  const evaluationMap = new Map<string, Evaluation>()
  // FIX: Renamed 'eval' to 'evaluationItem' to fix the Reserved Keyword Error
  evaluations.forEach((evaluationItem) => {
    if (evaluationItem.submission_id) {
      evaluationMap.set(evaluationItem.submission_id, evaluationItem)
    }
  })

  // Determine milestone statuses
  const milestonesWithStatus: MilestoneWithStatus[] = []
  let foundInProgress = false

  for (const milestone of milestones) {
    const submission = submissionMap.get(milestone.id) || null
    const evaluation = submission
      ? evaluationMap.get(submission.id) || null
      : null

    let status: MilestoneStatus = "locked"

    if (submission) {
      // Has submission - consider it completed (even if no evaluation yet)
      status = "completed"
    } else if (!foundInProgress) {
      // First milestone without submission is "in progress"
      status = "in_progress"
      foundInProgress = true
    }
    // Otherwise remains "locked"

    milestonesWithStatus.push({
      ...milestone,
      status,
      submission,
      evaluation,
    })
  }

  // Calculate progress percentage
  const completedCount = milestonesWithStatus.filter(
    (m) => m.status === "completed"
  ).length
  const progressPercentage =
    milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0

  // Find the current milestone (in progress)
  const currentMilestone = milestonesWithStatus.find(
    (m) => m.status === "in_progress"
  )

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {challenge.title}
            </h1>
            <Badge variant="default">In Progress</Badge>
          </div>
          {challenge.organization && (
            <p className="text-muted-foreground">
              by {challenge.organization.name}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            <MessageSquare className="mr-2 h-4 w-4" />
            Message Company
          </Button>
          <Button variant="outline" disabled>
            Withdraw
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">
                {completedCount} of {milestones.length} milestones completed
              </span>
            </div>
            <Progress value={progressPercentage} />
            <p className="text-xs text-muted-foreground text-right">
              {Math.round(progressPercentage)}% complete
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Milestones Feed */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Milestones</h2>

        {milestonesWithStatus.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                No milestones defined for this challenge.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {milestonesWithStatus.map((milestone, index) => (
              <Card
                key={milestone.id}
                className={
                  milestone.status === "locked"
                    ? "opacity-60"
                    : milestone.status === "in_progress"
                    ? "border-primary"
                    : ""
                }
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {index + 1}
                        </span>
                        <CardTitle>{milestone.title}</CardTitle>
                        {milestone.status === "completed" && (
                          <Badge variant="success" className="ml-2">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Completed
                          </Badge>
                        )}
                        {milestone.status === "in_progress" && (
                          <Badge variant="default" className="ml-2">
                            In Progress
                          </Badge>
                        )}
                        {milestone.status === "locked" && (
                          <Badge variant="secondary" className="ml-2">
                            <Lock className="mr-1 h-3 w-3" />
                            Locked
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground pl-10">
                        Due: {formatDate(milestone.due_date)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {milestone.description && (
                    <p className="text-sm">{milestone.description}</p>
                  )}

                  <div className="flex gap-2">
                    {milestone.requires_github && (
                      <Badge variant="outline" className="text-[10px]">
                        GitHub
                      </Badge>
                    )}
                    {milestone.requires_url && (
                      <Badge variant="outline" className="text-[10px]">
                        Demo URL
                      </Badge>
                    )}
                    {milestone.requires_text && (
                      <Badge variant="outline" className="text-[10px]">
                        Report
                      </Badge>
                    )}
                  </div>

                  {/* Show submission form for in_progress milestone */}
                  {milestone.status === "in_progress" && currentMilestone?.id === milestone.id && (
                    <SubmissionForm
                      milestoneId={milestone.id}
                      participantId={participant.id} // This should now be green
                      requiresGithub={milestone.requires_github}
                      requiresUrl={milestone.requires_url}
                      requiresText={milestone.requires_text}
                    />
                  )}

                  {/* Show feedback for completed milestones */}
                  {milestone.status === "completed" &&
                    milestone.submission &&
                    milestone.evaluation && (
                      <Card className="bg-muted/50">
                        <CardHeader>
                          <CardTitle className="text-base">Feedback</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {milestone.evaluation.score !== null && (
                            <div>
                              <span className="text-sm font-medium">Score: </span>
                              <Badge variant="default">
                                {milestone.evaluation.score}/100
                              </Badge>
                            </div>
                          )}
                          {milestone.evaluation.feedback && (
                            <div>
                              <p className="text-sm font-medium mb-1">Feedback:</p>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {milestone.evaluation.feedback}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                  {/* Show submission info if submitted but no feedback yet */}
                  {milestone.status === "completed" &&
                    milestone.submission &&
                    !milestone.evaluation && (
                      <Card className="bg-muted/50">
                        <CardContent className="pt-6">
                          <p className="text-sm text-muted-foreground">
                            Submission received. Waiting for feedback...
                          </p>
                        </CardContent>
                      </Card>
                    )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}