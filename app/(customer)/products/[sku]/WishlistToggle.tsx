'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types/database'

interface Props {
  customerId: string
  product: Product
  initialWishlisted: boolean
}

export default function WishlistToggle({ customerId, product, initialWishlisted }: Props) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [toggling, setToggling] = useState(false)

  async function toggle() {
    if (toggling) return
    setToggling(true)
    const supabase = createClient()

    if (wishlisted) {
      await supabase.from('wishlists').delete().eq('customer_id', customerId).eq('sku', product.sku)
      setWishlisted(false)
    } else {
      await supabase.from('wishlists').insert({
        customer_id: customerId,
        sku: product.sku,
        product_name: product.product_name,
        brand: product.brand,
        unit_price: product.unit_price,
        image_url: product.image_url,
      } as never)
      setWishlisted(true)
    }
    setToggling(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={toggling}
      style={{
        width: 44, height: 44, flexShrink: 0,
        border: 'var(--border)',
        background: wishlisted ? 'var(--color-primary)' : 'transparent',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: toggling ? 0.5 : 1,
        transition: 'background 0.2s',
      }}
    >
      <svg width={18} height={18} viewBox="0 0 24 24"
        fill={wishlisted ? '#fff' : 'none'}
        stroke={wishlisted ? '#fff' : 'var(--color-primary)'}
        strokeWidth={1.5}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )
}
