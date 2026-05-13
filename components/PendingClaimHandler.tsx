'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PendingClaimHandler() {
  const router = useRouter()

  useEffect(() => {
    const token = sessionStorage.getItem('pending_claim_token')
    if (!token) return

    sessionStorage.removeItem('pending_claim_token')

    fetch('/api/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).then(res => {
      if (res.ok) router.refresh()
    })
  }, [router])

  return null
}
