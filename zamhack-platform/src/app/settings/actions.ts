"use server"

import { createClient } from "@/utils/supabase/server"

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to update your password" }
  }

  // Extract form data
  const newPassword = formData.get("new_password") as string | null
  const confirmPassword = formData.get("confirm_password") as string | null

  // Validate inputs
  if (!newPassword || !confirmPassword) {
    return { error: "Both password fields are required" }
  }

  // Check if passwords match
  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  // Validate password length (minimum 6 characters as per Supabase default)
  if (newPassword.length < 6) {
    return { error: "Password must be at least 6 characters long" }
  }

  // Update password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}












