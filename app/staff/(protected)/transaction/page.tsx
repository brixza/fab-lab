'use client'

import { useState } from 'react'
import QRCode from 'react-qr-code'

interface LineItem {
  product_name: string
  brand: string
  sku: string
  quantity: number
  unit_price: number
}

const emptyItem = (): LineItem => ({
  product_name: '',
  brand: '',
  sku: '',
  quantity: 1,
  unit_price: 0,
})

export default function TransactionPage() {
  const [items, setItems] = useState<LineItem[]>([emptyItem()])
  const [loading, setLoading] = useState(false)
  const [claimToken, setClaimToken] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)

  const total = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ))
  }

  function addItem() { setItems(prev => [...prev, emptyItem()]) }

  function removeItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  async function generateQR() {
    if (!items.some(i => i.product_name && i.unit_price > 0)) return
    setLoading(true)

    const res = await fetch('/api/staff/claim-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        line_items: items.filter(i => i.product_name),
        total_amount: total,
        zettle_transaction_id: '',
      }),
    })

    const data = await res.json()
    if (res.ok) {
      setClaimToken(data.token)
      setExpiresAt(data.expires_at)
    }
    setLoading(false)
  }

  const claimUrl = claimToken
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/claim?token=${claimToken}`
    : null

  // QR display screen
  if (claimToken && claimUrl) {
    const expiresIn = expiresAt
      ? Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / 60000))
      : 15

    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: 32,
        background: 'var(--color-primary)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', margin: '0 0 6px' }}>
            fab-lab
          </p>
          <p style={{ fontSize: 15, color: '#fff', margin: 0, fontWeight: 'normal' }}>
            Scan to earn your points
          </p>
        </div>

        <div style={{ background: '#fff', padding: 24 }}>
          <QRCode value={claimUrl} size={220} fgColor="#2c3e50" bgColor="#ffffff" />
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 28, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            {total.toLocaleString('sv-SE')} kr
          </p>
          <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
            Expires in {expiresIn} min
          </p>
        </div>

        <button
          onClick={() => { setClaimToken(null); setItems([emptyItem()]) }}
          style={{
            background: 'none',
            border: '0.5px solid rgba(255,255,255,0.3)',
            color: 'rgba(255,255,255,0.6)',
            padding: '10px 24px',
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          New Transaction
        </button>
      </div>
    )
  }

  // Product entry screen
  return (
    <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 18, fontWeight: 'normal', color: 'var(--color-primary)', margin: 0 }}>
          New Transaction
        </h1>
        <a href="/staff" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
          Cancel
        </a>
      </div>

      {/* Line items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item, index) => (
          <div key={index} style={{
            background: 'var(--color-card)',
            border: 'var(--border)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="label">Item {index + 1}</span>
              {items.length > 1 && (
                <button onClick={() => removeItem(index)} style={ghostButtonStyle}>Remove</button>
              )}
            </div>

            <input
              placeholder="Product name"
              value={item.product_name}
              onChange={e => updateItem(index, 'product_name', e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Brand"
              value={item.brand}
              onChange={e => updateItem(index, 'brand', e.target.value)}
              style={inputStyle}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <input
                placeholder="SKU"
                value={item.sku}
                onChange={e => updateItem(index, 'sku', e.target.value)}
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="Qty"
                min={1}
                value={item.quantity}
                onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="Price (kr)"
                min={0}
                value={item.unit_price || ''}
                onChange={e => updateItem(index, 'unit_price', parseInt(e.target.value) || 0)}
                style={inputStyle}
              />
            </div>
          </div>
        ))}
      </div>

      <button onClick={addItem} style={ghostButtonStyle}>+ Add item</button>

      {/* Total + generate */}
      <div style={{ borderTop: 'var(--border)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="label">Total</span>
          <span style={{ fontSize: 22, color: 'var(--color-primary)' }}>
            {total.toLocaleString('sv-SE')} kr
          </span>
        </div>

        <button
          onClick={generateQR}
          disabled={loading || total === 0}
          style={{
            padding: '16px',
            background: total > 0 ? 'var(--color-primary)' : '#ccc',
            color: '#fff',
            border: 'none',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: total > 0 ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
          }}
        >
          {loading ? 'Generating…' : 'Generate QR'}
        </button>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '0.5px solid var(--color-border)',
  background: 'var(--color-bg)',
  fontSize: 13,
  fontFamily: 'inherit',
  color: 'var(--color-text)',
  outline: 'none',
  width: '100%',
}

const ghostButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'var(--border)',
  padding: '8px 16px',
  fontSize: 10,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  fontFamily: 'inherit',
  color: 'var(--color-text-muted)',
  alignSelf: 'flex-start',
}
