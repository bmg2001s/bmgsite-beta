'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo } from 'react'
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
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
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
                <th>Device</th>
                <th>Browser</th>
                <th>OS</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={14}
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
                  <tr key={u.id}>
                    <td style={{ color: 'rgba(240,235,224,0.3)' }}>{i + 1}</td>
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
                    <td>{u.browser || '—'}</td>
                    <td>{u.os || '—'}</td>
                    <td>
                      <button
                        className="delete-btn"
                        id={`delete-user-${u.id}`}
                        onClick={() => handleDelete(u.id, u.email)}
                        disabled={deleting === u.id}
                      >
                        {deleting === u.id ? '...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}
