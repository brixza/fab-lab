import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { TIER_LABELS, TIERS, TIER_THRESHOLDS } from '@/lib/tier'
import AvatarUpload from '@/components/AvatarUpload'
import PurchaseList from './PurchaseList'
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
    .limit(10) as { data: (Purchase & { purchase_items: PurchaseItem[] })[] | null }

  const tier = customer.tier as Tier
  const firstName = customer.name.split(' ')[0].toUpperCase()
  const tierLadder = [...TIERS].reverse()
  const tierIndex = TIERS.indexOf(tier)

  return (
    <div style={{ background: '#fff', minHeight: '100%' }}>

      {/* Header */}
      <div style={{
        background: '#fff',
        padding: '14px 20px 16px',
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
            size={68}
          />
          <div>
            <h1 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 22,
              fontWeight: 400,
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
          width={138}
          height={138}
          style={{ objectFit: 'contain' }}
        />
      </div>

      {/* Tier visualization */}
      <div style={{
        background: '#fff',
        padding: '3px 20px 12px',
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
              if (t !== tier) return null
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
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: '4px 20px 0',
        overflow: 'hidden',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 18,
          fontWeight: 400,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--color-primary)',
          margin: '0 0 0',
          lineHeight: 1,
          paddingBottom: 12,
        }}>
          Min doftgarderob
        </h2>
        <div style={{ flexShrink: 0, marginRight: -8 }}>
          <Image
            src="/illustrations/bottles.png"
            alt=""
            width={150}
            height={83}
            style={{ objectFit: 'contain', display: 'block' }}
          />
        </div>
      </div>

      {/* Purchase list with inline expand */}
      <PurchaseList purchases={recentPurchases ?? []} />

      {/* Footer quote */}
      <div style={{ background: '#fff' }}>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 13,
          fontStyle: 'italic',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
          padding: '27px 28px 48px',
          lineHeight: 1.75,
          margin: 0,
        }}>
          &ldquo;Det fina med dofter är att de talar till ditt hjärta och förhoppningsvis någon annans.&rdquo; &ndash; Elizabeth Taylor
        </p>
      </div>

    </div>
  )
}
