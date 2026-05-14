'use client'

import { useState } from 'react'
import { track } from '@/components/Analytics'

interface Props {
  publicToken: string
  name: string
}

export default function ShareModal({ publicToken, name }: Props) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)

  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${publicToken}`

  async function copyLink() {
    await navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    track('profile_link_copied')
  }

  async function sendEmail(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)

    await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, profileUrl, name }),
    })

    setSent(true)
    setSending(false)
    track('profile_shared_by_email')
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'var(--border)',
          padding: '8px 14px',
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          fontFamily: 'inherit',
          color: 'var(--color-text-muted)',
        }}
      >
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share profile
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      background: 'rgba(0,0,0,0.4)',
    }}
      onClick={e => { if (e.target === e.currentTarget) { setOpen(false); setSent(false) } }}
    >
      <div style={{
        width: '100%', maxWidth: 480,
        background: 'var(--color-card)',
        padding: '28px 24px 40px',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 15, color: 'var(--color-primary)', margin: 0, fontWeight: 'normal' }}>
            Share your profile
          </p>
          <button onClick={() => { setOpen(false); setSent(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-muted)' }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
          Share your fragrance profile and wishlist — perfect for gift ideas.
        </p>

        {/* Copy link */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            flex: 1, padding: '10px 12px',
            border: 'var(--border)', background: 'var(--color-bg)',
            fontSize: 11, color: 'var(--color-text-muted)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {profileUrl}
          </div>
          <button onClick={copyLink} style={{
            padding: '10px 14px', background: 'var(--color-primary)', color: '#fff',
            border: 'none', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
          }}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
          <span className="label">or send by email</span>
          <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
        </div>

        {sent ? (
          <p style={{ fontSize: 13, color: 'var(--color-primary)', textAlign: 'center' }}>
            Sent — check your inbox.
          </p>
        ) : (
          <form onSubmit={sendEmail} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="email"
              placeholder="Recipient email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                padding: '12px', border: 'var(--border)',
                background: 'var(--color-bg)', fontSize: 13,
                fontFamily: 'inherit', color: 'var(--color-text)', outline: 'none',
              }}
            />
            <button type="submit" disabled={sending} style={{
              padding: '12px', background: 'var(--color-primary)', color: '#fff',
              border: 'none', fontSize: 11, letterSpacing: '0.12em',
              textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {sending ? 'Sending…' : 'Send'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
