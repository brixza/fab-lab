import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

async function verifyStaff() {
  const cookieStore = await cookies()
  return cookieStore.get('staff_auth')?.value === process.env.STAFF_SECRET
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verifyStaff()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { title, content, author_name, author_image_url, image_url } = body

  const service = createServiceClient()
  const { error } = await service
    .from('posts')
    .update({ title, content, author_name, author_image_url, image_url } as never)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verifyStaff()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const service = createServiceClient()
  const { error } = await service.from('posts').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
