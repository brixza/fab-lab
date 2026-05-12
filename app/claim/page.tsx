'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type State = 'checking' | 'claiming' | 'success' | 'expired' | 'used' | 'error' | 'unauthenticated'

function ClaimContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [state, setState] = useState<State>('checking')
  const [pointsAwarded, setPointsAwarded] = useState(0)

  useEffect(() => {
    if (!token) { setState('error'); return }

    async function run() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Not logged in — send to register with token preserved
        router.push(`/register?token=${token}`)
        return
      }

      setState('claiming')
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (res.ok) {
        setPointsAwarded(data.points_awarded)
        setState('success')
      } else if (res.status === 409) setState('used')
      else if (res.status === 410) setState('expired')
      else setState('error')
    }

    run()
  }, [token, router])

  if (state === 'checking' || state === 'claiming') {
    return (
      <p className="label" style={{ textAlign: 'center' }}>
        {state === 'checking' ? 'Verifying…' : 'Claiming your points…'}
      </p>
    )
  }

  if (state === 'success') {
    return (
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 8px' }}>Points earned</p>
          <p style={{ fontSize: 48, color: 'var(--color-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            +{pointsAwarded.toLocaleString('sv-SE')}
          </p>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
          Added to your membership. Thank you for shopping at Fab-lab.
        </p>
        <button onClick={() => router.push('/dashboard')} style={buttonStyle}>
          View my membership
        </button>
      </div>
    )
  }

  const messages: Record<string, string> = {
    expired: 'This QR code has expired. Ask staff to generate a new one.',
    used: 'This QR code has already been used.',
    error: 'Something went wrong. Please try again or ask staff for help.',
  }

  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
        {messages[state] ?? messages.error}
      </p>
      <a href="/dashboard" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
        Go to dashboard
      </a>
    </div>
  )
}

export default function ClaimPage() {
  return (
    <main style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      background: 'var(--color-bg)',
    }}>
      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-primary)', margin: '0 0 4px' }}>
            fab-lab
          </p>
          <p className="label">membership</p>
        </div>

        <Suspense fallback={<p className="label" style={{ textAlign: 'center' }}>Loading…</p>}>
          <ClaimContent />
        </Suspense>
      </div>
    </main>
  )
}

const buttonStyle: React.CSSProperties = {
  padding: '14px',
  background: 'var(--color-primary)',
  color: '#fff',
  border: 'none',
  fontSize: 11,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  fontFamily: 'inherit',
}
