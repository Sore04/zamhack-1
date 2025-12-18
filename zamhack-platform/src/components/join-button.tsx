"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { joinChallenge } from "@/app/challenges/actions"

interface JoinButtonProps {
  challengeId: string
}

export const JoinButton = ({ challengeId }: JoinButtonProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
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

  const handleJoin = async () => {
    setIsLoading(true)
    setToast(null)

    try {
      const result = await joinChallenge(challengeId)

      if (result.error) {
        setToast({ message: result.error, type: "error" })
      } else {
        setToast({ message: "Successfully joined!", type: "success" })
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

  return (
    <div className="relative">
      <Button
        className="w-full"
        onClick={handleJoin}
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

