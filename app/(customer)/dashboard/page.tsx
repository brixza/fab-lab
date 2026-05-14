import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { TIER_COLORS, TIER_LABELS, TIERS, TIER_THRESHOLDS, tierProgress, nextTier } from '@/lib/tier'
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
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
          Setting up your membership…
        </p>
      </div>
    )
  }

  const { data: recentPurchases } = await supabase
    .from('purchases')
    .select('*, purchase_items(*)')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })
    .limit(3) as { data: (Purchase & { purchase_items: PurchaseItem[] })[] | null }

  const tier = customer.tier as Tier
  const tierColor = TIER_COLORS[tier]
  const { pct, label: progressLabel } = tierProgress(customer.points_balance, tier)
  const next = nextTier(tier)
  const firstName = customer.name.split(' ')[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '32px 20px 24px' }}>
        <AvatarUpload
          userId={user.id}
          customerId={customer.id}
          avatarUrl={customer.avatar_url}
          name={customer.name}
        />
        <div>
          <p className="label" style={{ marginBottom: 4 }}>Welcome back</p>
          <h1 style={{ fontSize: 22, fontWeight: 'normal', color: 'var(--color-primary)', margin: 0 }}>
            {firstName}
          </h1>
        </div>
      </div>

      {/* Points card */}
      <div style={{
        background: 'var(--color-primary)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        {/* Balance + current tier */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              Points balance
            </p>
            <p style={{ fontSize: 36, color: '#fff', margin: '4px 0 0', letterSpacing: '-0.01em' }}>
              {customer.points_balance.toLocaleString('sv-SE')}
            </p>
          </div>
          <div style={{
            padding: '4px 10px',
            border: `0.5px solid ${tierColor}`,
            color: tierColor,
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            {TIER_LABELS[tier]}
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', margin: 0, letterSpacing: '0.08em' }}>
              {progressLabel}
            </p>
            {next && (
              <span style={{ fontSize: 10, letterSpacing: '0.1em', color: TIER_COLORS[next], textTransform: 'uppercase' }}>
                {TIER_LABELS[next]}
              </span>
            )}
          </div>
          <div style={{ height: 2, background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, height: '100%',
              width: `${pct}%`, background: tierColor, transition: 'width 0.6s ease',
            }} />
            {next && (
              <div style={{
                position: 'absolute', top: -3, right: 0,
                width: 8, height: 8, borderRadius: '50%',
                background: TIER_COLORS[next], opacity: 0.5,
              }} />
            )}
          </div>
        </div>

        {/* Tier journey */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 4 }}>
          {TIERS.map((t, i) => {
            const isReached = TIERS.indexOf(tier) >= i
            const isCurrent = t === tier
            const color = TIER_COLORS[t]
            return (
              <div key={t} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: isCurrent ? 10 : 7,
                    height: isCurrent ? 10 : 7,
                    borderRadius: '50%',
                    background: isReached ? color : 'transparent',
                    border: `1px solid ${isReached ? color : 'rgba(255,255,255,0.2)'}`,
                    transition: 'all 0.3s',
                  }} />
                  <span style={{
                    fontSize: 8,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: isReached ? color : 'rgba(255,255,255,0.2)',
                    whiteSpace: 'nowrap',
                  }}>
                    {TIER_LABELS[t]}
                  </span>
                  {t !== 'bronze' && (
                    <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.04em' }}>
                      {TIER_THRESHOLDS[t].toLocaleString()}
                    </span>
                  )}
                </div>
                {i < TIERS.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: 1,
                    marginBottom: 28,
                    background: isReached && t !== tier ? color : 'rgba(255,255,255,0.1)',
                  }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent purchases */}
      <div style={{ paddingTop: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14, padding: '0 20px' }}>
          <p className="label">Recent purchases</p>
          <a href="/purchases" style={{ fontSize: 10, letterSpacing: '0.08em', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            View all
          </a>
        </div>

        {!recentPurchases || recentPurchases.length === 0 ? (
          <div style={{
            padding: '24px 20px',
            border: 'var(--border)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              No purchases yet. Your history will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                  {/* Image */}
                  <div style={{
                    width: 56,
                    height: 68,
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
                        sizes="56px"
                      />
                    ) : null}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 68 }}>
                    <div>
                      {firstItem && (
                        <p className="label" style={{ margin: '0 0 2px', color: 'var(--color-text-muted)' }}>
                          {firstItem.brand}
                        </p>
                      )}
                      <p style={{ fontSize: 13, color: 'var(--color-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {firstItem ? firstItem.product_name : 'Purchase'}
                        {extraCount > 0 && (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}> +{extraCount} more</span>
                        )}
                      </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <p className="label" style={{ margin: 0 }}>
                        {new Date(purchase.created_at).toLocaleDateString('sv-SE')}
                      </p>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 13, color: 'var(--color-primary)', margin: '0 0 1px' }}>
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

      {/* Member ID */}
      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', letterSpacing: '0.08em', textAlign: 'center', padding: '20px 20px 32px' }}>
        Member {customer.member_id}
      </p>

    </div>
  )
}
