'use client'

import { useState } from 'react'
import Image from 'next/image'
import QRCode from 'react-qr-code'
import ProductPicker from '@/components/ProductPicker'
import type { Product } from '@/types/database'

interface CartItem {
  product: Product
  quantity: number
}

export default function TransactionPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [claimToken, setClaimToken] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)

  const total = cart.reduce((sum, i) => sum + i.quantity * i.product.unit_price, 0)

  function addProduct(product: Product) {
    setCart(prev => {
      const existing = prev.find(i => i.product.sku === product.sku)
      if (existing) {
        return prev.map(i => i.product.sku === product.sku ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  function setQuantity(sku: string, quantity: number) {
    if (quantity < 1) {
      setCart(prev => prev.filter(i => i.product.sku !== sku))
    } else {
      setCart(prev => prev.map(i => i.product.sku === sku ? { ...i, quantity } : i))
    }
  }

  async function generateQR() {
    if (cart.length === 0) return
    setLoading(true)

    const res = await fetch('/api/staff/claim-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        line_items: cart.map(i => ({
          sku: i.product.sku,
          product_name: i.product.product_name,
          brand: i.product.brand,
          quantity: i.quantity,
          unit_price: i.product.unit_price,
          image_url: i.product.image_url,
        })),
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

  // QR display — fullscreen dark
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
        gap: 32,
        padding: 32,
        background: 'var(--color-primary)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', margin: '0 0 8px' }}>
            fab-lab
          </p>
          <p style={{ fontSize: 16, color: '#fff', margin: 0, fontWeight: 'normal' }}>
            Scan to earn your points
          </p>
        </div>

        <div style={{ background: '#fff', padding: 24 }}>
          <QRCode value={claimUrl} size={220} fgColor="#2c3e50" bgColor="#ffffff" />
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 32, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            {total.toLocaleString('sv-SE')} kr
          </p>
          <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Expires in {expiresIn} min
          </p>
        </div>

        <button
          onClick={() => { setClaimToken(null); setCart([]) }}
          style={{
            background: 'none',
            border: '0.5px solid rgba(255,255,255,0.25)',
            color: 'rgba(255,255,255,0.55)',
            padding: '10px 28px',
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

  // Product picker screen
  return (
    <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24, minHeight: '100dvh' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 18, fontWeight: 'normal', color: 'var(--color-primary)', margin: 0 }}>
          New Transaction
        </h1>
        <a href="/staff" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
          Cancel
        </a>
      </div>

      {/* Product search */}
      <div>
        <p className="label" style={{ marginBottom: 10 }}>Add products</p>
        <ProductPicker onSelect={addProduct} />
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {cart.map(({ product, quantity }) => (
            <div key={product.sku} style={{
              background: 'var(--color-card)',
              border: 'var(--border)',
              padding: '12px 16px',
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}>
              {product.image_url && (
                <div style={{ width: 40, height: 48, flexShrink: 0, position: 'relative', background: '#f0ede8' }}>
                  <Image src={product.image_url} alt={product.product_name} fill style={{ objectFit: 'cover' }} sizes="40px" />
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="label" style={{ margin: '0 0 1px', color: 'var(--color-text-muted)' }}>{product.brand}</p>
                <p style={{ fontSize: 13, color: 'var(--color-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {product.product_name}
                </p>
              </div>

              {/* Quantity stepper */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <button onClick={() => setQuantity(product.sku, quantity - 1)} style={stepperBtn}>−</button>
                <span style={{ fontSize: 14, color: 'var(--color-primary)', minWidth: 16, textAlign: 'center' }}>{quantity}</span>
                <button onClick={() => setQuantity(product.sku, quantity + 1)} style={stepperBtn}>+</button>
              </div>

              <p style={{ fontSize: 13, color: 'var(--color-primary)', flexShrink: 0, minWidth: 72, textAlign: 'right', margin: 0 }}>
                {(quantity * product.unit_price).toLocaleString('sv-SE')} kr
              </p>
            </div>
          ))}
        </div>
      )}

      {cart.length === 0 && (
        <div style={{ padding: '32px', border: 'var(--border)', textAlign: 'center', background: 'var(--color-card)' }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
            Search for a product above to add it to the transaction.
          </p>
        </div>
      )}

      {/* Total + generate */}
      <div style={{ marginTop: 'auto', borderTop: 'var(--border)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="label">Total</span>
          <span style={{ fontSize: 26, color: 'var(--color-primary)', letterSpacing: '-0.01em' }}>
            {total.toLocaleString('sv-SE')} kr
          </span>
        </div>

        <button
          onClick={generateQR}
          disabled={loading || cart.length === 0}
          style={{
            padding: '16px',
            background: cart.length > 0 ? 'var(--color-primary)' : '#ccc',
            color: '#fff',
            border: 'none',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: cart.length > 0 ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
          }}
        >
          {loading ? 'Generating…' : 'Generate QR'}
        </button>
      </div>
    </div>
  )
}

const stepperBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'none',
  border: 'var(--border)',
  cursor: 'pointer',
  fontSize: 16,
  fontFamily: 'inherit',
  color: 'var(--color-primary)',
  flexShrink: 0,
}
