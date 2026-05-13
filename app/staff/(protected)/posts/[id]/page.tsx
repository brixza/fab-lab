import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import PostForm from '@/components/PostForm'
import type { Post } from '@/types/database'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const service = createServiceClient()

  const { data: post } = await service
    .from('posts')
    .select('*')
    .eq('id', id)
    .single() as { data: Post | null }

  if (!post) notFound()

  return (
    <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 18, fontWeight: 'normal', color: 'var(--color-primary)', margin: 0 }}>Edit Post</h1>
        <a href="/staff" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
          Cancel
        </a>
      </div>
      <PostForm initial={post} />
    </div>
  )
}
