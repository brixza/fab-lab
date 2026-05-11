'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const claimToken = searchParams.get('token')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: claimToken
          ? `${location.origin}/claim?token=${claimToken}`
          : `${location.origin}/dashboard`,
      },
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
        <p style={{ fontSize: 15, color: 'var(--color-primary)', marginBottom: 12 }}>Check your email</p>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
          We sent a confirmation link to <strong>{email}</strong>.
          Click it to activate your membership.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: 15, fontWeight: 'normal', marginBottom: 8, color: 'var(--color-primary)' }}>
        Create membership
      </h1>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
        Earn points on every purchase, in-store and online.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="label">Full name</span>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoComplete="name"
            style={inputStyle}
          />
        </label>

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
            minLength={8}
            autoComplete="new-password"
            style={inputStyle}
          />
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Minimum 8 characters</span>
        </label>

        {error && (
          <p style={{ fontSize: 12, color: '#c0392b' }}>{error}</p>
        )}

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Creating...' : 'Create membership'}
        </button>
      </form>

      <p style={{ marginTop: 24, fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center' }}>
        Already a member?{' '}
        <Link href="/login" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
          Sign in
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
