import type { Tier } from '@/types/database'

export const TIER_THRESHOLDS = { silver: 2000, gold: 8000 }

export const TIER_COLORS: Record<Tier, string> = {
  bronze: '#9c6d3e',
  silver: '#5a6472',
  gold:   '#8a6d1a',
}

export const TIER_LABELS: Record<Tier, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold:   'Gold',
}

export function tierProgress(points: number, tier: Tier): { pct: number; label: string } {
  if (tier === 'gold') return { pct: 100, label: 'Maximum tier reached' }
  if (tier === 'silver') {
    const pct = Math.min(((points - 2000) / 6000) * 100, 100)
    return { pct, label: `${(8000 - points).toLocaleString()} pts to Gold` }
  }
  const pct = Math.min((points / 2000) * 100, 100)
  return { pct, label: `${(2000 - points).toLocaleString()} pts to Silver` }
}
