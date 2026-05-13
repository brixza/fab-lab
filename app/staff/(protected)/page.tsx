import Link from 'next/link'
import StaffSearch from './StaffSearch'

export default function StaffPage() {
  return (
    <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-primary)', margin: '0 0 2px' }}>
            fab-lab
          </p>
          <p className="label">staff terminal</p>
        </div>
        <form action="/api/staff/auth" method="POST">
          <button
            formMethod="DELETE"
            style={{
              background: 'none',
              border: 'var(--border)',
              padding: '6px 12px',
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'inherit',
              color: 'var(--color-text-muted)',
            }}
          >
            Lock
          </button>
        </form>
      </div>

      {/* Primary actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Link href="/staff/transaction" style={{
          display: 'block', background: 'var(--color-primary)', color: '#fff',
          padding: '18px 24px', textDecoration: 'none', fontSize: 11,
          letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center',
        }}>
          New Transaction
        </Link>
        <Link href="/staff/posts" style={{
          display: 'block', background: 'none', color: 'var(--color-primary)',
          border: 'var(--border)', padding: '14px 24px', textDecoration: 'none',
          fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center',
        }}>
          New Post
        </Link>
      </div>

      {/* Customer lookup */}
      <div>
        <p className="label" style={{ marginBottom: 14 }}>Customer lookup</p>
        <StaffSearch />
      </div>

    </div>
  )
}
