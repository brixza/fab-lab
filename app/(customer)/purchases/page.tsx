import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { Purchase, PurchaseItem } from '@/types/database'

type PurchaseWithItems = Purchase & { purchase_items: PurchaseItem[] }

export default async function PurchasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', user.id)
    .single() as { data: { id: string } | null }

  if (!customer) redirect('/dashboard')

  const { data: purchases } = await supabase
    .from('purchases')
    .select('*, purchase_items(*)')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false }) as { data: PurchaseWithItems[] | null }

  const sourceLabel: Record<string, string> = {
    shopify: 'Online',
    zettle: 'In-store',
    manual: 'In-store',
  }

  return (
    <div style={{ paddingBottom: 32 }}>

      {/* Header */}
      <div style={{ padding: '32px 20px 20px', borderBottom: 'var(--border)', background: 'var(--color-bg)' }}>
        <p className="label" style={{ marginBottom: 4 }}>Your history</p>
        <h1 style={{ fontSize: 22, fontWeight: 'normal', color: 'var(--color-primary)', margin: 0 }}>
          Purchases
        </h1>
      </div>

      {/* List */}
      {!purchases || purchases.length === 0 ? (
        <div style={{ padding: '48px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No purchases yet.</p>
        </div>
      ) : (
        <div>
          {purchases.map((purchase) => {
            const items = purchase.purchase_items ?? []
            const firstItem = items[0]
            const extraCount = items.length - 1

            return (
              <div key={purchase.id} style={{
                borderBottom: 'var(--border)',
                padding: '20px',
                display: 'flex',
                gap: 16,
                background: 'var(--color-card)',
              }}>

                {/* Product image */}
                <div style={{
                  width: 72,
                  height: 88,
                  flexShrink: 0,
                  background: '#f0ede8',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {firstItem?.image_url ? (
                    <Image
                      src={firstItem.image_url}
                      alt={firstItem.product_name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="72px"
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 9, color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
                        NO IMAGE
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {firstItem && (
                      <>
                        <p className="label" style={{ margin: '0 0 3px', color: 'var(--color-text-muted)' }}>
                          {firstItem.brand}
                        </p>
                        <p style={{
                          fontSize: 14,
                          color: 'var(--color-primary)',
                          margin: '0 0 4px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {firstItem.product_name}
                        </p>
                      </>
                    )}
                    {extraCount > 0 && (
                      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '0 0 8px' }}>
                        + {extraCount} more {extraCount === 1 ? 'item' : 'items'}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <p className="label" style={{ margin: '0 0 2px' }}>
                        {new Date(purchase.created_at).toLocaleDateString('sv-SE')}
                      </p>
                      <span style={{
                        fontSize: 9,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        border: 'var(--border)',
                        color: 'var(--color-text-muted)',
                      }}>
                        {sourceLabel[purchase.source] ?? purchase.source}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 14, color: 'var(--color-primary)', margin: '0 0 2px' }}>
                        {purchase.total_amount.toLocaleString('sv-SE')} kr
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--color-points)', letterSpacing: '0.08em', margin: 0 }}>
                        +{purchase.points_awarded.toLocaleString()} pts
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
