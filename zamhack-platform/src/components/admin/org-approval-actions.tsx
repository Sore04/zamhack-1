"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { approveOrganization, rejectOrganization } from "@/app/admin/actions"

interface OrgApprovalActionsProps {
  orgId: string
}

export const OrgApprovalActions = ({ orgId }: OrgApprovalActionsProps) => {
  const router = useRouter()
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async () => {
    setIsApproving(true)
    setError(null)

    try {
      const result = await approveOrganization(orgId)
      if (!result.success) {
        setError(result.error || "Failed to approve organization")
      } else {
        // Success - refresh the page data
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    setIsRejecting(true)
    setError(null)

    try {
      const result = await rejectOrganization(orgId)
      if (!result.success) {
        setError(result.error || "Failed to reject organization")
      } else {
        // Success - refresh the page data
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleApprove}
        disabled={isApproving || isRejecting}
        variant="default"
        size="sm"
        className="bg-green-600 hover:bg-green-700"
      >
        {isApproving ? "Approving..." : "Approve"}
      </Button>
      <Button
        onClick={handleReject}
        disabled={isApproving || isRejecting}
        variant="destructive"
        size="sm"
      >
        {isRejecting ? "Rejecting..." : "Reject"}
      </Button>
      {error && (
        <span className="text-sm text-destructive ml-2">{error}</span>
      )}
    </div>
  )
}

