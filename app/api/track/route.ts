import { NextRequest, NextResponse } from 'next/server'
import { UAParser } from 'ua-parser-js'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Get IP from headers (works on Vercel)
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '0.0.0.0'

    // Parse User-Agent
    const uaString = req.headers.get('user-agent') || ''
    const parser = new UAParser(uaString)
    const ua = parser.getResult()

    const browser = `${ua.browser.name || 'Unknown'} ${ua.browser.version || ''}`.trim()
    const os = `${ua.os.name || 'Unknown'} ${ua.os.version || ''}`.trim()
    const device = ua.device.type || 'desktop'

    // Fetch IP geolocation (free, no API key needed for ipapi.co)
    let city = 'Unknown'
    let country = 'Unknown'
    let isp = 'Unknown'
    let timezone = 'Unknown'

    try {
      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
        headers: { 'User-Agent': 'bmg-clan-site/1.0' },
        next: { revalidate: 0 },
      })
      if (geoRes.ok) {
        const geo = await geoRes.json()
        city = geo.city || 'Unknown'
        country = geo.country_name || 'Unknown'
        isp = geo.org || 'Unknown'
        timezone = geo.timezone || 'Unknown'
      }
    } catch {
      // Geo lookup failed — continue with defaults
    }

    // Upsert session info into Supabase
    const adminSupabase = createServiceClient()
    const { error } = await adminSupabase
      .from('user_sessions')
      .upsert(
        {
          user_id: userId,
          ip_address: ip,
          city,
          country,
          isp,
          timezone,
          browser,
          os,
          device,
          user_agent: uaString,
          last_active: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Track API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
