import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { TIER_LABELS, TIERS, TIER_THRESHOLDS, tierProgress } from '@/lib/tier'
import AvatarUpload from '@/components/AvatarUpload'
import RadarChart from '@/components/RadarChart'
import WishlistSection from '@/components/WishlistSection'
import ShareModal from '@/components/ShareModal'
import LogoutButton from '@/components/LogoutButton'
import PurchaseList from './PurchaseList'
import TierDot from './TierDot'
import type { RadarDimension } from '@/components/RadarChart'
import type { Customer, Purchase, PurchaseItem, WishlistItem, Tier } from '@/types/database'

const PROFILE: RadarDimension[] = [
  { label: 'Woody',    value: 38 },
  { label: 'Floral',   value: 68 },
  { label: 'Citrus',   value: 45 },
  { label: 'Fresh',    value: 72 },
  { label: 'Oriental', value: 58 },
  { label: 'Spicy',    value: 28 },
]

const TOP_NOTES = ['Bergamot', 'Rose', 'Yuzu', 'Black Pepper', 'Neroli', 'Saffron']

const AI_SUMMARY = `Your fragrance wardrobe tells a story of contradictions held in balance —
bright, airy openings that give way to depth and warmth. You reach for freshness and
florals in equal measure, grounded by an oriental core that keeps things from ever
feeling light. There's an adventurous edge here too: the dark brutalism of smoke and
leather sits alongside sun-drenched citrus, suggesting someone who dresses their mood
rather than a signature.`

const SUGGESTIONS = [
  { name: 'Molecule 04', brand: 'Escentric Molecules', reason: 'Effortless skin musk — bridges your fresh and floral notes' },
  { name: "Bal d'Afrique", brand: 'Byredo', reason: 'African marigold and vetiver — your woody-floral profile in one bottle' },
  { name: 'Oire', brand: 'Pigmentarium', reason: 'Since you love Brutalist, this explores the same dark territory with more warmth' },
]

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

  const [{ data: recentPurchases }, { data: wishlist }] = await Promise.all([
    supabase
      .from('purchases')
      .select('*, purchase_items(*)')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(10) as unknown as Promise<{ data: (Purchase & { purchase_items: PurchaseItem[] })[] | null }>,
    supabase
      .from('wishlists')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false }) as unknown as Promise<{ data: WishlistItem[] | null }>,
  ])

  const tier = customer.tier as Tier
  const firstName = customer.name.split(' ')[0].toUpperCase()
  const tierLadder = [...TIERS].reverse()
  const tierIndex = TIERS.indexOf(tier)

  const { pct: tierPct } = tierProgress(customer.points_balance, tier)
  const ladderIndex = TIERS.length - 1 - tierIndex
  const currentTopPct = (ladderIndex / (TIERS.length - 1)) * 100
  const nextTopPct = ladderIndex > 0 ? ((ladderIndex - 1) / (TIERS.length - 1)) * 100 : 0
  const dotTopPct = currentTopPct - (currentTopPct - nextTopPct) * (tierPct / 100)

  return (
    <div style={{ background: '#fff', minHeight: '100%' }}>

      {/* Header */}
      <div style={{
        background: '#fff',
        padding: '4px 20px 16px',
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
            <p className="label" style={{ margin: '0 0 3px', color: 'var(--color-primary)', opacity: 0.55 }}>
              Nivå {TIER_LABELS[tier]}
            </p>
            <p style={{ margin: 0, fontSize: 12, fontFamily: 'var(--font-sans)', color: 'var(--color-points)', letterSpacing: '0.06em' }}>
              {customer.points_balance.toLocaleString('sv-SE')} pts
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
        padding: '0 20px 12px',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div style={{ flex: '0 0 55%' }}>
          <Image
            src="/illustrations/spray-bottle.png"
            alt=""
            width={220}
            height={220}
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
          />
        </div>
        <div style={{ flex: '0 0 45%', display: 'flex', alignItems: 'stretch', gap: 8, height: 200 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            {tierLadder.map((t) => {
              const isReached = TIERS.indexOf(t) <= tierIndex
              return (
                <div key={t} style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-primary)', margin: 0, opacity: isReached ? 1 : 0.3 }}>
                    {TIER_LABELS[t]}
                  </p>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 400, color: 'var(--color-text-muted)', margin: 0, letterSpacing: '0.04em', opacity: isReached ? 1 : 0.4 }}>
                    {TIER_THRESHOLDS[t].toLocaleString('sv-SE')}
                  </p>
                </div>
              )
            })}
          </div>
          <div style={{ position: 'relative', width: 1, background: 'var(--color-border)' }}>
            <TierDot targetPct={dotTopPct} />
          </div>
        </div>
      </div>

      {/* Min Doftgarderob */}
      <div style={{ background: '#fff', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '4px 20px 0', overflow: 'hidden' }}>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 400, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-primary)', margin: 0, lineHeight: 1, paddingBottom: 12 }}>
          Min doftgarderob
        </h2>
        <div style={{ flexShrink: 0, marginRight: -8 }}>
          <Image src="/illustrations/bottles.png" alt="" width={150} height={83} style={{ objectFit: 'contain', display: 'block' }} />
        </div>
      </div>

      <PurchaseList purchases={recentPurchases ?? []} />

      {/* Quote */}
      <div style={{ background: '#fff' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 13, fontStyle: 'italic', color: 'var(--color-text-muted)', textAlign: 'center', padding: '22px 28px 32px', lineHeight: 1.75, margin: 0 }}>
          &ldquo;Det fina med dofter är att de talar till ditt hjärta och förhoppningsvis någon annans.&rdquo; &ndash; Elizabeth Taylor
        </p>
      </div>

      {/* ── Profile sections ── */}

      {/* Fragrance profile header */}
      <div style={{ padding: '28px 20px 20px', borderTop: 'var(--border)', borderBottom: 'var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p className="label" style={{ marginBottom: 4 }}>Based on your purchases</p>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 400, color: 'var(--color-primary)', margin: 0, letterSpacing: '0.04em' }}>
            Fragrance Profile
          </h2>
        </div>
        <ShareModal publicToken={customer.public_token} name={customer.name} />
      </div>

      {/* Radar chart */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 32px 16px', borderBottom: 'var(--border)', background: '#fff', overflow: 'visible' }}>
        <RadarChart dimensions={PROFILE} size={260} color="#26526F" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px 24px', marginTop: 8, width: '100%', maxWidth: 280 }}>
          {PROFILE.map((d) => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 20, height: 2, background: `rgba(38,82,111,${0.2 + (d.value / 100) * 0.8})`, flexShrink: 0 }} />
              <span style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Signature notes */}
      <div style={{ padding: '24px 20px', borderBottom: 'var(--border)' }}>
        <p className="label" style={{ marginBottom: 12 }}>Your signature notes</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TOP_NOTES.map((note) => (
            <span key={note} style={{ padding: '4px 10px', border: 'var(--border)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
              {note}
            </span>
          ))}
        </div>
      </div>

      {/* Scent character */}
      <div style={{ padding: '24px 20px', borderBottom: 'var(--border)', background: '#fff' }}>
        <p className="label" style={{ marginBottom: 12 }}>Your scent character</p>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 13, lineHeight: 1.8, color: 'var(--color-primary)', margin: 0, fontStyle: 'italic' }}>
          {AI_SUMMARY}
        </p>
      </div>

      {/* Wishlist */}
      <div style={{ padding: '24px 20px', borderBottom: 'var(--border)' }}>
        <WishlistSection customerId={customer.id} initialItems={wishlist ?? []} />
      </div>

      {/* Suggestions */}
      <div style={{ padding: '24px 20px', borderBottom: 'var(--border)' }}>
        <p className="label" style={{ marginBottom: 16 }}>You might also like</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {SUGGESTIONS.map((s) => (
            <div key={s.name} style={{ background: '#fff', border: 'var(--border)', padding: '16px' }}>
              <p className="label" style={{ margin: '0 0 2px', color: 'var(--color-text-muted)' }}>{s.brand}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-primary)', margin: '0 0 6px' }}>{s.name}</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6 }}>{s.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <div style={{ padding: '24px 20px' }}>
        <LogoutButton />
      </div>

    </div>
  )
}
