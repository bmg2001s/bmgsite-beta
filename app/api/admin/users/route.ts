import { NextRequest, NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  noStore()
  // Verify the requester is the admin
  const supabaseUser = await createServerClient()
  const { data: { user } } = await supabaseUser.auth.getUser()

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@bmgclan.com'
  if (!user || user.email !== adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Use service role to get all auth users
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Get all auth users
  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  const userIds = authData.users.map(u => u.id)

  // Get profiles (PUBG IDs)
  const { data: profiles } = await adminClient
    .from('profiles')
    .select('id, pubg_id')
    .in('id', userIds)

  // Get sessions (tracking data)
  const { data: sessions } = await adminClient
    .from('user_sessions')
    .select('*')
    .in('user_id', userIds)

  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))
  const sessionMap = Object.fromEntries((sessions || []).map(s => [s.user_id, s]))

  // Merge everything
  const rows = authData.users.map(u => ({
    id: u.id,
    email: u.email ?? '',
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
    pubg_id: profileMap[u.id]?.pubg_id ?? null,
    ip_address:  sessionMap[u.id]?.ip_address ?? null,
    city:        sessionMap[u.id]?.city ?? null,
    country:     sessionMap[u.id]?.country ?? null,
    isp:         sessionMap[u.id]?.isp ?? null,
    timezone:    sessionMap[u.id]?.timezone ?? null,
    browser:     sessionMap[u.id]?.browser ?? null,
    os:          sessionMap[u.id]?.os ?? null,
    device:      sessionMap[u.id]?.device ?? null,
    user_agent:  sessionMap[u.id]?.user_agent ?? null,
    device_model:sessionMap[u.id]?.device_model ?? null,
    gpu:         sessionMap[u.id]?.gpu ?? null,
    language:    sessionMap[u.id]?.language ?? null,
    screen_resolution: sessionMap[u.id]?.screen_resolution ?? null,
    battery_level: sessionMap[u.id]?.battery_level ?? null,
    platform:    sessionMap[u.id]?.platform ?? null,
    touch_support: sessionMap[u.id]?.touch_support ?? null,
    incognito:   sessionMap[u.id]?.incognito ?? null,
    vpn_proxy:   sessionMap[u.id]?.vpn_proxy ?? null,
    last_active: sessionMap[u.id]?.last_active ?? null,
  }))

  // Sort: newest first
  rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return NextResponse.json(rows)
}
