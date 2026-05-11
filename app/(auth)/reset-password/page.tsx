'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password/confirm`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: 'var(--color-primary)', marginBottom: 12 }}>Email sent</p>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
          Check your inbox for a password reset link.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: 15, fontWeight: 'normal', marginBottom: 8, color: 'var(--color-primary)' }}>
        Reset password
      </h1>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 24 }}>
        Enter your email and we'll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="label">Email</span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={inputStyle}
          />
        </label>

        {error && <p style={{ fontSize: 12, color: '#c0392b' }}>{error}</p>}

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <p style={{ marginTop: 24, fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center' }}>
        <Link href="/login" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
          Back to sign in
        </Link>
      </p>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '0.5px solid var(--color-border)',
  background: 'var(--color-card)',
  fontSize: 13,
  fontFamily: 'inherit',
  color: 'var(--color-text)',
  outline: 'none',
  width: '100%',
}

const buttonStyle: React.CSSProperties = {
  marginTop: 8,
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
