import { createBrowserClient } from '@supabase/ssr'

// Fallbacks used only during build/SSR — real values come from .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://build-placeholder.supabase.co'
// Minimal valid-format JWT (header.payload.sig) for build-time validation
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.build-placeholder'

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
