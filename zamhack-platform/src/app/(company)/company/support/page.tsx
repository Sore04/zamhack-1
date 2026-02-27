import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import SupportForm from "./support-form"

export default async function CompanySupportPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="cp-page-title">Admin Support</h1>
        <p className="cp-page-subtitle">
          Get help from the ZamHack team. We typically respond within 24 hours.
        </p>
      </div>

      <SupportForm />
    </div>
  )
}