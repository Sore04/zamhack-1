import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import ProfileForm from "./profile-form"

export default async function CompanySettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return <div className="p-6">Error loading profile. Please try logging in again.</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="cp-page-title">Account Settings</h1>
        <p className="cp-page-subtitle">Manage your personal account details and security.</p>
      </div>

      <ProfileForm profile={profile} email={user.email || ""} />
    </div>
  )
}