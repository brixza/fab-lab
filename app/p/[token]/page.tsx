import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createServiceClient } from '@/lib/supabase/server'
import RadarChart from '@/components/RadarChart'
import { TIER_COLORS, TIER_LABELS } from '@/lib/tier'
import type { Customer, WishlistItem, Tier } from '@/types/database'
import type { RadarDimension } from '@/components/RadarChart'

// Hardcoded profile until product_notes is fully populated
const DEMO_PROFILE: RadarDimension[] = [
  { label: 'Woody',    value: 38 },
  { label: 'Floral',   value: 68 },
  { label: 'Citrus',   value: 45 },
  { label: 'Fresh',    value: 72 },
  { label: 'Oriental', value: 58 },
  { label: 'Spicy',    value: 28 },
]

export default async function PublicProfilePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const service = createServiceClient()

  const { data: customer } = await service
    .from('customers')
    .select('*')
    .eq('public_token', token)
    .single() as { data: Customer | null }

  if (!customer) notFound()

  const { data: wishlist } = await service
    .from('wishlists')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false }) as { data: WishlistItem[] | null }

  const tier = customer.tier as Tier
  const firstName = customer.name.split(' ')[0]

  return (
    <main style={{ background: 'var(--color-bg)', minHeight: '100dvh', maxWidth: 480, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ background: 'var(--color-primary)', padding: '32px 24px 28px' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '0 0 20px' }}>
          fab-lab · fragrance profile
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {customer.avatar_url ? (
            <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
              <Image src={customer.avatar_url} alt={firstName} width={52} height={52} style={{ objectFit: 'cover' }} />
            </div>
          ) : (
            <div style={{
              width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 18, color: '#fff' }}>
                {customer.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 'normal', color: '#fff', margin: '0 0 6px' }}>
              {firstName}
            </h1>
            <span style={{
              fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: TIER_COLORS[tier], border: `0.5px solid ${TIER_COLORS[tier]}`,
              padding: '3px 8px',
            }}>
              {TIER_LABELS[tier]} member
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Fragrance profile */}
        <div>
          <p className="label" style={{ marginBottom: 16 }}>Fragrance profile</p>
          <div style={{ display: 'flex', justifyContent: 'center', background: 'var(--color-card)', border: 'var(--border)', padding: '24px 0' }}>
            <RadarChart dimensions={DEMO_PROFILE} size={240} color="#2c3e50" />
          </div>
        </div>

        {/* Wishlist */}
        <div>
          <p className="label" style={{ marginBottom: 14 }}>
            {firstName}&rsquo;s wishlist
            <span style={{ color: 'var(--color-text-muted)', marginLeft: 8 }}>
              ({wishlist?.length ?? 0})
            </span>
          </p>

          {!wishlist || wishlist.length === 0 ? (
            <div style={{ padding: '24px', border: 'var(--border)', textAlign: 'center', background: 'var(--color-card)' }}>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>No items yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {wishlist.map(item => (
                <div key={item.id} style={{
                  background: 'var(--color-card)', border: 'var(--border)',
                  padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'center',
                }}>
                  <div style={{ width: 44, height: 54, flexShrink: 0, position: 'relative', background: '#f0ede8' }}>
                    {item.image_url && (
                      <Image src={item.image_url} alt={item.product_name} fill style={{ objectFit: 'cover' }} sizes="44px" />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="label" style={{ margin: '0 0 2px', color: 'var(--color-text-muted)' }}>{item.brand}</p>
                    <p style={{ fontSize: 14, color: 'var(--color-primary)', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.product_name}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>
                      {item.unit_price.toLocaleString('sv-SE')} kr
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 12, lineHeight: 1.6 }}>
            Build your own fragrance profile at Fab-lab.
          </p>
          <a href="/register" style={{
            display: 'inline-block', padding: '12px 24px',
            background: 'var(--color-primary)', color: '#fff',
            textDecoration: 'none', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            Join the membership
          </a>
        </div>

      </div>
    </main>
  )
}
