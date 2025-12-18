import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { CreateChallengeForm } from "@/components/challenges/create-challenge-form"

export default async function CreateChallengePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    redirect("/login")
  }

  if (profile.role !== "company_admin" && profile.role !== "company_member") {
    redirect("/dashboard")
  }

  if (!profile.organization_id) {
    throw new Error("User does not have an organization assigned")
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Challenge</h1>
        <p className="text-muted-foreground mt-2">
          Fill out the form below to create a new challenge for students
        </p>
      </div>
      <CreateChallengeForm organizationId={profile.organization_id} />
    </div>
  )
}












