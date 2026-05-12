'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types/database'

interface Props {
  onSelect: (product: Product) => void
}

export default function ProductPicker({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (query.trim().length < 1) { setResults([]); setOpen(false); return }

    const timeout = setTimeout(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .or(`product_name.ilike.%${query}%,brand.ilike.%${query}%,sku.ilike.%${query}%`)
        .limit(8) as { data: Product[] | null }
      setResults(data ?? [])
      setOpen(true)
    }, 200)

    return () => clearTimeout(timeout)
  }, [query])

  function select(product: Product) {
    onSelect(product)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder="Search product name, brand or SKU…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        style={{
          width: '100%',
          padding: '12px',
          border: '0.5px solid var(--color-border)',
          background: 'var(--color-card)',
          fontSize: 14,
          fontFamily: 'inherit',
          color: 'var(--color-text)',
          outline: 'none',
        }}
      />

      {open && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--color-card)',
          border: 'var(--border)',
          borderTop: 'none',
          zIndex: 100,
          maxHeight: 320,
          overflowY: 'auto',
        }}>
          {results.map(product => (
            <button
              key={product.id}
              onClick={() => select(product)}
              style={{
                width: '100%',
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                padding: '12px',
                background: 'none',
                border: 'none',
                borderBottom: 'var(--border)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
              }}
            >
              {product.image_url ? (
                <div style={{ width: 40, height: 48, flexShrink: 0, position: 'relative', background: '#f0ede8' }}>
                  <Image src={product.image_url} alt={product.product_name} fill style={{ objectFit: 'cover' }} sizes="40px" />
                </div>
              ) : (
                <div style={{ width: 40, height: 48, flexShrink: 0, background: '#f0ede8' }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="label" style={{ margin: '0 0 2px', color: 'var(--color-text-muted)' }}>{product.brand}</p>
                <p style={{ fontSize: 13, color: 'var(--color-primary)', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.product_name}</p>
                <p className="label" style={{ margin: 0 }}>{product.sku}</p>
              </div>
              <p style={{ fontSize: 14, color: 'var(--color-primary)', flexShrink: 0, margin: 0 }}>
                {product.unit_price.toLocaleString('sv-SE')} kr
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
