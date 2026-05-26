'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { updatePubgId } from '@/app/auth/actions'
import type { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [pubgId, setPubgId] = useState('')
  const [savedPubgId, setSavedPubgId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/?auth=login')
        return
      }

      setUser(user)

      // Load existing PUBG ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('pubg_id')
        .eq('id', user.id)
        .single()

      if (profile?.pubg_id) {
        setPubgId(profile.pubg_id)
        setSavedPubgId(profile.pubg_id)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage(null)

    const result = await updatePubgId(user.id, pubgId.trim())

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setSavedPubgId(pubgId.trim())
      setMessage({ type: 'success', text: '✓ PUBG ID saved successfully.' })
      setTimeout(() => setMessage(null), 3000)
    }

    setSaving(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace('/')
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
        }}
      >
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(240,235,224,0.3)',
          }}
        >
          Loading...
        </span>
      </div>
    )
  }

  return (
    <div className="dashboard-page">

      {/* Back link */}
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <Link
          href="/"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '9px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(240,235,224,0.3)',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--amber)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,235,224,0.3)')}
        >
          ← BMG Clan
        </Link>
      </div>

      {/* Main card */}
      <div className="dashboard-card">

        <div>
          <div className="dashboard-subtitle">BMG Clan · Member Profile</div>
          <div className="dashboard-title">Dashboard</div>
        </div>

        {/* User info */}
        <div
          style={{
            background: 'rgba(26,184,160,0.06)',
            border: '1px solid rgba(26,184,160,0.15)',
            borderRadius: '10px',
            padding: '12px 16px',
          }}
        >
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '9px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--teal)',
              marginBottom: '4px',
            }}
          >
            Signed in as
          </div>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: 'var(--cream)',
              wordBreak: 'break-all',
            }}
          >
            {user?.email}
          </div>

          {user?.email === 'admin@bmgclan.com' && (
            <div style={{ marginTop: '12px' }}>
              <Link href="/admin" className="auth-btn" style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                Go to Admin Dashboard →
              </Link>
            </div>
          )}
        </div>

        <div className="dashboard-divider" />

        {/* PUBG ID form */}
        <div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '9px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--amber)',
              marginBottom: '12px',
            }}
          >
            Your PUBG ID
          </div>

          {savedPubgId && (
            <div
              style={{
                background: 'rgba(232,160,32,0.08)',
                border: '1px solid rgba(232,160,32,0.2)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '12px',
                fontFamily: "'DM Mono', monospace",
                fontSize: '13px',
                color: 'var(--cream)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '10px', color: 'var(--amber)', letterSpacing: '0.1em' }}>
                CURRENT:
              </span>
              {savedPubgId}
            </div>
          )}

          <form className="pubg-form" onSubmit={handleSave}>
            <div>
              <label className="auth-label" htmlFor="pubg-id-input">
                {savedPubgId ? 'Update PUBG ID' : 'Enter PUBG ID'}
              </label>
              <input
                id="pubg-id-input"
                className="auth-input"
                type="text"
                placeholder="YourPUBGID#1234"
                value={pubgId}
                onChange={e => setPubgId(e.target.value)}
                required
              />
            </div>

            {message && (
              <div className={`auth-msg ${message.type}`}>
                {message.text}
              </div>
            )}

            <button
              id="save-pubg-btn"
              className="auth-btn"
              type="submit"
              disabled={saving || !pubgId.trim()}
            >
              {saving ? '...' : savedPubgId ? 'Update PUBG ID →' : 'Save PUBG ID →'}
            </button>
          </form>
        </div>

        <div className="dashboard-divider" />

        {/* Actions */}
        <div className="nav-row">
          <button
            className="auth-signout-btn"
            onClick={handleSignOut}
            id="dashboard-signout-btn"
          >
            Sign out
          </button>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '9px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'rgba(240,235,224,0.15)',
            }}
          >
            BMG Clan © 2026
          </div>
        </div>

      </div>
    </div>
  )
}
