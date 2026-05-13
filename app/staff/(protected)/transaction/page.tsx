'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'
import ProductPicker from '@/components/ProductPicker'
import type { Product } from '@/types/database'

interface CartItem {
  product: Product
  quantity: number
}

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  x: 38 + Math.sin(i * 22.5 * Math.PI / 180) * 90,
  y: 38 + Math.cos(i * 22.5 * Math.PI / 180) * 90,
  delay: `${(i * 0.06).toFixed(2)}s`,
  duration: `${(0.9 + (i % 4) * 0.2).toFixed(1)}s`,
  color: i % 3 === 0 ? '#8a6d1a' : i % 3 === 1 ? '#fff' : '#c4a35a',
  size: i % 2 === 0 ? 6 : 4,
}))

export default function TransactionPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [claimToken, setClaimToken] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [celebrated, setCelebrated] = useState(false)
  const [pointsAwarded, setPointsAwarded] = useState(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = cart.reduce((sum, i) => sum + i.quantity * i.product.unit_price, 0)

  // Poll for claim status while QR is displayed
  useEffect(() => {
    if (!claimToken || celebrated) return

    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/staff/claim-token/${claimToken}`)
      if (!res.ok) return
      const data = await res.json()
      if (data.claimed) {
        clearInterval(pollRef.current!)
        setPointsAwarded(data.points_awarded)
        setCelebrated(true)
        setTimeout(() => router.push('/staff'), 3600)
      }
    }, 2000)

    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [claimToken, celebrated, router])

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

  // QR display + celebration — fullscreen dark
  if (claimToken && claimUrl) {
    const expiresIn = expiresAt
      ? Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / 60000))
      : 15

    if (celebrated) {
      return (
        <div className="celebrate-exit" style={{
          minHeight: '100dvh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'var(--color-primary)', position: 'relative', overflow: 'hidden',
        }}>
          {/* Expanding rings */}
          {[0, 0.3, 0.6].map((delay, i) => (
            <div key={i} className="celebrate-ring" style={{
              position: 'absolute',
              width: 120, height: 120, borderRadius: '50%',
              border: '1px solid rgba(138,109,26,0.6)',
              animationDelay: `${delay}s`,
            }} />
          ))}

          {/* Particles */}
          {PARTICLES.map(p => (
            <div key={p.id} className="celebrate-particle" style={{
              position: 'absolute',
              left: `calc(50% + ${p.x - 38}px)`,
              top: `calc(50% + ${p.y - 38}px)`,
              width: p.size, height: p.size,
              borderRadius: '50%',
              background: p.color,
              '--delay': p.delay,
              '--duration': p.duration,
            } as React.CSSProperties} />
          ))}

          {/* Checkmark */}
          <div className="celebrate-check" style={{
            width: 80, height: 80, borderRadius: '50%',
            border: '1.5px solid rgba(255,255,255,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24, position: 'relative', zIndex: 1,
          }}>
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5} strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* Points */}
          <div className="celebrate-points" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: 42, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              +{pointsAwarded.toLocaleString('sv-SE')}
            </p>
            <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              points earned
            </p>
          </div>
        </div>
      )
    }

    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 32, padding: 32, background: 'var(--color-primary)',
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
            background: 'none', border: '0.5px solid rgba(255,255,255,0.25)',
            color: 'rgba(255,255,255,0.55)', padding: '10px 28px',
            fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
            cursor: 'pointer', fontFamily: 'inherit',
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
