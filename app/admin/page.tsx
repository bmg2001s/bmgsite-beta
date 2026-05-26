'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface UserRow {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  pubg_id: string | null
  ip_address: string | null
  city: string | null
  country: string | null
  isp: string | null
  timezone: string | null
  browser: string | null
  os: string | null
  device: string | null
  user_agent: string | null
  device_model: string | null
  gpu: string | null
  language: string | null
  screen_resolution: string | null
  battery_level: string | null
  platform: string | null
  touch_support: boolean | null
  incognito: boolean | null
  vpn_proxy: boolean | null
  last_active: string | null
}

function fmt(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return dateStr
  }
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [showDictionary, setShowDictionary] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOutLocal = async () => {
    await supabase.auth.signOut()
    router.replace('/')
  }

  const loadData = async () => {
    setLoading(true)
    setError(null)

    // Verify current user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/'); return }
    setAdminEmail(user.email ?? null)

    // Fetch via server-side API (to use service role)
    const res = await fetch('/api/admin/users')
    if (!res.ok) {
      setError('Failed to load users. Make sure SUPABASE_SERVICE_ROLE_KEY is set.')
      setLoading(false)
      return
    }

    const data: UserRow[] = await res.json()
    setUsers(data)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return users
    const q = search.toLowerCase()
    return users.filter(u =>
      u.email?.toLowerCase().includes(q) ||
      u.pubg_id?.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q) ||
      u.country?.toLowerCase().includes(q) ||
      u.browser?.toLowerCase().includes(q) ||
      u.os?.toLowerCase().includes(q) ||
      u.isp?.toLowerCase().includes(q)
    )
  }, [users, search])

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return
    setDeleting(userId)

    const res = await fetch('/api/admin/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const result = await res.json()

    if (result.error) {
      alert(`Error: ${result.error}`)
    } else {
      setUsers(prev => prev.filter(u => u.id !== userId))
    }

    setDeleting(null)
  }

  return (
    <div className="admin-page">

      {/* ── HEADER ── */}
      <div className="admin-header">
        <div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '9px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--rose)',
              marginBottom: '4px',
            }}
          >
            Restricted Access
          </div>
          <h1 className="admin-title">Admin Dashboard</h1>
          {adminEmail && (
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '10px',
                color: 'rgba(240,235,224,0.3)',
                marginTop: '4px',
                letterSpacing: '0.05em',
              }}
            >
              {adminEmail}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="auth-btn"
            onClick={() => setShowDictionary(!showDictionary)}
            style={{ width: 'auto', padding: '8px 16px', background: showDictionary ? 'var(--teal)' : 'rgba(240,235,224,0.05)', color: showDictionary ? '#000' : 'var(--cream)' }}
          >
            {showDictionary ? 'Hide Dictionary' : 'Data Dictionary'}
          </button>
          <button
            className="auth-btn"
            onClick={loadData}
            style={{ width: 'auto', padding: '8px 16px' }}
          >
            Refresh
          </button>
          <button
            className="auth-signout-btn"
            onClick={handleSignOutLocal}
            id="admin-signout-btn"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="admin-stats">
        <div className="stat-chip">
          <strong>{users.length}</strong>
          Total Members
        </div>
        <div className="stat-chip">
          <strong>{users.filter(u => u.pubg_id).length}</strong>
          With PUBG ID
        </div>
        <div className="stat-chip">
          <strong>{new Set(users.map(u => u.country).filter(Boolean)).size}</strong>
          Countries
        </div>
        <div className="stat-chip">
          <strong>{filtered.length}</strong>
          Shown
        </div>
      </div>

      {/* ── DATA DICTIONARY ── */}
      {showDictionary && (
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(240,235,224,0.1)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '14px', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            Tracking Data Dictionary
          </h2>
          <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
            {[
              { field: 'Device Type', desc: 'Classifies the hardware type (e.g., Mobile, Desktop, Tablet).' },
              { field: 'Device Model / Brand', desc: 'The manufacturer name or model number if exposed by the browser (e.g., iPhone, Samsung Galaxy).' },
              { field: 'GPU / Graphics Card', desc: 'The model of the graphics processor inside the device (e.g., Apple GPU, Intel Iris Xe).' },
              { field: 'Language', desc: "The primary language configuration of the user's system or browser (e.g., en-US)." },
              { field: 'Screen Resolution', desc: 'The width and height of the display in pixels.' },
              { field: 'Local Time / Timezone', desc: "The local time set on the user's device, revealing their actual timezone." },
              { field: 'Battery Level', desc: "The device's current battery percentage and whether it is plugged into power." },
              { field: 'Platform / Architecture', desc: 'The underlying platform string (e.g., Win32, Linux x86_64).' },
              { field: 'Touch Support', desc: 'Flags whether the screen supports touch capabilities (Yes/No).' },
              { field: 'Incognito / Private Mode', desc: 'Flags whether the user opened the link inside a private browsing session.' },
              { field: 'VPN / Proxy Detection', desc: 'An automated check flagging whether the IP matches known commercial VPNs or hosting centers.' },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '16px', borderBottom: '1px solid rgba(240,235,224,0.05)', paddingBottom: '12px' }}>
                <strong style={{ color: 'var(--cream)' }}>{item.field}</strong>
                <span style={{ color: 'rgba(240,235,224,0.6)' }}>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SEARCH ── */}
      <div>
        <input
          id="admin-search"
          className="admin-search"
          type="text"
          placeholder="Search email, PUBG ID, city, country, browser..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div
          className="auth-msg error"
          style={{ maxWidth: '600px' }}
        >
          {error}
        </div>
      )}

      {/* ── TABLE ── */}
      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 0',
            fontFamily: "'DM Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(240,235,224,0.2)',
          }}
        >
          Loading members...
        </div>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Email</th>
                <th>PUBG ID</th>
                <th>Registered</th>
                <th>Last Login</th>
                <th>Last Active</th>
                <th>IP Address</th>
                <th>Location</th>
                <th>ISP / Network</th>
                <th>Timezone</th>
                <th>Device Type</th>
                <th>Device Model</th>
                <th>GPU</th>
                <th>Language</th>
                <th>Resolution</th>
                <th>Battery</th>
                <th>Platform</th>
                <th>Touch</th>
                <th>Incognito</th>
                <th>VPN / Proxy</th>
                <th>Browser</th>
                <th>OS</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={24}
                    style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: 'rgba(240,235,224,0.2)',
                    }}
                  >
                    {search ? 'No results match your search.' : 'No members yet.'}
                  </td>
                </tr>
              ) : (
                filtered.map((u, i) => (
                  <React.Fragment key={u.id}>
                    <tr 
                      style={{ cursor: 'pointer', background: expandedId === u.id ? 'rgba(26,184,160,0.05)' : 'transparent' }}
                      onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}
                    >
                      <td style={{ color: 'rgba(240,235,224,0.3)' }}>
                        {expandedId === u.id ? '▼' : '▶'}
                      </td>
                      <td title={u.email} style={{ color: 'var(--cream)' }}>{u.email}</td>
                    <td>
                      {u.pubg_id
                        ? <span className="pubg-badge">{u.pubg_id}</span>
                        : <span className="empty-badge">—</span>
                      }
                    </td>
                    <td>{fmt(u.created_at)}</td>
                    <td>{fmt(u.last_sign_in_at)}</td>
                    <td>{fmt(u.last_active)}</td>
                    <td>{u.ip_address || '—'}</td>
                    <td>
                      {u.city && u.country
                        ? `${u.city}, ${u.country}`
                        : u.country || '—'
                      }
                    </td>
                    <td title={u.isp || ''}>{u.isp || '—'}</td>
                    <td>{u.timezone || '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{u.device || '—'}</td>
                    <td>{u.device_model || '—'}</td>
                    <td title={u.gpu || ''}>{u.gpu ? (u.gpu.length > 20 ? u.gpu.substring(0, 20) + '...' : u.gpu) : '—'}</td>
                    <td>{u.language || '—'}</td>
                    <td>{u.screen_resolution || '—'}</td>
                    <td>{u.battery_level || '—'}</td>
                    <td>{u.platform || '—'}</td>
                    <td>{u.touch_support ? 'Yes' : 'No'}</td>
                    <td>{u.incognito === true ? 'Yes' : u.incognito === false ? 'No' : '—'}</td>
                    <td>{u.vpn_proxy === true ? 'Yes' : u.vpn_proxy === false ? 'No' : '—'}</td>
                    <td>{u.browser || '—'}</td>
                    <td>{u.os || '—'}</td>
                    <td>
                        <button
                          className="delete-btn"
                          id={`delete-user-${u.id}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(u.id, u.email)
                          }}
                          disabled={deleting === u.id}
                        >
                          {deleting === u.id ? '...' : 'Delete'}
                        </button>
                      </td>
                    </tr>

                    {/* EXPANDED DETAILS */}
                    {expandedId === u.id && (
                      <tr style={{ background: 'rgba(26,184,160,0.02)' }}>
                        <td colSpan={24} style={{ padding: '20px' }}>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '20px',
                            background: 'rgba(0,0,0,0.4)',
                            border: '1px solid rgba(240,235,224,0.1)',
                            borderRadius: '8px',
                            padding: '20px',
                          }}>
                            {/* Column 1 */}
                            <div>
                              <div style={{ color: 'var(--teal)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.1em' }}>Core Identity</div>
                              <div style={{ marginBottom: '8px' }}><strong>ID:</strong> <span style={{ fontFamily: 'monospace', color: 'rgba(240,235,224,0.6)' }}>{u.id}</span></div>
                              <div style={{ marginBottom: '8px' }}><strong>Email:</strong> {u.email}</div>
                              <div style={{ marginBottom: '8px' }}><strong>PUBG ID:</strong> <span style={{ color: 'var(--amber)' }}>{u.pubg_id || 'Not Set'}</span></div>
                              <div style={{ marginBottom: '8px' }}><strong>First Seen:</strong> {fmt(u.created_at)}</div>
                              <div style={{ marginBottom: '8px' }}><strong>Last Active:</strong> {fmt(u.last_active)}</div>
                            </div>
                            
                            {/* Column 2 */}
                            <div>
                              <div style={{ color: 'var(--teal)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.1em' }}>Location & Network</div>
                              <div style={{ marginBottom: '8px' }}><strong>IP:</strong> {u.ip_address || '—'}</div>
                              <div style={{ marginBottom: '8px' }}><strong>City/Country:</strong> {u.city || '—'}, {u.country || '—'}</div>
                              <div style={{ marginBottom: '8px' }}><strong>ISP:</strong> {u.isp || '—'}</div>
                              <div style={{ marginBottom: '8px' }}><strong>Timezone:</strong> {u.timezone || '—'}</div>
                              <div style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}>
                                <strong>VPN/Proxy:</strong> 
                                {u.vpn_proxy === true ? <span style={{ color: 'var(--rose)', fontWeight: 'bold' }}>Detected</span> : 
                                 u.vpn_proxy === false ? <span style={{ color: 'var(--teal)' }}>Clean</span> : '—'}
                              </div>
                            </div>

                            {/* Column 3 */}
                            <div>
                              <div style={{ color: 'var(--teal)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.1em' }}>System & Hardware</div>
                              <div style={{ marginBottom: '8px' }}><strong>Device:</strong> {u.device_model || u.device || 'Desktop'}</div>
                              <div style={{ marginBottom: '8px' }}><strong>OS/Platform:</strong> {u.os || '—'} / {u.platform || '—'}</div>
                              <div style={{ marginBottom: '8px' }}><strong>GPU:</strong> {u.gpu || '—'}</div>
                              <div style={{ marginBottom: '8px' }}><strong>Resolution:</strong> {u.screen_resolution || '—'}</div>
                              <div style={{ marginBottom: '8px' }}><strong>Battery:</strong> {u.battery_level || '—'}</div>
                            </div>

                            {/* Column 4 */}
                            <div>
                              <div style={{ color: 'var(--teal)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.1em' }}>Browser Settings</div>
                              <div style={{ marginBottom: '8px' }}><strong>Browser:</strong> {u.browser || '—'}</div>
                              <div style={{ marginBottom: '8px' }}><strong>Language:</strong> {u.language || '—'}</div>
                              <div style={{ marginBottom: '8px' }}><strong>Touch Screen:</strong> {u.touch_support ? 'Yes' : 'No'}</div>
                              <div style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}>
                                <strong>Incognito:</strong>
                                {u.incognito === true ? <span style={{ color: 'var(--amber)' }}>Suspected</span> :
                                 u.incognito === false ? <span style={{ color: 'var(--teal)' }}>Normal</span> : '—'}
                              </div>
                            </div>
                            
                            {/* Full Width Row */}
                            <div style={{ gridColumn: '1 / -1' }}>
                              <div style={{ color: 'var(--teal)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.1em' }}>Raw User Agent</div>
                              <div style={{ 
                                fontFamily: 'monospace', 
                                fontSize: '11px', 
                                background: 'rgba(0,0,0,0.6)', 
                                padding: '8px', 
                                borderRadius: '4px',
                                color: 'rgba(240,235,224,0.5)',
                                wordBreak: 'break-all'
                              }}>
                                {u.user_agent || 'No user agent recorded'}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}
