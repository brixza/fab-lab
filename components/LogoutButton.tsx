'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button onClick={handleLogout} style={{
      background: 'none',
      border: 'var(--border)',
      padding: '12px',
      width: '100%',
      fontSize: 10,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      fontFamily: 'inherit',
      color: 'var(--color-text-muted)',
    }}>
      Sign out
    </button>
  )
}
