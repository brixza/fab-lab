'use client'

import { useEffect, useState } from 'react'

type Platform = 'ios' | 'android' | null

export default function InstallPrompt() {
  const [platform, setPlatform] = useState<Platform>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => void } | null>(null)
  const [dismissed, setDismissed] = useState(true) // start hidden, check localStorage

  useEffect(() => {
    // Don't show if already installed (running as standalone)
    if (window.matchMedia('(display-mode: standalone)').matches) return
    // Don't show if already dismissed
    if (localStorage.getItem('pwa-prompt-dismissed')) return

    const ua = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
    const isAndroid = /Android/.test(ua)

    if (isIOS) {
      setPlatform('ios')
      setDismissed(false)
    } else if (isAndroid) {
      setPlatform('android')
      // Will be shown when beforeinstallprompt fires
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as any)
      setDismissed(false)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    localStorage.setItem('pwa-prompt-dismissed', '1')
    setDismissed(true)
  }

  async function install() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    dismiss()
  }

  if (dismissed || !platform) return null
  if (platform === 'android' && !deferredPrompt) return null

  return (
    <div style={{
      position: 'fixed', bottom: 72, left: '50%', transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)', maxWidth: 448,
      background: 'var(--color-primary)', color: '#fff',
      padding: '16px 20px', zIndex: 100,
      display: 'flex', alignItems: 'flex-start', gap: 14,
      boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
    }}>
      {/* Icon */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.png" alt="Fab-lab" width={40} height={40} style={{ flexShrink: 0, borderRadius: 8 }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, color: '#fff', margin: '0 0 4px' }}>Add to Home Screen</p>
        {platform === 'ios' ? (
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.5 }}>
            Tap the <strong style={{ color: '#fff' }}>Share</strong> button below, then <strong style={{ color: '#fff' }}>Add to Home Screen</strong>
          </p>
        ) : (
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.5 }}>
            Install the Fab-lab app for a better experience
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, alignItems: 'flex-end' }}>
        {platform === 'android' && (
          <button onClick={install} style={{
            background: '#fff', color: 'var(--color-primary)',
            border: 'none', padding: '6px 14px', fontSize: 10,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Install
          </button>
        )}
        <button onClick={dismiss} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
          fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
          cursor: 'pointer', fontFamily: 'inherit', padding: 0,
        }}>
          {platform === 'ios' ? 'Dismiss' : 'Not now'}
        </button>
      </div>
    </div>
  )
}
