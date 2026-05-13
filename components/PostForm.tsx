'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { staffUpload } from '@/lib/staff-upload'
import ImageCropModal from './ImageCropModal'
import type { Post } from '@/types/database'

interface Props {
  initial?: Post
}

export default function PostForm({ initial }: Props) {
  const router = useRouter()
  const isEdit = !!initial

  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [authorName, setAuthorName] = useState(initial?.author_name ?? '')
  const [authorImageUrl, setAuthorImageUrl] = useState<string | null>(initial?.author_image_url ?? null)
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.image_url ?? null)
  const [uploadingAuthor, setUploadingAuthor] = useState(false)
  const [uploadingPost, setUploadingPost] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  // Crop modal state
  const [cropFile, setCropFile] = useState<File | null>(null)
  const [cropTarget, setCropTarget] = useState<'author' | 'post' | null>(null)

  const authorInputRef = useRef<HTMLInputElement>(null)
  const postInputRef = useRef<HTMLInputElement>(null)

  function handleAuthorImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCropFile(file)
    setCropTarget('author')
    e.target.value = ''
  }

  function handlePostImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCropFile(file)
    setCropTarget('post')
    e.target.value = ''
  }

  async function handleCropConfirm(blob: Blob) {
    const file = new File([blob], `${cropTarget}_${Date.now()}.jpg`, { type: 'image/jpeg' })
    setCropFile(null)

    if (cropTarget === 'author') {
      setUploadingAuthor(true)
      const url = await staffUpload(file, 'post-images', `authors/${Date.now()}.jpg`)
      setAuthorImageUrl(url)
      setUploadingAuthor(false)
    } else {
      setUploadingPost(true)
      const url = await staffUpload(file, 'post-images', `posts/${Date.now()}.jpg`)
      setImageUrl(url)
      setUploadingPost(false)
    }
    setCropTarget(null)
  }

  function handleCropCancel() {
    setCropFile(null)
    setCropTarget(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !authorName.trim()) return
    setSaving(true)

    const body = { title, content, author_name: authorName, author_image_url: authorImageUrl, image_url: imageUrl }

    const res = isEdit
      ? await fetch(`/api/staff/posts/${initial!.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch('/api/staff/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

    if (res.ok) setDone(true)
    setSaving(false)
  }

  if (done) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <p style={{ fontSize: 15, color: 'var(--color-primary)', margin: 0 }}>
          {isEdit ? 'Post updated' : 'Post published'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          {!isEdit && (
            <button onClick={() => { setTitle(''); setContent(''); setAuthorImageUrl(null); setImageUrl(null); setDone(false) }} style={ghostBtn}>
              Write another
            </button>
          )}
          <button onClick={() => router.push('/staff')} style={ghostBtn}>
            Back to staff
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
    {cropFile && cropTarget && (
      <ImageCropModal
        file={cropFile}
        aspect={cropTarget === 'author' ? 1 : 3 / 2}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
      />
    )}
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Author */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p className="label">Author</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={() => authorInputRef.current?.click()} style={{
            width: 48, height: 48, borderRadius: '50%', border: 'var(--border)',
            background: 'var(--color-bg)', overflow: 'hidden', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0,
          }}>
            {authorImageUrl ? (
              <Image src={authorImageUrl} alt="Author" width={48} height={48} style={{ objectFit: 'cover', width: 48, height: 48 }} />
            ) : (
              <span style={{ fontSize: 9, color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}>
                {uploadingAuthor ? '…' : 'PHOTO'}
              </span>
            )}
          </button>
          <input placeholder="Author name" value={authorName} onChange={e => setAuthorName(e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
        </div>
        <input ref={authorInputRef} type="file" accept="image/*" onChange={handleAuthorImageSelect} style={{ display: 'none' }} />
      </div>

      {/* Title */}
      <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span className="label">Title</span>
        <input placeholder="Post title" value={title} onChange={e => setTitle(e.target.value)} required style={inputStyle} />
      </label>

      {/* Content */}
      <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span className="label">Content</span>
        <textarea placeholder="Write your post…" value={content} onChange={e => setContent(e.target.value)} required rows={8} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} />
      </label>

      {/* Post image */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p className="label">Image (optional)</p>
        {imageUrl ? (
          <div style={{ position: 'relative', width: '100%', height: 180 }}>
            <Image src={imageUrl} alt="Post image" fill style={{ objectFit: 'cover' }} sizes="480px" />
            <button type="button" onClick={() => setImageUrl(null)} style={{
              position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)',
              border: 'none', color: '#fff', width: 28, height: 28, cursor: 'pointer',
              borderRadius: '50%', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>×</button>
          </div>
        ) : (
          <button type="button" onClick={() => postInputRef.current?.click()} style={{ ...ghostBtn, width: '100%', padding: '20px', textAlign: 'center', background: 'var(--color-card)' }}>
            {uploadingPost ? 'Uploading…' : '+ Add image'}
          </button>
        )}
        <input ref={postInputRef} type="file" accept="image/*" onChange={handlePostImageSelect} style={{ display: 'none' }} />
      </div>

      <button type="submit" disabled={saving || !title.trim() || !content.trim() || !authorName.trim()} style={{
        padding: '16px', background: title && content && authorName ? 'var(--color-primary)' : '#ccc',
        color: '#fff', border: 'none', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
        cursor: title && content && authorName ? 'pointer' : 'not-allowed', fontFamily: 'inherit', marginTop: 8,
      }}>
        {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Publish Post'}
      </button>
    </form>
    </>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '12px', border: '0.5px solid var(--color-border)', background: 'var(--color-card)',
  fontSize: 14, fontFamily: 'inherit', color: 'var(--color-text)', outline: 'none', width: '100%',
}

const ghostBtn: React.CSSProperties = {
  background: 'none', border: 'var(--border)', padding: '8px 16px', fontSize: 10,
  letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--color-text-muted)',
}
