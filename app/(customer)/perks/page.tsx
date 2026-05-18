import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TIER_LABELS, TIERS, TIER_THRESHOLDS, tierProgress } from '@/lib/tier'
import type { Customer, Tier } from '@/types/database'

const PERKS: Record<Tier, { title: string; description: string }[]> = {
  bronze: [
    { title: 'Välkomstrabatt',         description: '10% rabatt på ditt nästa köp' },
    { title: 'Tidig tillgång',         description: 'Förhandsvisning av nya kollektioner' },
    { title: 'Födelsedag –15%',        description: 'Exklusiv rabatt hela din födelsedag' },
  ],
  silver: [
    { title: 'Gratis frakt',           description: 'Fri frakt på alla ordrar' },
    { title: 'Doftkonsultation',       description: 'Boka en privat konsultation i butiken' },
    { title: 'Exklusiva prover',       description: 'Välj 3 gratisprover med varje köp' },
  ],
  gold: [
    { title: 'Evenemangsinbjudningar', description: 'Tillgång till privata lanserings­evenemang' },
    { title: 'Dubbla poängdagar',      description: 'Tjäna dubbla poäng fyra gånger per år' },
    { title: 'Personlig shopper',      description: 'Dedikerad rådgivare vid besök i butiken' },
  ],
  platinum: [
    { title: 'VIP-premiärer',          description: 'Exklusiv tillgång till globala nylanserings­evenemang' },
    { title: 'Årsklubba',              description: 'Välj en exklusiv gåva ur vår premiummkollektion varje år' },
    { title: 'Privat konsultation',    description: 'En-till-en parfymkonsultation med en master­parfymör' },
  ],
}

export default async function PerksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .single() as { data: Customer | null }

  if (!customer) redirect('/dashboard')

  const tier = customer.tier as Tier
  const tierIndex = TIERS.indexOf(tier)
  const { pct, label: progressLabel } = tierProgress(customer.points_balance, tier)
  const nextTierKey = tierIndex < TIERS.length - 1 ? TIERS[tierIndex + 1] : null

  return (
    <div style={{ background: '#fff', minHeight: '100%', paddingBottom: 32 }}>

      {/* Header */}
      <div style={{ padding: '28px 20px 24px', borderBottom: 'var(--border)' }}>
        <p className="label" style={{ marginBottom: 6 }}>Dina förmåner</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 26, fontWeight: 400, color: 'var(--color-primary)', margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {TIER_LABELS[tier]}
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-points)', margin: 0, letterSpacing: '0.06em' }}>
            {customer.points_balance.toLocaleString('sv-SE')} pts
          </p>
        </div>

        {/* Progress to next tier */}
        {nextTierKey && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <p className="label" style={{ margin: 0 }}>{progressLabel}</p>
              <p className="label" style={{ margin: 0, color: 'var(--color-primary)' }}>{TIER_LABELS[nextTierKey]}</p>
            </div>
            <div style={{ height: 2, background: 'var(--color-border)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${pct}%`, background: 'var(--color-primary)', transition: 'width 0.6s ease' }} />
            </div>
          </div>
        )}
      </div>

      {/* Perk tiers */}
      {TIERS.map((t, i) => {
        const unlocked = i <= tierIndex
        const isCurrent = t === tier

        return (
          <div key={t} style={{ borderBottom: 'var(--border)', opacity: unlocked ? 1 : 0.45 }}>

            {/* Tier label row */}
            <div style={{
              padding: '16px 20px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: isCurrent ? 'var(--color-primary)' : '#fff',
            }}>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                fontWeight: 400,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: isCurrent ? '#fff' : 'var(--color-primary)',
                margin: 0,
              }}>
                {TIER_LABELS[t]}
              </p>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 10,
                color: isCurrent ? 'rgba(255,255,255,0.6)' : 'var(--color-text-muted)',
                margin: 0,
                letterSpacing: '0.06em',
              }}>
                {TIER_THRESHOLDS[t].toLocaleString('sv-SE')} pts
              </p>
            </div>

            {/* Perks list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {PERKS[t].map((perk) => (
                <div key={perk.title} style={{
                  background: '#fff',
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  borderTop: 'var(--border)',
                }}>
                  {/* Check or lock */}
                  <div style={{
                    width: 18,
                    height: 18,
                    flexShrink: 0,
                    marginTop: 1,
                    borderRadius: '50%',
                    background: unlocked ? 'var(--color-primary)' : 'transparent',
                    border: unlocked ? 'none' : 'var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {unlocked ? (
                      <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 400, color: 'var(--color-primary)', margin: '0 0 2px' }}>
                      {perk.title}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                      {perk.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )
      })}

    </div>
  )
}
