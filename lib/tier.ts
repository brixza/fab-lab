import type { Tier } from '@/types/database'

export const TIERS: Tier[] = ['bronze', 'silver', 'gold', 'platinum']

export const TIER_THRESHOLDS: Record<Tier, number> = {
  bronze:   1000,
  silver:   5000,
  gold:     15000,
  platinum: 25000,
}

export const TIER_COLORS: Record<Tier, string> = {
  bronze:   '#9c6d3e',
  silver:   '#5a6472',
  gold:     '#8a6d1a',
  platinum: '#6b7fa3',
}

export const TIER_LABELS: Record<Tier, string> = {
  bronze:   'Basnot',
  silver:   'Hjärtnot',
  gold:     'Toppnot',
  platinum: 'Signaturnäsa',
}

export function nextTier(tier: Tier): Tier | null {
  const idx = TIERS.indexOf(tier)
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null
}

export function tierProgress(points: number, tier: Tier): { pct: number; label: string } {
  const next = nextTier(tier)
  if (!next) return { pct: 100, label: 'Maximum tier reached' }

  const from = TIER_THRESHOLDS[tier]
  const to   = TIER_THRESHOLDS[next]
  const pct  = Math.min(((points - from) / (to - from)) * 100, 100)
  return {
    pct,
    label: `${(to - points).toLocaleString()} pts to ${TIER_LABELS[next]}`,
  }
}
