'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import posthog from 'posthog-js'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!key) return

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com',
      capture_pageview: false, // we handle this manually below
      capture_pageleave: true,
      persistence: 'localStorage',
    })
  }, [])

  return <>{children}</>
}

export function PostHogPageview() {
  const pathname = usePathname()

  useEffect(() => {
    posthog.capture('$pageview', { $current_url: window.location.href })
  }, [pathname])

  return null
}

// Typed event helper — import this wherever you want to track an event
export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  posthog.capture(event, properties)
}
