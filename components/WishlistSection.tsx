'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { WishlistItem, Product } from '@/types/database'
import ProductPicker from './ProductPicker'

interface Props {
  customerId: string
  initialItems: WishlistItem[]
}

export default function WishlistSection({ customerId, initialItems }: Props) {
  const [items, setItems] = useState<WishlistItem[]>(initialItems)
  const [adding, setAdding] = useState(false)

  async function addProduct(product: Product) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('wishlists')
      .insert({
        customer_id: customerId,
        sku: product.sku,
        product_name: product.product_name,
        brand: product.brand,
        unit_price: product.unit_price,
        image_url: product.image_url,
      } as never)
      .select()
      .single() as { data: WishlistItem | null; error: unknown }

    if (!error && data) {
      setItems(prev => [data, ...prev])
      setAdding(false)
    }
  }

  async function removeItem(id: string) {
    const supabase = createClient()
    await supabase.from('wishlists').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p className="label">Wishlist</p>
        <button
          onClick={() => setAdding(v => !v)}
          style={{
            background: 'none',
            border: 'var(--border)',
            padding: '4px 10px',
            fontSize: 9,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: 'inherit',
            color: 'var(--color-text-muted)',
          }}
        >
          {adding ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {adding && (
        <div style={{ marginBottom: 12 }}>
          <ProductPicker onSelect={addProduct} />
        </div>
      )}

      {items.length === 0 && !adding ? (
        <div style={{
          padding: '24px',
          border: 'var(--border)',
          textAlign: 'center',
          background: 'var(--color-card)',
        }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
            Add fragrances you'd love to try.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {items.map(item => (
            <div key={item.id} style={{
              background: 'var(--color-card)',
              border: 'var(--border)',
              padding: '12px 16px',
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}>
              <div style={{ width: 44, height: 54, flexShrink: 0, position: 'relative', background: '#f0ede8' }}>
                {item.image_url && (
                  <Image src={item.image_url} alt={item.product_name} fill style={{ objectFit: 'cover' }} sizes="44px" />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="label" style={{ margin: '0 0 2px', color: 'var(--color-text-muted)' }}>{item.brand}</p>
                <p style={{ fontSize: 13, color: 'var(--color-primary)', margin: '0 0 1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.product_name}
                </p>
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>
                  {item.unit_price.toLocaleString('sv-SE')} kr
                </p>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  color: 'var(--color-text-muted)',
                  flexShrink: 0,
                }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
