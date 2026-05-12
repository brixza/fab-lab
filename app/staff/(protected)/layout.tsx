import { redirect } from 'next/navigation'
import { isStaffAuthed } from '@/lib/staff-auth'

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const authed = await isStaffAuthed()
  if (!authed) redirect('/staff/login')

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)', maxWidth: 768, margin: '0 auto' }}>
      {children}
    </div>
  )
}
