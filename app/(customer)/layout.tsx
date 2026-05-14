import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/BottomNav'
import PendingClaimHandler from '@/components/PendingClaimHandler'
import InstallPrompt from '@/components/InstallPrompt'

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      <PendingClaimHandler />
      <InstallPrompt />
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 72 }}>
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
