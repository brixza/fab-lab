import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const cookieStore = await cookies()
  if (cookieStore.get('staff_auth')?.value !== process.env.STAFF_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { token } = await params
  const service = createServiceClient()

  const { data } = await service
    .from('claim_tokens')
    .select('claimed_at, points_awarded:total_amount')
    .eq('token', token)
    .single() as { data: { claimed_at: string | null; points_awarded: number } | null }

  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    claimed: !!data.claimed_at,
    points_awarded: data.points_awarded,
  })
}
