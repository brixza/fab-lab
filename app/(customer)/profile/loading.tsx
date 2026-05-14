export default function ProfileLoading() {
  return (
    <div style={{ paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ padding: '32px 20px 24px', borderBottom: 'var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="skeleton" style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="skeleton" style={{ width: 50, height: 10 }} />
          <div className="skeleton" style={{ width: 120, height: 22 }} />
        </div>
      </div>

      {/* Radar chart placeholder */}
      <div style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div className="skeleton" style={{ width: 240, height: 240, borderRadius: '50%' }} />
      </div>

      {/* Notes section */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="skeleton" style={{ width: 80, height: 10 }} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[80, 60, 90, 70, 50].map((w, i) => (
            <div key={i} className="skeleton" style={{ width: w, height: 28 }} />
          ))}
        </div>
      </div>

      {/* Wishlist section */}
      <div style={{ padding: '28px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="skeleton" style={{ width: 60, height: 10 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: 'var(--color-border)' }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="skeleton" style={{ paddingBottom: '100%', background: 'var(--color-border)' }} />
          ))}
        </div>
      </div>

    </div>
  )
}
