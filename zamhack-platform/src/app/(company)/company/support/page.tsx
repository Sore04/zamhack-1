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
    <div className="space-y-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Admin Support</h1>
        <p className="text-muted-foreground">
          We are here to help you manage your challenges and organization.
        </p>
      </div>

      <SupportForm />
    </div>
  )
}