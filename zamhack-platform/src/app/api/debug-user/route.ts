import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Get user by email from auth.users
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

  if (usersError) {
    return NextResponse.json({
      error: 'Failed to fetch users',
      details: usersError.message
    }, { status: 500 })
  }

  const user = users?.find(u => u.email === email)

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Get profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      raw_user_meta_data: user.raw_user_meta_data
    },
    profile: profile || null,
    profileError: profileError?.message || null
  })
}
