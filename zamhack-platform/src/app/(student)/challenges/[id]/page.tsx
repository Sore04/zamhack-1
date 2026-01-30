import { createClient } from "@/utils/supabase/server"
import { Database } from "@/types/supabase"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { SubmissionForm } from "@/components/submission-form"
import { JoinChallengeDialog } from "@/components/join-challenge-dialog"
import { AlertCircle, CheckCircle2, Lock, MessageSquare, CreditCard, Clock } from "lucide-react"
import Link from "next/link"

// --- Types ---
type Challenge = Database["public"]["Tables"]["challenges"]["Row"]
type Organization = Database["public"]["Tables"]["organizations"]["Row"]
// Remove manual extension since supabase.ts should now have points
type Milestone = Database["public"]["Tables"]["milestones"]["Row"]
type Submission = Database["public"]["Tables"]["submissions"]["Row"]
type Evaluation = Database["public"]["Tables"]["evaluations"]["Row"]
type ChallengeParticipant = Database["public"]["Tables"]["challenge_participants"]["Row"]

// Define a robust Team type that handles the nullable leader_id from DB
interface TeamData {
  id: string
  name: string
  leader_id: string | null
}

interface ChallengeProgressData {
  challenge: Challenge & {
    organization: Organization | null
  }
  milestones: Milestone[]
  participant: ChallengeParticipant | null
  submissions: Submission[]
  evaluations: Evaluation[]
  userTeam: TeamData | null
  userId: string
}

type MilestoneStatus = "completed" | "in_progress" | "locked"

interface MilestoneWithStatus extends Milestone {
  status: MilestoneStatus
  submission: Submission | null
  evaluation: Evaluation | null
}

// --- Data Fetching ---
async function getChallengeData(id: string): Promise<ChallengeProgressData | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // 1. Fetch Challenge Details
  const { data: challenge, error: challengeError } = await supabase
    .from("challenges")
    .select(`
      *,
      organization:organizations(*)
    `)
    .eq("id", id)
    .single()

  if (challengeError || !challenge) {
    return null
  }

  // 2. Fetch Milestones
  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("challenge_id", id)
    .order("sequence_order", { ascending: true })

  // 3. Fetch User's Participation
  const { data: participant } = await supabase
    .from("challenge_participants")
    .select("*")
    .eq("challenge_id", id)
    .eq("user_id", user.id)
    .maybeSingle()

  // 4. Fetch Submissions (if participating)
  let submissions: Submission[] = []
  let evaluations: Evaluation[] = []

  if (participant) {
    const { data: subs } = await supabase
      .from("submissions")
      .select("*")
      .eq("participant_id", participant.id)
      .order("submitted_at", { ascending: false })

    if (subs) {
      submissions = subs
      const submissionIds = subs.map((s) => s.id)
      
      if (submissionIds.length > 0) {
        const { data: evals } = await supabase
          .from("evaluations")
          .select("*")
          .in("submission_id", submissionIds)
        
        if (evals) evaluations = evals
      }
    }
  }

  // 5. Fetch User's Team (if any)
  const { data: teamMember } = await supabase
    .from("team_members")
    .select(`
        team:teams (
            id,
            name,
            leader_id
        )
    `)
    .eq("user_id", user.id)
    .maybeSingle()

  // Type casting for joined data
  const rawTeam = teamMember?.team as unknown as TeamData | null
  const userTeam = rawTeam

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

// --- Main Page Component ---
export default async function ChallengePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getChallengeData(id)

  if (!data) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold">Challenge not found</h1>
        <Button asChild className="mt-4">
          <Link href="/challenges">Back to Challenges</Link>
        </Button>
      </div>
    )
  }

  const {
    challenge,
    milestones,
    participant,
    submissions,
    evaluations,
    userTeam,
    userId,
  } = data

  // --- Logic Checks ---
  const hasJoined = !!participant
  
  // Safe Date Handling
  const deadline = challenge.registration_deadline
  const isRegistrationClosed = deadline
    ? new Date(deadline) < new Date()
    : false
    
  const startDate = challenge.start_date
  const endDate = challenge.end_date

  // Payment Variables
  const hasEntryFee = (challenge.entry_fee_amount || 0) > 0
  const feeAmount = challenge.entry_fee_amount
  const currency = challenge.currency || "PHP"

  // Process Milestones Status
  let previousMilestoneCompleted = true // First milestone is always unlocked (if joined)

  const milestonesWithStatus: MilestoneWithStatus[] = milestones.map(
    (milestone) => {
      // Find submission for this milestone
      const submission =
        submissions.find((s) => s.milestone_id === milestone.id) || null
      
      // Find evaluation for that submission
      const evaluation = submission
        ? evaluations.find((e) => e.submission_id === submission.id) || null
        : null

      // Determine Status
      let status: MilestoneStatus = "locked"

      if (hasJoined) {
        if (submission) {
          status = "completed" // Submitted (waiting review or reviewed)
        } else if (previousMilestoneCompleted) {
          status = "in_progress" // Current active milestone
        }
      }

      // Update previous completion for next iteration
      previousMilestoneCompleted = !!submission

      return {
        ...milestone,
        status,
        submission,
        evaluation,
      }
    }
  )

  // Calculate Progress
  const completedCount = submissions.length
  const totalMilestones = milestones.length
  const progressPercentage =
    totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0

  return (
    <div className="container py-8 space-y-8">
      {/* --- HEADER SECTION --- */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div>
            <Badge variant="outline" className="mb-2">
              {challenge.category || challenge.industry || "General"}
            </Badge>
            <h1 className="text-3xl font-bold">{challenge.title}</h1>
            <p className="text-lg text-muted-foreground mt-2">
              By {challenge.organization?.name}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              <span>
                Registration Deadline:{" "}
                {deadline
                  ? new Date(deadline).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                Duration: {startDate ? new Date(startDate).toLocaleDateString() : "TBD"} - {endDate ? new Date(endDate).toLocaleDateString() : "TBD"}
              </span>
            </div>

            {/* Fee Display */}
            {hasEntryFee ? (
              <div className="flex items-center gap-1 text-green-700 font-medium px-2 py-0.5 bg-green-50 rounded-full border border-green-200">
                <CreditCard className="h-4 w-4" />
                <span>
                  Entry Fee: {currency} {feeAmount}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-green-700 font-medium px-2 py-0.5 bg-green-50 rounded-full border border-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <span>Free Entry</span>
              </div>
            )}
          </div>

          <div className="prose max-w-none pt-4 border-t">
            <h3 className="text-lg font-semibold">About this Challenge</h3>
            <p className="whitespace-pre-wrap">{challenge.description}</p>
          </div>
        </div>

        {/* --- SIDEBAR ACTIONS --- */}
        <div className="space-y-6">
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-muted/10 pb-4">
              <CardTitle>Challenge Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {hasJoined ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Progress</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    {completedCount} of {totalMilestones} milestones submitted
                  </p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-2 text-sm">
                  Join this challenge to start tracking your progress and submitting solutions.
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="space-y-4">
                {hasJoined ? (
                  <Button
                    disabled
                    className="w-full bg-green-600/20 text-green-600 hover:bg-green-600/20 font-semibold"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Already Joined
                  </Button>
                ) : isRegistrationClosed ? (
                  <Button disabled className="w-full" variant="secondary">
                    <Lock className="mr-2 h-4 w-4" />
                    Registration Closed
                  </Button>
                ) : hasEntryFee ? (
                  // PAID FLOW
                  <Button
                    asChild
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold shadow-md"
                    size="lg"
                  >
                    <Link href={`/challenges/${challenge.id}/payment`}>
                      Join for {currency} {feeAmount}
                    </Link>
                  </Button>
                ) : (
                  // FREE FLOW
                  <JoinChallengeDialog
                    challengeId={id}
                    // Fix: Convert TeamData to the exact shape expected by JoinChallengeDialog
                    // We ensure leader_id is a string (default to empty string if null)
                    userTeam={userTeam ? { 
                      id: userTeam.id, 
                      name: userTeam.name, 
                      leader_id: userTeam.leader_id || "" 
                    } : null}
                    userId={userId}
                    registrationClosed={isRegistrationClosed}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- MILESTONES SECTION --- */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
           Milestones
           <Badge variant="secondary" className="text-sm font-normal">
             {milestones.length} Steps
           </Badge>
        </h2>
        
        {milestonesWithStatus.length === 0 ? (
          <p className="text-muted-foreground italic">No milestones have been set for this challenge yet.</p>
        ) : (
          <div className="grid gap-6">
            {milestonesWithStatus.map((milestone, index) => (
              <Card
                key={milestone.id}
                className={`
                  transition-all duration-200
                  ${
                    milestone.status === "locked"
                      ? "opacity-60 bg-muted/30 border-dashed"
                      : "border-l-4 border-l-primary shadow-sm"
                  }
                `}
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
                          STEP {index + 1}
                        </span>
                        
                        {/* Status Badges */}
                        {milestone.status === "completed" && (
                          <Badge variant="success" className="gap-1 pl-1 pr-2">
                            <CheckCircle2 className="h-3 w-3" /> 
                            {milestone.evaluation ? "Graded" : "Submitted"}
                          </Badge>
                        )}
                        {milestone.status === "locked" && (
                          <Badge variant="outline" className="gap-1 pl-1 pr-2">
                            <Lock className="h-3 w-3" /> Locked
                          </Badge>
                        )}
                        {milestone.status === "in_progress" && (
                          <Badge className="gap-1 pl-1 pr-2 bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
                            <MessageSquare className="h-3 w-3" /> In Progress
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl">{milestone.title}</CardTitle>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {/* Safe access to points assuming it exists on type now, fallback to 0 */}
                        {milestone.points || 0} <span className="text-sm font-normal text-muted-foreground">pts</span>
                      </div>
                      {milestone.due_date && (
                        <p className="text-xs text-muted-foreground mt-1 font-medium">
                          Due: {new Date(milestone.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {milestone.description}
                  </p>

                  {/* Submission Logic - PROTECTED BY PARTICIPANT CHECK */}
                  {milestone.status === "in_progress" && participant && (
                    <div className="mt-6 pt-6 border-t bg-slate-50 -mx-6 px-6 pb-2">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Submit Your Work
                      </h4>
                      <SubmissionForm
                        milestoneId={milestone.id}
                        participantId={participant.id} 
                        // Fix: Convert null to undefined for SubmissionForm prop type compatibility
                        teamId={userTeam?.id || undefined}
                        isTeamLeader={userTeam?.leader_id === userId}
                      />
                    </div>
                  )}

                  {/* Feedback Display */}
                  {milestone.status === "completed" &&
                    milestone.evaluation && (
                      <Card className="bg-green-50/50 border-green-200 mt-4">
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-center justify-between border-b border-green-100 pb-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <h4 className="font-semibold text-green-900">
                                Feedback Received
                              </h4>
                            </div>
                            {milestone.evaluation.score !== null && (
                              <div className="text-lg font-bold text-green-800 flex items-center gap-2">
                                <span className="text-sm font-normal text-green-700/80 uppercase tracking-wide">
                                  Score
                                </span>
                                <Badge variant="default" className="text-base px-3 py-1">
                                  {milestone.evaluation.score}/100
                                </Badge>
                              </div>
                            )}
                          </div>
                          
                          {milestone.evaluation.feedback && (
                            <div className="prose prose-sm prose-green max-w-none">
                              <p className="whitespace-pre-wrap text-green-800/90">
                                {milestone.evaluation.feedback}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                  {/* Pending Feedback State */}
                  {milestone.status === "completed" &&
                    milestone.submission &&
                    !milestone.evaluation && (
                      <Card className="bg-muted/30 border-dashed mt-4">
                        <CardContent className="pt-6 flex flex-col items-center justify-center text-center py-8">
                          <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center mb-3">
                             <Clock className="h-5 w-5 text-yellow-600" />
                          </div>
                          <h4 className="font-semibold text-foreground">Submission Received</h4>
                          <p className="text-sm text-muted-foreground max-w-xs mt-1">
                            Your work has been submitted successfully. Waiting for organizer review and feedback.
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