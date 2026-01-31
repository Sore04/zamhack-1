import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import ProfileForm from "./profile-form"

export default async function CompanySettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Fetch profile data from the database
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return <div>Error loading profile. Please try logging in again.</div>
  }

  return (
    <div className="space-y-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal account preferences.
        </p>
      </div>

      <ProfileForm profile={profile} email={user.email || ""} />
    </div>
  )
}