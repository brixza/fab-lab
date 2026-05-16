'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Purchase, PurchaseItem } from '@/types/database'

type PurchaseWithItems = Purchase & { purchase_items: PurchaseItem[] }

export default function PurchaseList({ purchases }: { purchases: PurchaseWithItems[] }) {
  const [expanded, setExpanded] = useState(false)

  if (!purchases || purchases.length === 0) {
    return (
      <div style={{ padding: '24px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          Inga köp ännu. Din historia visas här.
        </p>
      </div>
    )
  }

  const visible = expanded ? purchases : purchases.slice(0, 1)
  const hasMore = purchases.length > 1

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {visible.map((purchase) => {
          const items = purchase.purchase_items ?? []
          const firstItem = items[0]
          const extraCount = items.length - 1
          return (
            <div key={purchase.id} style={{
              background: 'var(--color-card)',
              border: 'var(--border)',
              padding: '16px',
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
            }}>
              <div style={{
                width: 56,
                height: 68,
                flexShrink: 0,
                background: '#f0ede8',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {firstItem?.image_url && (
                  <Image
                    src={firstItem.image_url}
                    alt={firstItem.product_name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="56px"
                  />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 68 }}>
                <div>
                  {firstItem && (
                    <p className="label" style={{ margin: '0 0 2px', color: 'var(--color-text-muted)' }}>
                      {firstItem.brand}
                    </p>
                  )}
                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 14,
                    fontWeight: 400,
                    color: 'var(--color-primary)',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {firstItem ? firstItem.product_name : 'Köp'}
                    {extraCount > 0 && (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}> +{extraCount}</span>
                    )}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <p className="label" style={{ margin: 0 }}>
                    {new Date(purchase.created_at).toLocaleDateString('sv-SE')}
                  </p>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 400, color: 'var(--color-primary)', margin: '0 0 1px' }}>
                      {purchase.total_amount.toLocaleString('sv-SE')} kr
                    </p>
                    <p style={{ fontSize: 10, color: 'var(--color-points)', letterSpacing: '0.08em', margin: 0 }}>
                      +{purchase.points_awarded.toLocaleString('sv-SE')} pts
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '10px',
            background: '#fff',
            border: 'none',
            borderBottom: 'var(--border)',
            cursor: 'pointer',
          }}
          aria-label={expanded ? 'Visa färre' : 'Visa fler köp'}
        >
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-muted)"
            strokeWidth={1.5}
            style={{
              transition: 'transform 0.2s ease',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}
    </>
  )
}
