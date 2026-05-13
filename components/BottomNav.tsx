'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/dashboard', label: 'Home',      icon: '/icons/home.png' },
  { href: '/purchases', label: 'Purchases', icon: '/icons/purchases.png' },
  { href: '/news',      label: 'News',      icon: '/icons/news.png' },
  { href: '/profile',   label: 'Profile',   icon: '/icons/profile.png' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 480,
      background: 'var(--color-card)',
      borderTop: 'var(--border)',
      display: 'flex',
      height: 64,
      zIndex: 50,
    }}>
      {tabs.map(({ href, label, icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              textDecoration: 'none',
              color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
            }}
          >
            <Image
              src={icon}
              alt={label}
              width={22}
              height={22}
              style={{ opacity: active ? 1 : 0.4 }}
            />
            <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
