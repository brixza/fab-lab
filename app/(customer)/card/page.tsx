import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MemberCard from './MemberCard'
import type { Customer } from '@/types/database'

export default async function CardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .single() as { data: Customer | null }

  if (!customer) redirect('/dashboard')

  return (
    <div>
      <div style={{ padding: '32px 20px 20px', borderBottom: 'var(--border)' }}>
        <p className="label" style={{ marginBottom: 4 }}>Your membership</p>
        <h1 style={{ fontSize: 22, fontWeight: 'normal', color: 'var(--color-primary)', margin: 0 }}>
          Member Card
        </h1>
      </div>

      <div style={{ padding: '40px 20px' }}>
        <MemberCard customer={customer} />
      </div>
    </div>
  )
}
