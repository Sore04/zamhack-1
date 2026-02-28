import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function PublicProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .single()

  return (
    <div style={{ padding: "2rem", color: "white", background: "#111", minHeight: "100vh" }}>
      <h1>Debug Profile Page</h1>
      <p><strong>Requested ID:</strong> {params.id}</p>
      <p><strong>Logged in as:</strong> {user.email}</p>
      <p><strong>Profile found:</strong> {profile ? "YES" : "NO"}</p>
      <p><strong>Error:</strong> {error ? JSON.stringify(error) : "none"}</p>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
    </div>
  )
}