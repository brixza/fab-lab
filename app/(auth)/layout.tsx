export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <span className="label" style={{ color: 'var(--color-primary)', letterSpacing: '0.2em', fontSize: 11 }}>
            fab-lab
          </span>
          <p className="mt-1" style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
            membership
          </p>
        </div>
        {children}
      </div>
    </main>
  )
}
