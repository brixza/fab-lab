export default function DashboardLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '32px 20px 24px' }}>
        <div className="skeleton" style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="skeleton" style={{ width: 60, height: 10 }} />
          <div className="skeleton" style={{ width: 100, height: 22 }} />
        </div>
      </div>

      {/* Points card */}
      <div className="skeleton" style={{ margin: '0', height: 180 }} />

      {/* Recent purchases */}
      <div style={{ paddingTop: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, padding: '0 20px' }}>
          <div className="skeleton" style={{ width: 120, height: 10 }} />
          <div className="skeleton" style={{ width: 44, height: 10 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ background: 'var(--color-card)', padding: 16, display: 'flex', gap: 14 }}>
              <div className="skeleton" style={{ width: 56, height: 68, flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton" style={{ width: 60, height: 10 }} />
                <div className="skeleton" style={{ width: '70%', height: 13 }} />
                <div className="skeleton" style={{ width: 80, height: 10, marginTop: 'auto' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
