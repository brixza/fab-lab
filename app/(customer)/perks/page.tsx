import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TIER_LABELS, TIERS, TIER_THRESHOLDS, tierProgress } from '@/lib/tier'
import type { Customer, Tier } from '@/types/database'

const PERKS: Record<Tier, { title: string; description: string; icon: React.ReactNode }[]> = {
  bronze: [
    { title: 'Välkomstrabatt',   description: '10% rabatt på ditt nästa köp',            icon: <IconGift /> },
    { title: 'Tidig tillgång',   description: 'Förhandsvisning av nya kollektioner',      icon: <IconStar /> },
    { title: 'Födelsedag –15%',  description: 'Exklusiv rabatt hela din födelsedag',      icon: <IconCake /> },
  ],
  silver: [
    { title: 'Gratis frakt',     description: 'Fri frakt på alla ordrar',                 icon: <IconTruck /> },
    { title: 'Doftkonsultation', description: 'Boka en privat konsultation i butiken',    icon: <IconPerson /> },
    { title: 'Exklusiva prover', description: 'Välj 3 gratisprover med varje köp',        icon: <IconBottle /> },
  ],
  gold: [
    { title: 'Evenemang',        description: 'Tillgång till privata lanseringsevenemang', icon: <IconStar /> },
    { title: 'Dubbla poäng',     description: 'Tjäna dubbla poäng fyra gånger per år',   icon: <IconDiamond /> },
    { title: 'Personlig shopper',description: 'Dedikerad rådgivare vid besök i butiken',  icon: <IconPerson /> },
  ],
  platinum: [
    { title: 'VIP-premiärer',    description: 'Exklusiv tillgång till globala evenemang', icon: <IconDiamond /> },
    { title: 'Årsgåva',          description: 'Välj en exklusiv gåva ur premiumkollektionen varje år', icon: <IconGift /> },
    { title: 'Mästarkonsultation', description: 'En-till-en session med en masterperfymör', icon: <IconBottle /> },
  ],
}

function IconGift() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
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
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
function IconTruck() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}
function IconPerson() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
function IconBottle() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6v3l2 3v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9l2-3V3z" />
      <line x1="9" y1="3" x2="15" y2="3" />
    </svg>
  )
}
function IconDiamond() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z" />
    </svg>
  )
}
function IconCake() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
      <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
      <line x1="2" y1="21" x2="22" y2="21" />
      <line x1="7" y1="11" x2="7" y2="11" />
      <line x1="12" y1="11" x2="12" y2="11" />
      <line x1="17" y1="11" x2="17" y2="11" />
      <line x1="7" y1="7" x2="7" y2="4" />
      <line x1="12" y1="7" x2="12" y2="4" />
      <line x1="17" y1="7" x2="17" y2="4" />
    </svg>
  )
}
function IconLock() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="0" ry="0" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
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
  const { pct, label: progressLabel } = tierProgress(customer.points_balance, tier)
  const nextTierKey = tierIndex < TIERS.length - 1 ? TIERS[tierIndex + 1] : null
  const pointsToNext = nextTierKey ? TIER_THRESHOLDS[nextTierKey] - customer.points_balance : 0

  return (
    <div style={{ background: '#f7f5f2', minHeight: '100%', paddingBottom: 40 }}>

      {/* Membership card */}
      <div style={{
        background: 'var(--color-primary)',
        padding: '32px 24px 28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative background ring */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 220, height: 220, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.06)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 160, height: 160, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }} />

        <p style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', margin: '0 0 10px' }}>
          Fab-lab Loyalty
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-sans)', fontSize: 32, fontWeight: 400,
              color: '#fff', margin: '0 0 2px', letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              {TIER_LABELS[tier]}
            </h1>
            <p style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '0 0 20px' }}>
              Member
            </p>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: 28, color: 'var(--color-points)',
              margin: '0 0 2px', letterSpacing: '0.02em',
            }}>
              {customer.points_balance.toLocaleString('sv-SE')}
            </p>
            <p style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              Points
            </p>
          </div>

          {/* Crown icon */}
          <div style={{ color: 'var(--color-points)', opacity: 0.8, marginTop: 4 }}>
            <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={0.8}>
              <path d="M2 20h20M4 20l2-10 6 5 6-5 2 10" />
              <circle cx="4" cy="9" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="12" cy="4" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="20" cy="9" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </div>
        </div>

        {/* Progress to next tier */}
        {nextTierKey && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <p style={{ fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', margin: 0, textTransform: 'uppercase' }}>
                {Math.round(pct)}% till {TIER_LABELS[nextTierKey]}
              </p>
              <p style={{ fontSize: 10, letterSpacing: '0.06em', color: 'var(--color-points)', margin: 0 }}>
                {pointsToNext.toLocaleString('sv-SE')} pts kvar
              </p>
            </div>
            <div style={{ height: 2, background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, height: '100%',
                width: `${pct}%`, background: 'var(--color-points)', transition: 'width 0.6s ease',
              }} />
              <div style={{
                position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                left: `${pct}%`, marginLeft: -4,
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--color-points)', border: '1.5px solid var(--color-primary)',
              }} />
            </div>
            <p style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', margin: '8px 0 0', textAlign: 'right' }}>
              Nästa nivå: {TIER_LABELS[nextTierKey]}
            </p>
          </div>
        )}
      </div>

      {/* Current tier benefits */}
      <div style={{ padding: '28px 20px 0' }}>
        <p className="label" style={{ marginBottom: 14 }}>Dina förmåner</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {PERKS[tier].map((perk) => (
            <div key={perk.title} style={{
              background: '#fff',
              border: '0.5px solid var(--color-border)',
              padding: '16px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              <div style={{ color: 'var(--color-points)' }}>{perk.icon}</div>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-primary)', margin: '0 0 4px' }}>
                  {perk.title}
                </p>
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                  {perk.description}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-points)' }}>
                <IconCheck />
                <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Aktiv</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming tiers */}
      {TIERS.filter((t, i) => i > tierIndex).map((t) => (
        <div key={t} style={{ padding: '28px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p className="label" style={{ margin: 0 }}>{TIER_LABELS[t]}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--color-text-muted)' }}>
              <IconLock />
              <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {TIER_THRESHOLDS[t].toLocaleString('sv-SE')} pts
              </span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, opacity: 0.45 }}>
            {PERKS[t].map((perk) => (
              <div key={perk.title} style={{
                background: '#fff',
                border: '0.5px solid var(--color-border)',
                padding: '16px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                <div style={{ color: 'var(--color-text-muted)' }}>{perk.icon}</div>
                <div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-primary)', margin: '0 0 4px' }}>
                    {perk.title}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                    {perk.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

    </div>
  )
}
