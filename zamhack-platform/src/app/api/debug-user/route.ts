import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json(
      { error: "Not authenticated", details: userError },
      { status: 401 }
    )
  }

  // Fetch profile to check linkage
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return NextResponse.json({
    auth_user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      // FIX: Changed from raw_user_meta_data to user_metadata
      user_metadata: user.user_metadata,
      role: user.role,
    },
    profile: profile || null,
    profileError: profileError ? profileError.message : null,
    match: profile ? "Linked successfully" : "Missing profile",
  })
}