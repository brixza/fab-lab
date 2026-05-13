'use client'

import { useRouter } from 'next/navigation'

export default function StaffLockButton() {
  const router = useRouter()

  async function handleLock() {
    await fetch('/api/staff/auth', { method: 'DELETE' })
    router.push('/staff/login')
    router.refresh()
  }

  return (
    <button onClick={handleLock} style={{
      background: 'none',
      border: 'var(--border)',
      padding: '6px 12px',
      fontSize: 10,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      fontFamily: 'inherit',
      color: 'var(--color-text-muted)',
    }}>
      Lock
    </button>
  )
}
