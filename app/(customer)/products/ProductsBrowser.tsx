'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Product, WishlistItem } from '@/types/database'

interface Props {
  customerId: string
  brands: string[]
  initialWishlistSkus: string[]
}

export default function ProductsBrowser({ customerId, brands, initialWishlistSkus }: Props) {
  const [query, setQuery] = useState('')
  const [brand, setBrand] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [wishlistSkus, setWishlistSkus] = useState<Set<string>>(new Set(initialWishlistSkus))
  const [togglingSkus, setTogglingSkus] = useState<Set<string>>(new Set())

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    let q = supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('brand', { ascending: true })
      .order('product_name', { ascending: true })
      .limit(100)

    if (query.trim()) {
      q = q.or(`product_name.ilike.%${query}%,brand.ilike.%${query}%`)
    }
    if (brand) {
      q = q.eq('brand', brand)
    }

    const { data } = await q as { data: Product[] | null }
    setProducts(data ?? [])
    setLoading(false)
  }, [query, brand])

  useEffect(() => {
    const timeout = setTimeout(fetchProducts, query ? 250 : 0)
    return () => clearTimeout(timeout)
  }, [fetchProducts, query])

  async function toggleWishlist(product: Product) {
    if (togglingSkus.has(product.sku)) return
    setTogglingSkus(prev => new Set([...prev, product.sku]))
    const supabase = createClient()

    if (wishlistSkus.has(product.sku)) {
      await supabase.from('wishlists').delete().eq('customer_id', customerId).eq('sku', product.sku)
      setWishlistSkus(prev => { const s = new Set(prev); s.delete(product.sku); return s })
    } else {
      await supabase.from('wishlists').insert({
        customer_id: customerId,
        sku: product.sku,
        product_name: product.product_name,
        brand: product.brand,
        unit_price: product.unit_price,
        image_url: product.image_url,
      } as never)
      setWishlistSkus(prev => new Set([...prev, product.sku]))
    }
    setTogglingSkus(prev => { const s = new Set(prev); s.delete(product.sku); return s })
  }

  return (
    <div>
      {/* Search + filter */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, borderBottom: 'var(--border)', background: 'var(--color-card)' }}>
        <input
          type="text"
          placeholder="Search product or brand…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            width: '100%', padding: '11px 14px',
            border: 'var(--border)', background: 'var(--color-bg)',
            fontSize: 13, fontFamily: 'inherit', color: 'var(--color-text)', outline: 'none',
          }}
        />
        <select
          value={brand}
          onChange={e => setBrand(e.target.value)}
          style={{
            width: '100%', padding: '10px 14px',
            border: 'var(--border)', background: 'var(--color-bg)',
            fontSize: 12, fontFamily: 'inherit', color: brand ? 'var(--color-text)' : 'var(--color-text-muted)',
            outline: 'none', appearance: 'none',
          }}
        >
          <option value="">All brands</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Results count */}
      <div style={{ padding: '10px 20px', borderBottom: 'var(--border)' }}>
        <p className="label" style={{ margin: 0 }}>
          {loading ? 'Loading…' : `${products.length} product${products.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 1,
        background: 'var(--color-border)',
      }}>
        {products.map(product => {
          const wishlisted = wishlistSkus.has(product.sku)
          const toggling = togglingSkus.has(product.sku)
          return (
            <div key={product.id} style={{ background: 'var(--color-card)', display: 'flex', flexDirection: 'column' }}>
              {/* Image */}
              <div style={{ position: 'relative', paddingBottom: '120%', background: '#f0ede8' }}>
                {product.image_url && (
                  <Image
                    src={product.image_url}
                    alt={product.product_name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="50vw"
                  />
                )}
                {/* Wishlist button */}
                <button
                  onClick={() => toggleWishlist(product)}
                  disabled={toggling}
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.9)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: toggling ? 0.5 : 1,
                  }}
                >
                  <svg width={14} height={14} viewBox="0 0 24 24"
                    fill={wishlisted ? 'var(--color-primary)' : 'none'}
                    stroke="var(--color-primary)" strokeWidth={1.5}>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>

              {/* Info */}
              <div style={{ padding: '10px 12px 14px' }}>
                <p className="label" style={{ margin: '0 0 2px', color: 'var(--color-text-muted)' }}>
                  {product.brand}
                </p>
                <p style={{ fontSize: 12, color: 'var(--color-primary)', margin: '0 0 4px', lineHeight: 1.3 }}>
                  {product.product_name}
                </p>
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>
                  {product.unit_price.toLocaleString('sv-SE')} kr
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {!loading && products.length === 0 && (
        <div style={{ padding: '48px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No products found.</p>
        </div>
      )}
    </div>
  )
}
