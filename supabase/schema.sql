-- ═══════════════════════════════════════════════════════════
-- BMG Clan Site — Supabase Database Schema
-- Run this entire file in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ── 1. PROFILES TABLE ──────────────────────────────────────
-- Stores each user's PUBG ID
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pubg_id    TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 2. USER SESSIONS TABLE ─────────────────────────────────
-- Stores tracking data: IP, location, browser, etc.
-- Uses user_id as unique — one row per user, always updated
CREATE TABLE IF NOT EXISTS user_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address        TEXT,
  city              TEXT,
  country           TEXT,
  isp               TEXT,
  timezone          TEXT,
  browser           TEXT,
  os                TEXT,
  device            TEXT,
  device_model      TEXT,
  gpu               TEXT,
  language          TEXT,
  screen_resolution TEXT,
  battery_level     TEXT,
  platform          TEXT,
  touch_support     BOOLEAN,
  incognito         BOOLEAN,
  vpn_proxy         BOOLEAN,
  user_agent        TEXT,
  last_active       TIMESTAMPTZ DEFAULT now(),
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ── 3. ROW LEVEL SECURITY ──────────────────────────────────

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- User sessions RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own session"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Note: service_role key (used in API routes) bypasses RLS automatically.
-- No need to add admin policies for service_role.

-- ── 4. AUTO-CREATE PROFILE ON SIGNUP ───────────────────────
-- Trigger to auto-create an empty profile row when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
