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
    <>
      {/* ── BACKGROUND VIDEO ── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: -1,
          opacity: 0.25,
          pointerEvents: 'none',
        }}
      >
        <source src="/pubg-trailer.mp4" type="video/mp4" />
      </video>

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
          <div className="kicker">Elite PUBG Squad · Est. 2026 · No Mercy</div>
          
          {/* Fake Stats / Features to make UI look better */}
          <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', marginTop: '30px', fontSize: '12px', color: 'rgba(240,235,224,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ color: 'var(--amber)', fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>50+</span>
              Active Members
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ color: 'var(--teal)', fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>Daily</span>
              Custom Rooms
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ color: 'var(--rose)', fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>T1</span>
              Competitive Roster
            </div>
          </div>
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
          <span>Est. 2026</span>
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

          {/* ── SOCIALS UNDER LOGIN ── */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
            <a href="https://discord.gg/TWTqgHgXgB" target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', 
              color: 'rgba(240, 235, 224, 0.8)', padding: '10px 16px', borderRadius: '6px',
              textDecoration: 'none', fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em',
              transition: 'all 0.2s ease', cursor: 'pointer'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(88, 101, 242, 0.15)'; e.currentTarget.style.borderColor = 'rgba(88, 101, 242, 0.5)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = 'rgba(240, 235, 224, 0.8)' }}
            >
              <svg width="18" height="18" viewBox="0 0 127.14 96.36" fill="currentColor">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.59,67.59,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
              </svg>
              Discord
            </a>
            <a href="https://www.youtube.com/@brownmundegaming." target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', 
              color: 'rgba(240, 235, 224, 0.8)', padding: '10px 16px', borderRadius: '6px',
              textDecoration: 'none', fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em',
              transition: 'all 0.2s ease', cursor: 'pointer'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 0, 0, 0.15)'; e.currentTarget.style.borderColor = 'rgba(255, 0, 0, 0.5)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = 'rgba(240, 235, 224, 0.8)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.86-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z"/>
              </svg>
              YouTube
            </a>
          </div>
        </div>

      </div>
    </div>
    </>
  )
}
