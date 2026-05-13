import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RadarChart from '@/components/RadarChart'
import WishlistSection from '@/components/WishlistSection'
import ShareModal from '@/components/ShareModal'
import LogoutButton from '@/components/LogoutButton'
import type { RadarDimension } from '@/components/RadarChart'
import type { Customer, WishlistItem } from '@/types/database'

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
  { name: 'Bal d\'Afrique', brand: 'Byredo', reason: 'African marigold and vetiver — your woody-floral profile in one bottle' },
  { name: 'Oire', brand: 'Pigmentarium', reason: 'Since you love Brutalist, this explores the same dark territory with more warmth' },
]

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .single() as { data: Customer | null }

  if (!customer) redirect('/dashboard')

  const { data: wishlist } = await supabase
    .from('wishlists')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false }) as { data: WishlistItem[] | null }

  return (
    <div style={{ paddingBottom: 32 }}>

      {/* Header */}
      <div style={{ padding: '32px 20px 20px', borderBottom: 'var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p className="label" style={{ marginBottom: 4 }}>Based on your purchases</p>
          <h1 style={{ fontSize: 22, fontWeight: 'normal', color: 'var(--color-primary)', margin: 0 }}>
            Fragrance Profile
          </h1>
        </div>
        <ShareModal publicToken={customer.public_token} name={customer.name} />
      </div>

      {/* Radar chart */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px 16px', borderBottom: 'var(--border)', background: 'var(--color-card)' }}>
        <RadarChart dimensions={PROFILE} size={260} color="#2c3e50" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px 24px', marginTop: 8, width: '100%', maxWidth: 280 }}>
          {PROFILE.map((d) => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 20, height: 2, background: `rgba(44,62,80,${0.2 + (d.value / 100) * 0.8})`, flexShrink: 0 }} />
              <span style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top notes */}
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

      {/* AI summary */}
      <div style={{ padding: '24px 20px', borderBottom: 'var(--border)', background: 'var(--color-card)' }}>
        <p className="label" style={{ marginBottom: 12 }}>Your scent character</p>
        <p style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--color-primary)', margin: 0, fontStyle: 'italic' }}>
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
            <div key={s.name} style={{ background: 'var(--color-card)', border: 'var(--border)', padding: '16px' }}>
              <p className="label" style={{ margin: '0 0 2px', color: 'var(--color-text-muted)' }}>{s.brand}</p>
              <p style={{ fontSize: 14, color: 'var(--color-primary)', margin: '0 0 6px' }}>{s.name}</p>
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
