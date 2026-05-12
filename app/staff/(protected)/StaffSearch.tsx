'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TIER_LABELS, TIER_COLORS } from '@/lib/tier'
import type { Customer, Tier } from '@/types/database'

export default function StaffSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return }

    const timeout = setTimeout(async () => {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('customers')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(8) as { data: Customer[] | null }
      setResults(data ?? [])
      setLoading(false)
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input
        type="text"
        placeholder="Search by name or email…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{
          padding: '12px',
          border: '0.5px solid var(--color-border)',
          background: 'var(--color-card)',
          fontSize: 14,
          fontFamily: 'inherit',
          color: 'var(--color-text)',
          outline: 'none',
          width: '100%',
        }}
      />

      {loading && (
        <p className="label" style={{ textAlign: 'center' }}>Searching…</p>
      )}

      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {results.map(customer => {
            const tier = customer.tier as Tier
            return (
              <div key={customer.id} style={{
                background: 'var(--color-card)',
                border: 'var(--border)',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <p style={{ fontSize: 14, color: 'var(--color-primary)', margin: '0 0 3px' }}>{customer.name}</p>
                  <p className="label" style={{ margin: 0 }}>{customer.email} · {customer.member_id}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 13, color: 'var(--color-primary)', margin: '0 0 3px' }}>
                    {customer.points_balance.toLocaleString('sv-SE')} pts
                  </p>
                  <span style={{
                    fontSize: 9,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: TIER_COLORS[tier],
                    border: `0.5px solid ${TIER_COLORS[tier]}`,
                    padding: '2px 6px',
                  }}>
                    {TIER_LABELS[tier]}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && query.trim().length >= 2 && results.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center' }}>No customers found.</p>
      )}
    </div>
  )
}
