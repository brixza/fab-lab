import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TIER_LABELS, TIERS, TIER_THRESHOLDS, tierProgress } from '@/lib/tier'
import type { Customer, Tier } from '@/types/database'

const PERKS: Record<Tier, { title: string; description: string; icon: React.ReactNode }[]> = {
  bronze: [
    { title: 'Välkomstrabatt',    description: '10% rabatt på ditt nästa köp',                          icon: <IconGift /> },
    { title: 'Tidig tillgång',    description: 'Förhandsvisning av nya kollektioner',                   icon: <IconStar /> },
    { title: 'Födelsedag –15%',   description: 'Exklusiv rabatt hela din födelsedag',                   icon: <IconCake /> },
  ],
  silver: [
    { title: 'Gratis frakt',      description: 'Fri frakt på alla ordrar',                             icon: <IconTruck /> },
    { title: 'Doftkonsultation',  description: 'Boka en privat konsultation i butiken',                icon: <IconPerson /> },
    { title: 'Exklusiva prover',  description: 'Välj 3 gratisprover med varje köp',                    icon: <IconBottle /> },
  ],
  gold: [
    { title: 'Evenemang',         description: 'Tillgång till privata lanseringsevenemang',            icon: <IconStar /> },
    { title: 'Dubbla poäng',      description: 'Tjäna dubbla poäng fyra gånger per år',               icon: <IconDiamond /> },
    { title: 'Personlig shopper', description: 'Dedikerad rådgivare vid besök i butiken',              icon: <IconPerson /> },
  ],
  platinum: [
    { title: 'VIP-premiärer',     description: 'Exklusiv tillgång till globala evenemang',             icon: <IconDiamond /> },
    { title: 'Årsgåva',           description: 'Välj en exklusiv gåva ur premiumkollektionen varje år', icon: <IconGift /> },
    { title: 'Mästarkonsultation',description: 'En-till-en session med en masterperfymör',             icon: <IconBottle /> },
  ],
}

function IconGift() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  )
}
function IconStar() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
function IconTruck() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}
function IconPerson() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
function IconBottle() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6v3l2 3v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9l2-3V3z" />
      <line x1="9" y1="3" x2="15" y2="3" />
    </svg>
  )
}
function IconDiamond() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z" />
    </svg>
  )
}
function IconCake() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
      <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
      <line x1="2" y1="21" x2="22" y2="21" />
      <line x1="7" y1="8" x2="7" y2="4" />
      <line x1="12" y1="8" x2="12" y2="4" />
      <line x1="17" y1="8" x2="17" y2="4" />
    </svg>
  )
}
function IconLock() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
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
  const { pct } = tierProgress(customer.points_balance, tier)
  const nextTierKey = tierIndex < TIERS.length - 1 ? TIERS[tierIndex + 1] : null
  const pointsToNext = nextTierKey ? TIER_THRESHOLDS[nextTierKey] - customer.points_balance : 0

  return (
    <div style={{ background: '#f7f5f2', minHeight: '100%', paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ padding: '32px 20px 24px', borderBottom: 'var(--border)' }}>
        <p className="label" style={{ marginBottom: 6 }}>Dina förmåner</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 26, fontWeight: 400, color: 'var(--color-primary)', margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {TIER_LABELS[tier]}
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-points)', margin: 0, letterSpacing: '0.06em' }}>
            {customer.points_balance.toLocaleString('sv-SE')} pts
          </p>
        </div>

        {nextTierKey && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <p className="label" style={{ margin: 0 }}>{Math.round(pct)}% till {TIER_LABELS[nextTierKey]}</p>
              <p className="label" style={{ margin: 0, color: 'var(--color-points)' }}>{pointsToNext.toLocaleString('sv-SE')} pts kvar</p>
            </div>
            <div style={{ height: 2, background: 'var(--color-border)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${pct}%`, background: 'var(--color-points)', transition: 'width 0.6s ease' }} />
            </div>
          </div>
        )}
      </div>

      {/* Tiers */}
      {TIERS.map((t, i) => {
        const unlocked = i <= tierIndex
        const isCurrent = t === tier

        return (
          <div key={t} style={{ padding: '24px 20px 0' }}>

            {/* Tier label */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isCurrent && (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-points)' }} />
                )}
                <p className="label" style={{ margin: 0, color: isCurrent ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                  {TIER_LABELS[t]}
                </p>
              </div>
              {!unlocked && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--color-text-muted)' }}>
                  <IconLock />
                  <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {TIER_THRESHOLDS[t].toLocaleString('sv-SE')} pts
                  </span>
                </div>
              )}
            </div>

            {/* Perk cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {PERKS[t].map((perk) => (
                <div key={perk.title} style={{
                  background: unlocked ? '#fff' : '#f7f5f2',
                  borderTop: isCurrent ? '1.5px solid var(--color-points)' : 'var(--border)',
                  borderRight: 'var(--border)',
                  borderBottom: 'var(--border)',
                  borderLeft: isCurrent ? '1.5px solid var(--color-points)' : 'var(--border)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  opacity: unlocked ? 1 : 0.4,
                }}>
                  {/* Icon block */}
                  <div style={{
                    width: 48,
                    height: 48,
                    flexShrink: 0,
                    background: isCurrent ? 'var(--color-primary)' : '#f0ede8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCurrent ? 'var(--color-points)' : 'var(--color-text-muted)',
                  }}>
                    {perk.icon}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 12,
                      fontWeight: 400,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--color-primary)',
                      margin: '0 0 3px',
                    }}>
                      {perk.title}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                      {perk.description}
                    </p>
                  </div>

                  {/* Status dot */}
                  {unlocked && (
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: isCurrent ? 'var(--color-points)' : 'var(--color-border)',
                    }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}

    </div>
  )
}
