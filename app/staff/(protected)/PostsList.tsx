'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Post } from '@/types/database'

export default function PostsList({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)

  async function deletePost(id: string) {
    if (!confirm('Delete this post?')) return
    const res = await fetch(`/api/staff/posts/${id}`, { method: 'DELETE' })
    if (res.ok) setPosts(prev => prev.filter(p => p.id !== id))
  }

  if (posts.length === 0) {
    return <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>No posts yet.</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {posts.map(post => (
        <div key={post.id} style={{
          background: 'var(--color-card)', border: 'var(--border)',
          padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, color: 'var(--color-primary)', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {post.title}
            </p>
            <p className="label" style={{ margin: 0 }}>
              {post.author_name} · {new Date(post.published_at).toLocaleDateString('sv-SE')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <Link href={`/staff/posts/${post.id}`} style={{
              fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--color-text-muted)', textDecoration: 'none',
              border: 'var(--border)', padding: '4px 10px',
            }}>
              Edit
            </Link>
            <button onClick={() => deletePost(post.id)} style={{
              fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#c0392b', background: 'none', border: '0.5px solid #c0392b',
              padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
