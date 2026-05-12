'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function StaffLoginPage() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/staff/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })

    if (!res.ok) {
      setError('Incorrect PIN.')
      setLoading(false)
      return
    }

    router.push('/staff')
    router.refresh()
  }

  return (
    <main style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-primary)', margin: 0 }}>
            fab-lab
          </p>
          <p className="label" style={{ marginTop: 4 }}>staff access</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="label">PIN</span>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={e => setPin(e.target.value)}
              required
              autoFocus
              style={inputStyle}
            />
          </label>

          {error && <p style={{ fontSize: 12, color: '#c0392b' }}>{error}</p>}

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Verifying…' : 'Enter'}
          </button>
        </form>
      </div>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '12px',
  border: '0.5px solid var(--color-border)',
  background: 'var(--color-card)',
  fontSize: 20,
  letterSpacing: '0.3em',
  fontFamily: 'inherit',
  color: 'var(--color-text)',
  outline: 'none',
  textAlign: 'center',
}

const buttonStyle: React.CSSProperties = {
  padding: '12px',
  background: 'var(--color-primary)',
  color: '#fff',
  border: 'none',
  fontSize: 11,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  fontFamily: 'inherit',
}
