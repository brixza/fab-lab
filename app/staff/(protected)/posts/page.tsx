import PostForm from '@/components/PostForm'

export default function NewPostPage() {
  return (
    <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 18, fontWeight: 'normal', color: 'var(--color-primary)', margin: 0 }}>New Post</h1>
        <a href="/staff" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
          Cancel
        </a>
      </div>
      <PostForm />
    </div>
  )
}
