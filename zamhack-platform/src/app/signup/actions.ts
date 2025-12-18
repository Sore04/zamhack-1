"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // Common fields
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const role = formData.get("role") as string // 'student' or 'company_admin'

  // Role specific fields
  const university = formData.get("university") as string
  const companyName = formData.get("company") as string

  // Prepare metadata for the database trigger
  const metaData = {
    first_name: firstName,
    last_name: lastName,
    role: role,
    // Add these so we can use them in the profile later
    university: university || null,
    company_name: companyName || null,
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metaData,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // If email confirmation is enabled, they need to check email.
  // If disabled, they are logged in.
  // Ideally, redirect to a "Check your email" page or Dashboard.
  revalidatePath("/", "layout")
  return { success: true }
}