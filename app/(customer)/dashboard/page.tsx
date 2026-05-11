import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TIER_COLORS, TIER_LABELS, tierProgress } from '@/lib/tier'
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
    .limit(2) as { data: (Purchase & { purchase_items: PurchaseItem[] })[] | null }

  const tier = customer.tier as Tier
  const tierColor = TIER_COLORS[tier]
  const tierLabel = TIER_LABELS[tier]
  const { pct, label: progressLabel } = tierProgress(customer.points_balance, tier)
  const firstName = customer.name.split(' ')[0]

  return (
    <div style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div>
        <p className="label" style={{ marginBottom: 4 }}>Welcome back</p>
        <h1 style={{ fontSize: 22, fontWeight: 'normal', color: 'var(--color-primary)', margin: 0 }}>
          {firstName}
        </h1>
      </div>

      {/* Points card */}
      <div style={{
        background: 'var(--color-primary)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
              Points balance
            </p>
            <p style={{ fontSize: 36, color: '#fff', margin: '4px 0 0', letterSpacing: '-0.01em' }}>
              {customer.points_balance.toLocaleString()}
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
            {tierLabel}
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div style={{
            height: 1,
            background: 'rgba(255,255,255,0.15)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${pct}%`,
              background: tierColor,
              transition: 'width 0.6s ease',
            }} />
          </div>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 8, letterSpacing: '0.08em' }}>
            {progressLabel}
          </p>
        </div>
      </div>

      {/* Recent purchases */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <p className="label">Recent purchases</p>
          <a href="/purchases" style={{ fontSize: 10, letterSpacing: '0.08em', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            View all
          </a>
        </div>

        {!recentPurchases || recentPurchases.length === 0 ? (
          <div style={{
            padding: '24px',
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
              return (
                <div key={purchase.id} style={{
                  background: 'var(--color-card)',
                  border: 'var(--border)',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: 'var(--color-primary)', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {firstItem ? firstItem.product_name : 'Purchase'}
                      {items.length > 1 && (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}> +{items.length - 1} more</span>
                      )}
                    </p>
                    <p className="label" style={{ margin: 0 }}>
                      {new Date(purchase.created_at).toLocaleDateString('sv-SE')} · {purchase.source}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 13, color: 'var(--color-primary)', margin: '0 0 2px' }}>
                      {purchase.total_amount.toLocaleString()} kr
                    </p>
                    <p style={{ fontSize: 10, color: 'var(--color-points)', letterSpacing: '0.08em' }}>
                      +{purchase.points_awarded} pts
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Member ID */}
      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', letterSpacing: '0.08em', textAlign: 'center' }}>
        Member {customer.member_id}
      </p>

    </div>
  )
}
