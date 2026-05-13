import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import type { LineItem } from '@/types/database'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  if (cookieStore.get('staff_auth')?.value !== process.env.STAFF_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { line_items, total_amount, zettle_transaction_id } = await req.json() as {
    line_items: LineItem[]
    total_amount: number
    zettle_transaction_id: string
  }

  if (!line_items?.length || !total_amount) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const token = `tx_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`
  const expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString()

  const service = createServiceClient()
  const { data, error } = await service
    .from('claim_tokens')
    .insert({
      token,
      zettle_transaction_id: zettle_transaction_id || `manual_${Date.now()}`,
      expires_at,
      line_items,
      total_amount,
    } as never)
    .select('id, token')
    .single() as { data: { id: string; token: string } | null; error: unknown }

  if (error || !data) return NextResponse.json({ error: 'Failed to create token' }, { status: 500 })

  return NextResponse.json({ token: data.token, expires_at })
}
