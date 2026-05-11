'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Incorrect email or password.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div>
      <h1 style={{ fontSize: 15, fontWeight: 'normal', marginBottom: 24, color: 'var(--color-primary)' }}>
        Sign in
      </h1>

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

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="label">Password</span>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={inputStyle}
          />
        </label>

        {error && (
          <p style={{ fontSize: 12, color: '#c0392b' }}>{error}</p>
        )}

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
        <Link href="/reset-password" className="label" style={{ color: 'var(--color-text-muted)' }}>
          Forgot password?
        </Link>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          No account?{' '}
          <Link href="/register" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
            Create membership
          </Link>
        </p>
      </div>
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
