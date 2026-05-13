import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  if (cookieStore.get('staff_auth')?.value !== process.env.STAFF_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File
  const bucket = (formData.get('bucket') as string) || 'post-images'
  const path = formData.get('path') as string

  if (!file || !path) {
    return NextResponse.json({ error: 'Missing file or path' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const service = createServiceClient()

  const { error } = await service.storage
    .from(bucket)
    .upload(path, buffer, { upsert: true, contentType: file.type })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = service.storage.from(bucket).getPublicUrl(path)

  return NextResponse.json({ url: publicUrl })
}
