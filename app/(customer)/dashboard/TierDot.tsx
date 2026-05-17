'use client'

import { useEffect, useState } from 'react'

export default function TierDot({ targetPct }: { targetPct: number }) {
  const [topPct, setTopPct] = useState(100)

  useEffect(() => {
    const id = requestAnimationFrame(() => setTopPct(targetPct))
    return () => cancelAnimationFrame(id)
  }, [targetPct])

  return (
    <div style={{
      position: 'absolute',
      right: -5,
      top: `${topPct}%`,
      transform: 'translateY(-50%)',
      width: 11,
      height: 11,
      borderRadius: '50%',
      background: 'var(--color-primary)',
      transition: 'top 1.2s cubic-bezier(0.25, 1, 0.5, 1)',
    }} />
  )
}
