"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"

export async function updateOrganization(orgId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.organization_id !== orgId) {
    return { error: "Unauthorized access to this organization" }
  }

  if (profile.role !== "company_admin") {
    return { error: "Only admins can edit organization details" }
  }

  const name = formData.get("name") as string
  const industry = formData.get("industry") as string
  const description = formData.get("description") as string
  const website = formData.get("website") as string
  const logo_url = formData.get("logo_url") as string

  if (!name) return { error: "Company name is required" }

  const { error } = await supabase
    .from("organizations")
    .update({
      name,
      industry: industry || null,
      description: description || null,
      website: website || null,
      logo_url: logo_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orgId)

  if (error) return { error: error.message }

  revalidatePath("/company/organization")
  return { success: "Organization updated successfully!" }
}