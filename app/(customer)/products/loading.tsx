export default function ProductsLoading() {
  return (
    <div style={{ paddingBottom: 32 }}>

      {/* Header */}
      <div style={{ padding: '32px 20px 20px', borderBottom: 'var(--border)' }}>
        <div className="skeleton" style={{ width: 50, height: 10, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 100, height: 22 }} />
      </div>

      {/* Search + filter */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, borderBottom: 'var(--border)', background: 'var(--color-card)' }}>
        <div className="skeleton" style={{ width: '100%', height: 42 }} />
        <div className="skeleton" style={{ width: '100%', height: 38 }} />
      </div>

      {/* Count */}
      <div style={{ padding: '10px 20px', borderBottom: 'var(--border)' }}>
        <div className="skeleton" style={{ width: 70, height: 10 }} />
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--color-border)' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ background: 'var(--color-card)', display: 'flex', flexDirection: 'column' }}>
            <div className="skeleton" style={{ paddingBottom: '120%' }} />
            <div style={{ padding: '10px 12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="skeleton" style={{ width: 50, height: 9 }} />
              <div className="skeleton" style={{ width: '80%', height: 12 }} />
              <div className="skeleton" style={{ width: 40, height: 10 }} />
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
