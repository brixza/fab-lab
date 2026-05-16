import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { TIER_LABELS, TIERS, TIER_THRESHOLDS } from '@/lib/tier'
import AvatarUpload from '@/components/AvatarUpload'
import type { Customer, Purchase, PurchaseItem, Tier } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .single() as { data: Customer | null }

  if (!customer) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p className="label">Setting up your membership…</p>
      </div>
    )
  }

  const { data: recentPurchases } = await supabase
    .from('purchases')
    .select('*, purchase_items(*)')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })
    .limit(1) as { data: (Purchase & { purchase_items: PurchaseItem[] })[] | null }

  const tier = customer.tier as Tier
  const firstName = customer.name.split(' ')[0].toUpperCase()
  const tierLadder = [...TIERS].reverse()
  const tierIndex = TIERS.indexOf(tier)

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100%' }}>

      {/* Header */}
      <div style={{
        background: '#fff',
        padding: '28px 20px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <AvatarUpload
            userId={user.id}
            customerId={customer.id}
            avatarUrl={customer.avatar_url}
            name={customer.name}
          />
          <div>
            <h1 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--color-primary)',
              margin: '0 0 3px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              {firstName}
            </h1>
            <p className="label" style={{ margin: 0, color: 'var(--color-primary)', opacity: 0.55 }}>
              Nivå {TIER_LABELS[tier]}
            </p>
          </div>
        </div>
        <Image
          src="/fablab-raster.png"
          alt="Fab-lab"
          width={115}
          height={115}
          style={{ objectFit: 'contain' }}
        />
      </div>

      {/* Tier visualization — no gap/divider from header */}
      <div style={{
        background: '#fff',
        padding: '20px 20px 12px',
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* Spray bottle illustration */}
        <div style={{ flex: '0 0 55%' }}>
          <Image
            src="/illustrations/spray-bottle.png"
            alt=""
            width={220}
            height={220}
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
          />
        </div>

        {/* Tier ladder */}
        <div style={{
          flex: '0 0 45%',
          display: 'flex',
          alignItems: 'stretch',
          gap: 8,
          height: 200,
        }}>
          {/* Labels column */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}>
            {tierLadder.map((t) => {
              const isReached = TIERS.indexOf(t) <= tierIndex
              return (
                <div key={t} style={{ textAlign: 'right' }}>
                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 14,
                    fontWeight: 400,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-primary)',
                    margin: 0,
                    opacity: isReached ? 1 : 0.3,
                  }}>
                    {TIER_LABELS[t]}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 11,
                    fontWeight: 400,
                    color: 'var(--color-text-muted)',
                    margin: 0,
                    letterSpacing: '0.04em',
                    opacity: isReached ? 1 : 0.4,
                  }}>
                    {TIER_THRESHOLDS[t].toLocaleString('sv-SE')}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Vertical line + dot */}
          <div style={{ position: 'relative', width: 1, background: 'var(--color-border)' }}>
            {tierLadder.map((t, i) => {
              const isCurrent = t === tier
              if (!isCurrent) return null
              const topPct = (i / (tierLadder.length - 1)) * 100
              return (
                <div key={t} style={{
                  position: 'absolute',
                  right: -5,
                  top: `${topPct}%`,
                  transform: 'translateY(-50%)',
                  width: 11,
                  height: 11,
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                }} />
              )
            })}
          </div>
        </div>
      </div>

      {/* Min Doftgarderob header */}
      <div style={{
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 20px 12px',
        overflow: 'hidden',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-primary)',
          margin: 0,
        }}>
          Min doftgarderob
        </h2>
        <div style={{ flexShrink: 0, marginRight: -8, marginLeft: -16 }}>
          <Image
            src="/illustrations/bottles.png"
            alt=""
            width={170}
            height={94}
            style={{ objectFit: 'contain', display: 'block' }}
          />
        </div>
      </div>

      {/* Purchase list — single item */}
      {!recentPurchases || recentPurchases.length === 0 ? (
        <div style={{ padding: '24px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            Inga köp ännu. Din historia visas här.
          </p>
        </div>
      ) : (
        <>
          {recentPurchases.map((purchase) => {
            const items = purchase.purchase_items ?? []
            const firstItem = items[0]
            const extraCount = items.length - 1
            return (
              <div key={purchase.id} style={{
                background: 'var(--color-card)',
                border: 'var(--border)',
                padding: '16px',
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 56,
                  height: 68,
                  flexShrink: 0,
                  background: '#f0ede8',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {firstItem?.image_url && (
                    <Image
                      src={firstItem.image_url}
                      alt={firstItem.product_name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="56px"
                    />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 68 }}>
                  <div>
                    {firstItem && (
                      <p className="label" style={{ margin: '0 0 2px', color: 'var(--color-text-muted)' }}>
                        {firstItem.brand}
                      </p>
                    )}
                    <p style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 14,
                      fontWeight: 400,
                      color: 'var(--color-primary)',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {firstItem ? firstItem.product_name : 'Köp'}
                      {extraCount > 0 && (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}> +{extraCount}</span>
                      )}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <p className="label" style={{ margin: 0 }}>
                      {new Date(purchase.created_at).toLocaleDateString('sv-SE')}
                    </p>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 400, color: 'var(--color-primary)', margin: '0 0 1px' }}>
                        {purchase.total_amount.toLocaleString('sv-SE')} kr
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--color-points)', letterSpacing: '0.08em', margin: 0 }}>
                        +{purchase.points_awarded.toLocaleString('sv-SE')} pts
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <a href="/purchases" style={{
            display: 'block',
            textAlign: 'center',
            padding: '12px 20px',
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            textDecoration: 'none',
            background: 'var(--color-card)',
            borderTop: 'none',
          }}>
            Se alla köp →
          </a>
        </>
      )}

      {/* Footer quote */}
      <div style={{ background: '#fff', marginTop: 24 }}>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 13,
          fontStyle: 'italic',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
          padding: '32px 28px 48px',
          lineHeight: 1.75,
          margin: 0,
        }}>
          &ldquo;Det fina med dofter är att de talar till ditt hjärta och förhoppningsvis någon annans.&rdquo; &ndash; Elizabeth Taylor
        </p>
      </div>

    </div>
  )
}
