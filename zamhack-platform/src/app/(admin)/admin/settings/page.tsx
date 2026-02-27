import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { SettingsForm } from "./settings-form"
import { Settings } from "lucide-react"
import "@/app/(admin)/admin.css"

export default async function AdminSettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (currentUserProfile?.role !== "admin") {
    return (
      <div className="space-y-4" data-layout="admin">
        <div className="admin-alert danger">
          <span style={{ fontWeight: 600 }}>Access Denied</span> — You do not have permission to view this page.
        </div>
      </div>
    )
  }

  const { data: settings, error } = await supabase
    .from("platform_settings" as any)
    .select("*")
    .eq("id", true)
    .single()

  if (error || !settings) {
    console.error("Error fetching settings:", error)
    return (
      <div className="space-y-4" data-layout="admin">
        <div className="admin-alert danger">
          Could not load platform settings. Please ensure the database is initialized.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" data-layout="admin" style={{ maxWidth: 860 }}>

      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          Platform <span>Settings</span>
        </h1>
        <p className="admin-page-subtitle">
          Manage global configuration, defaults, and system controls for ZamHack.
        </p>
      </div>

      <SettingsForm initialSettings={settings as any} />

    </div>
  )
}