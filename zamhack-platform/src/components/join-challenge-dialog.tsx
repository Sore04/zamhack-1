"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { joinChallenge } from "@/app/challenges/actions"
import { User, Users } from "lucide-react"

interface UserTeam {
  id: string
  name: string
  leader_id: string
}

interface JoinChallengeDialogProps {
  challengeId: string
  userTeam: UserTeam | null
  userId: string
}

export const JoinChallengeDialog = ({
  challengeId,
  userTeam,
  userId,
}: JoinChallengeDialogProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const handleJoin = async (teamId?: string) => {
    setIsLoading(true)
    setToast(null)

    try {
      const result = await joinChallenge(challengeId, teamId)

      if (result.error) {
        setToast({ message: result.error, type: "error" })
      } else {
        setToast({ message: "Successfully joined!", type: "success" })
        setOpen(false)
        // Refresh the page to update the UI
        router.refresh()
      }
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : "An unexpected error occurred",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If no team, show simple solo join button
  if (!userTeam) {
    return (
      <div className="relative">
        <Button
          className="w-full"
          onClick={() => handleJoin()}
          disabled={isLoading}
        >
          {isLoading ? "Joining..." : "Join Challenge"}
        </Button>

        {toast && (
          <div
            className={`absolute top-full left-0 right-0 mt-2 p-3 rounded-md text-sm ${
              toast.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
            role="alert"
          >
            {toast.message}
          </div>
        )}
      </div>
    )
  }

  // If team exists, show dialog with options
  const isLeader = userId === userTeam.leader_id

  return (
    <div className="relative">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">Join Challenge</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Challenge</DialogTitle>
            <DialogDescription>
              Choose how you want to participate in this challenge.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Solo Option */}
            <Card
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => !isLoading && handleJoin()}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">Join Solo</CardTitle>
                    <CardDescription>Participate as yourself</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Team Option */}
            <Card
              className={`transition-colors ${
                isLeader
                  ? "cursor-pointer hover:bg-accent"
                  : "opacity-60 cursor-not-allowed"
              }`}
              onClick={() => isLeader && !isLoading && handleJoin(userTeam.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">Join as {userTeam.name}</CardTitle>
                    <CardDescription>
                      {isLeader
                        ? "Register your team for this challenge"
                        : "Only team leaders can register the team"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {toast && (
            <div
              className={`p-3 rounded-md text-sm ${
                toast.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
              role="alert"
            >
              {toast.message}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}












