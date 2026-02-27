"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toggleUserStatus, deleteUser } from "./actions"
import { toast } from "sonner"
import { Ban, Trash2, CheckCircle } from "lucide-react"

interface UserActionsCellProps {
  userId: string
  status: string | null
}

export function UserActionsCell({ userId, status }: UserActionsCellProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isActive = status === "active" || !status

  const handleToggleStatus = async () => {
    setIsLoading(true)
    const result = await toggleUserStatus(userId, status || "active")
    if (result.error) toast.error(result.error)
    else toast.success(result.success)
    setIsLoading(false)
  }

  const handleDelete = async () => {
    setIsLoading(true)
    const result = await deleteUser(userId)
    if (result.error) toast.error(result.error)
    else toast.success(result.success)
    setIsLoading(false)
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem" }}>
      {/* Suspend / Reactivate */}
      <button
        onClick={handleToggleStatus}
        disabled={isLoading}
        className={`admin-btn admin-btn-sm ${isActive ? "admin-btn-outline" : "admin-btn-primary"}`}
        style={
          isActive
            ? { color: "var(--admin-yellow-text)", borderColor: "var(--admin-yellow)", background: "var(--admin-yellow-bg)" }
            : { background: "var(--admin-green)", color: "white" }
        }
        title={isActive ? "Suspend user" : "Reactivate user"}
      >
        {isActive ? (
          <Ban style={{ width: 14, height: 14 }} />
        ) : (
          <CheckCircle style={{ width: 14, height: 14 }} />
        )}
        {isActive ? "Suspend" : "Reactivate"}
      </button>

      {/* Delete */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            className="admin-btn admin-btn-sm admin-btn-danger"
            disabled={isLoading}
            title="Delete user"
          >
            <Trash2 style={{ width: 14, height: 14 }} />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The user's profile and all associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}