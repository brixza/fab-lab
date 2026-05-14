import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Customer, WishlistItem } from '@/types/database'
import ProductsBrowser from './ProductsBrowser'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', user.id)
    .single() as { data: Customer | null }

  if (!customer) redirect('/dashboard')

  // Fetch all brands for the filter
  const { data: brandRows } = await supabase
    .from('products')
    .select('brand')
    .eq('active', true)
    .order('brand') as { data: { brand: string }[] | null }

  const brands = [...new Set((brandRows ?? []).map(r => r.brand).filter(Boolean))].sort()

  // Fetch customer's current wishlist SKUs
  const { data: wishlist } = await supabase
    .from('wishlists')
    .select('sku')
    .eq('customer_id', customer.id) as { data: Pick<WishlistItem, 'sku'>[] | null }

  const wishlistSkus = (wishlist ?? []).map(w => w.sku)

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ padding: '32px 20px 20px', borderBottom: 'var(--border)' }}>
        <p className="label" style={{ marginBottom: 4 }}>Explore</p>
        <h1 style={{ fontSize: 22, fontWeight: 'normal', color: 'var(--color-primary)', margin: 0 }}>
          Products
        </h1>
      </div>

      <ProductsBrowser
        customerId={customer.id}
        brands={brands}
        initialWishlistSkus={wishlistSkus}
      />
    </div>
  )
}
