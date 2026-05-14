'use client'

import QRCode from 'react-qr-code'
import { TIER_COLORS, TIER_LABELS } from '@/lib/tier'
import type { Customer, Tier } from '@/types/database'

export default function MemberCard({ customer }: { customer: Customer }) {
  const tier = customer.tier as Tier
  const tierColor = TIER_COLORS[tier]
  const tierLabel = TIER_LABELS[tier]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>

      {/* The card */}
      <div style={{
        width: '100%',
        maxWidth: 340,
        background: 'var(--color-primary)',
        padding: '28px 24px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
      }}>

        {/* Card header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.9)',
              margin: 0,
            }}>
              fab-lab
            </p>
            <p style={{
              fontSize: 9,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
              margin: '2px 0 0',
            }}>
              membership
            </p>
          </div>
          <div style={{
            padding: '3px 8px',
            border: `0.5px solid ${tierColor}`,
            color: tierColor,
            fontSize: 9,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            {tierLabel}
          </div>
        </div>

        {/* QR code */}
        <div style={{
          background: '#fff',
          padding: 16,
          alignSelf: 'center',
          width: 160,
          height: 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <QRCode
            value={customer.member_id}
            size={128}
            fgColor="#26526F"
            bgColor="#ffffff"
            style={{ display: 'block' }}
          />
        </div>

        {/* Card footer */}
        <div>
          <p style={{
            fontSize: 16,
            color: '#fff',
            margin: '0 0 4px',
            fontWeight: 'normal',
          }}>
            {customer.name}
          </p>
          <p style={{
            fontSize: 10,
            letterSpacing: '0.15em',
            color: 'rgba(255,255,255,0.45)',
            margin: 0,
            textTransform: 'uppercase',
          }}>
            {customer.member_id}
          </p>
        </div>
      </div>

      {/* Points below card */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontSize: 32,
          color: 'var(--color-primary)',
          margin: '0 0 4px',
          letterSpacing: '-0.01em',
        }}>
          {customer.points_balance.toLocaleString('sv-SE')}
        </p>
        <p className="label">points balance</p>
      </div>

      {/* Hint */}
      <p style={{
        fontSize: 11,
        color: 'var(--color-text-muted)',
        textAlign: 'center',
        lineHeight: 1.6,
        maxWidth: 240,
        margin: 0,
      }}>
        Show this at the counter to earn points and access your membership benefits.
      </p>

    </div>
  )
}
