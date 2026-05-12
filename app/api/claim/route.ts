import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import type { ClaimToken, Customer, LineItem } from '@/types/database'

export async function POST(req: NextRequest) {
  const { token } = await req.json()
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const service = createServiceClient()

  const { data: claim } = await service
    .from('claim_tokens')
    .select('*')
    .eq('token', token)
    .single() as { data: ClaimToken | null }

  if (!claim) return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
  if (claim.claimed_at) return NextResponse.json({ error: 'Token already used' }, { status: 409 })
  if (new Date(claim.expires_at) < new Date()) return NextResponse.json({ error: 'Token expired' }, { status: 410 })

  const { data: customer } = await service
    .from('customers')
    .select('id, points_balance')
    .eq('user_id', user.id)
    .single() as { data: Pick<Customer, 'id' | 'points_balance'> | null }

  if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })

  const points = claim.total_amount

  const { data: purchase, error: purchaseError } = await service
    .from('purchases')
    .insert({
      customer_id: customer.id,
      source: 'zettle',
      reference_number: claim.zettle_transaction_id,
      total_amount: claim.total_amount,
      points_awarded: points,
    } as never)
    .select('id')
    .single() as { data: { id: string } | null; error: unknown }

  if (purchaseError || !purchase) return NextResponse.json({ error: 'Failed to create purchase' }, { status: 500 })

  const lineItems = claim.line_items as LineItem[]
  if (lineItems.length > 0) {
    await service.from('purchase_items').insert(
      lineItems.map(item => ({ ...item, purchase_id: purchase.id })) as never[]
    )
  }

  await service
    .from('claim_tokens')
    .update({ claimed_at: new Date().toISOString(), purchase_id: purchase.id } as never)
    .eq('id', claim.id)

  await service
    .from('customers')
    .update({ points_balance: customer.points_balance + points } as never)
    .eq('id', customer.id)

  return NextResponse.json({ ok: true, points_awarded: points })
}
