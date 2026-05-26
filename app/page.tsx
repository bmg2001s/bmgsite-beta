'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { signIn, signUp } from '@/app/auth/actions'
import { collectClientData } from '@/lib/analytics'
import type { User } from '@supabase/supabase-js'

type Tab = 'login' | 'register'

export default function HomePage() {
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const tracked = useRef(false)

  // Check current auth state
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setCheckingAuth(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Track user on login
  const trackUser = async (userId: string) => {
    if (tracked.current) return
    tracked.current = true
    try {
      const analytics = await collectClientData()
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...analytics }),
      })
    } catch { /* silent */ }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (!email || !password) {
      setMessage({ type: 'error', text: 'Email and password are required.' })
      setLoading(false)
      return
    }

    const result = tab === 'login'
      ? await signIn(email, password)
      : await signUp(email, password)

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
      setLoading(false)
      return
    }

    if (result.user) {
      await trackUser(result.user.id)
      setMessage({
        type: 'success',
        text: tab === 'login' ? 'Welcome back! Redirecting...' : 'Account created! Redirecting...',
      })
      setTimeout(() => {
        if (result.user?.email === 'admin@bmgclan.com') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }, 800)
    }

    setLoading(false)
  }

  const handleSignOut = async () => {
    tracked.current = false
    await supabase.auth.signOut()
    setUser(null)
  }

  const switchTab = (t: Tab) => {
    setTab(t)
    setMessage(null)
    setEmail('')
    setPassword('')
  }

  return (
    <div className="stage">
      <div className="stage-inner">

        {/* ── HEADER ── */}
        <div className="header">
          <h1 className="headline">
            <span className="word-a">BMG</span><span className="arrow-wrap">
              <span className="arrow-left">←</span>
              <span className="arrow-right">→</span>
            </span><span className="word-b">CLAN</span>
          </h1>
          <div className="kicker">Elite PUBG Squad · Est. 2024 · No Mercy</div>
        </div>

        {/* ── MARQUEE TRACKS ── */}
        <div className="tracks">

          {/* Track A → scrolls LEFT ← */}
          <div className="track">
            <div className="track-inner track-inner-a">
              <div className="item"><span className="item-arrow">←</span><span className="word">Squad</span><span className="item-sep"></span></div>
              <div className="item"><span className="item-arrow">←</span><span className="word">Victory</span><span className="item-sep"></span></div>
              <div className="item"><span className="item-arrow">←</span><span className="word">Drop Zone</span><span className="item-sep"></span></div>
              <div className="item"><span className="item-arrow">←</span><span className="word">Sniper</span><span className="item-sep"></span></div>
              <div className="item"><span className="item-arrow">←</span><span className="word">Clutch</span><span className="item-sep"></span></div>
              <div className="item"><span className="item-arrow">←</span><span className="word">Ranked</span><span className="item-sep"></span></div>
              <div className="item"><span className="item-arrow">←</span><span className="word">Conqueror</span><span className="item-sep"></span></div>
              <div className="item"><span className="item-arrow">←</span><span className="word">Chicken</span><span className="item-sep"></span></div>
              {/* Duplicate for seamless loop */}
              <div className="item"><span className="item-arrow">←</span><span className="word">Squad</span><span className="item-sep"></span></div>
              <div className="item"><span className="item-arrow">←</span><span className="word">Victory</span><span className="item-sep"></span></div>
              <div className="item"><span className="item-arrow">←</span><span className="word">Drop Zone</span><span className="item-sep"></span></div>
              <div className="item"><span className="item-arrow">←</span><span className="word">Sniper</span><span className="item-sep"></span></div>
              <div className="item"><span className="item-arrow">←</span><span className="word">Clutch</span><span className="item-sep"></span></div>
              <div className="item"><span className="item-arrow">←</span><span className="word">Ranked</span><span className="item-sep"></span></div>
              <div className="item"><span className="item-arrow">←</span><span className="word">Conqueror</span><span className="item-sep"></span></div>
              <div className="item"><span className="item-arrow">←</span><span className="word">Chicken</span><span className="item-sep"></span></div>
            </div>
          </div>

          {/* Track B → scrolls RIGHT → (opposite) */}
          <div className="track">
            <div className="track-inner track-inner-b">
              <div className="item"><span className="word">Eliminate</span><span className="item-arrow">→</span><span className="item-sep"></span></div>
              <div className="item"><span className="word">Headshot</span><span className="item-arrow">→</span><span className="item-sep"></span></div>
              <div className="item"><span className="word">Rush</span><span className="item-arrow">→</span><span className="item-sep"></span></div>
              <div className="item"><span className="word">Dominate</span><span className="item-arrow">→</span><span className="item-sep"></span></div>
              <div className="item"><span className="word">No Mercy</span><span className="item-arrow">→</span><span className="item-sep"></span></div>
              <div className="item"><span className="word">Pro</span><span className="item-arrow">→</span><span className="item-sep"></span></div>
              <div className="item"><span className="word">Ace</span><span className="item-arrow">→</span><span className="item-sep"></span></div>
              <div className="item"><span className="word">Legend</span><span className="item-arrow">→</span><span className="item-sep"></span></div>
              {/* Duplicate */}
              <div className="item"><span className="word">Eliminate</span><span className="item-arrow">→</span><span className="item-sep"></span></div>
              <div className="item"><span className="word">Headshot</span><span className="item-arrow">→</span><span className="item-sep"></span></div>
              <div className="item"><span className="word">Rush</span><span className="item-arrow">→</span><span className="item-sep"></span></div>
              <div className="item"><span className="word">Dominate</span><span className="item-arrow">→</span><span className="item-sep"></span></div>
              <div className="item"><span className="word">No Mercy</span><span className="item-arrow">→</span><span className="item-sep"></span></div>
              <div className="item"><span className="word">Pro</span><span className="item-arrow">→</span><span className="item-sep"></span></div>
              <div className="item"><span className="word">Ace</span><span className="item-arrow">→</span><span className="item-sep"></span></div>
              <div className="item"><span className="word">Legend</span><span className="item-arrow">→</span><span className="item-sep"></span></div>
            </div>
          </div>

        </div>

        {/* ── ORBITS ── */}
        <div className="orbits-section">

          <div className="orbit-wrap">
            <div className="orbit">
              <div className="ring-outer"></div>
              <div className="ring-inner"></div>
              <div className="ring-core"></div>
            </div>
            <div className="orbit-label">
              <strong>CW ↻</strong>
              outer ring
            </div>
          </div>

          <div className="orbit-div"><span>vs</span></div>

          <div className="orbit-wrap">
            <div className="orbit">
              <div className="ring-outer"></div>
              <div className="ring-inner"></div>
              <div className="ring-core"></div>
            </div>
            <div className="orbit-label">
              <strong>CCW ↺</strong>
              outer ring
            </div>
          </div>

          <div className="orbit-div"><span>vs</span></div>

          <div className="orbit-wrap">
            <div className="orbit">
              <div className="ring-outer"></div>
              <div className="ring-inner"></div>
              <div className="ring-core"></div>
            </div>
            <div className="orbit-label">
              <strong>CW ↻</strong>
              outer ring
            </div>
          </div>

        </div>

        {/* ── FOOTER CREDIT ── */}
        <div className="footer-info">
          <span>BMG Clan</span>
          <span className="sep">·</span>
          <span>Elite PUBG</span>
          <span className="sep">·</span>
          <span>Est. 2024</span>
        </div>

        {/* ══════════════════════════════════
            AUTH PANEL — bottom of page
        ══════════════════════════════════ */}
        <div className="auth-section">
          <div className="auth-panel">

            {checkingAuth ? (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <span className="auth-label" style={{ color: 'rgba(240,235,224,0.2)' }}>
                  Checking session...
                </span>
              </div>
            ) : user ? (
              /* ── LOGGED IN STATE ── */
              <div className="auth-logged-in">
                <p>✓ Signed in as</p>
                <p className="user-email">{user.email}</p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href={user.email === 'admin@bmgclan.com' ? '/admin' : '/dashboard'} className="auth-link-btn">
                    {user.email === 'admin@bmgclan.com' ? 'Admin Dashboard →' : 'My Dashboard →'}
                  </Link>
                </div>
                <button className="auth-signout-btn" onClick={handleSignOut}>
                  Sign out
                </button>
              </div>
            ) : (
              /* ── LOGIN / REGISTER FORM ── */
              <>
                <div className="auth-tabs">
                  <button
                    id="auth-tab-login"
                    className={`auth-tab${tab === 'login' ? ' active' : ''}`}
                    onClick={() => switchTab('login')}
                    type="button"
                  >
                    Login
                  </button>
                  <button
                    id="auth-tab-register"
                    className={`auth-tab${tab === 'register' ? ' active' : ''}`}
                    onClick={() => switchTab('register')}
                    type="button"
                  >
                    Register
                  </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label className="auth-label" htmlFor="auth-email">Email</label>
                    <input
                      id="auth-email"
                      className="auth-input"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div>
                    <label className="auth-label" htmlFor="auth-password">Password</label>
                    <input
                      id="auth-password"
                      className="auth-input"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                      required
                      minLength={6}
                    />
                  </div>

                  {message && (
                    <div className={`auth-msg ${message.type}`}>
                      {message.text}
                    </div>
                  )}

                  <button
                    id="auth-submit-btn"
                    className="auth-btn"
                    type="submit"
                    disabled={loading}
                  >
                    {loading
                      ? '...'
                      : tab === 'login' ? 'Login →' : 'Create Account →'}
                  </button>
                </form>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}
