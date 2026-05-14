export default function NewsLoading() {
  return (
    <div style={{ paddingBottom: 32 }}>

      {/* Header */}
      <div style={{ padding: '32px 20px 20px', borderBottom: 'var(--border)' }}>
        <div className="skeleton" style={{ width: 30, height: 10, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 60, height: 22 }} />
      </div>

      {/* Post cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ background: 'var(--color-card)' }}>
            <div className="skeleton" style={{ width: '100%', paddingBottom: '56%' }} />
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="skeleton" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                <div className="skeleton" style={{ width: 80, height: 10 }} />
              </div>
              <div className="skeleton" style={{ width: '60%', height: 18 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="skeleton" style={{ width: '100%', height: 12 }} />
                <div className="skeleton" style={{ width: '90%', height: 12 }} />
                <div className="skeleton" style={{ width: '75%', height: 12 }} />
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
