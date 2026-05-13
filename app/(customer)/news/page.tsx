import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { Post } from '@/types/database'

export default async function NewsPage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('published_at', { ascending: false }) as { data: Post[] | null }

  return (
    <div style={{ paddingBottom: 32 }}>

      {/* Header */}
      <div style={{ padding: '32px 20px 20px', borderBottom: 'var(--border)' }}>
        <p className="label" style={{ marginBottom: 4 }}>From the boutique</p>
        <h1 style={{ fontSize: 22, fontWeight: 'normal', color: 'var(--color-primary)', margin: 0 }}>
          News
        </h1>
      </div>

      {/* Posts */}
      {!posts || posts.length === 0 ? (
        <div style={{ padding: '48px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            No posts yet. Check back soon.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {posts.map((post, i) => (
            <article key={post.id} style={{
              borderBottom: 'var(--border)',
              background: i % 2 === 0 ? 'var(--color-card)' : 'var(--color-bg)',
            }}>

              {/* Post image */}
              {post.image_url && (
                <div style={{ position: 'relative', width: '100%', height: 220, overflow: 'hidden' }}>
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="480px"
                  />
                </div>
              )}

              <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Author + date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--color-primary)', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {post.author_image_url ? (
                      <Image
                        src={post.author_image_url}
                        alt={post.author_name}
                        width={32} height={32}
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: 12, color: '#fff' }}>
                        {post.author_name[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--color-primary)', margin: '0 0 1px' }}>
                      {post.author_name}
                    </p>
                    <p className="label" style={{ margin: 0 }}>
                      {new Date(post.published_at).toLocaleDateString('sv-SE', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Title */}
                <h2 style={{ fontSize: 17, fontWeight: 'normal', color: 'var(--color-primary)', margin: 0, lineHeight: 1.4 }}>
                  {post.title}
                </h2>

                {/* Content */}
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </p>

              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
