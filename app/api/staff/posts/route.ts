import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  if (cookieStore.get('staff_auth')?.value !== process.env.STAFF_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { title, content, author_name, author_image_url, image_url } = body

  if (!title?.trim() || !content?.trim() || !author_name?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data, error } = await service
    .from('posts')
    .insert({ title, content, author_name, author_image_url: author_image_url || null, image_url: image_url || null } as never)
    .select('id')
    .single() as { data: { id: string } | null; error: unknown }

  if (error || !data) return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })

  return NextResponse.json({ ok: true, id: data.id })
}
