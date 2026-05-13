'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import ImageCropModal from './ImageCropModal'

interface Props {
  userId: string
  customerId: string
  avatarUrl: string | null
  name: string
}

export default function AvatarUpload({ userId, customerId, avatarUrl, name }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(avatarUrl)
  const [cropFile, setCropFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [, startTransition] = useTransition()

  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCropFile(file)
    e.target.value = ''
  }

  async function handleCropConfirm(blob: Blob) {
    setCropFile(null)
    setUploading(true)

    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
    const supabase = createClient()
    const path = `${userId}/avatar`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: 'image/jpeg' })

    if (uploadError) {
      console.error(uploadError)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    const urlWithBust = `${publicUrl}?t=${Date.now()}`

    await supabase
      .from('customers')
      .update({ avatar_url: urlWithBust } as never)
      .eq('id', customerId)

    setPreview(urlWithBust)
    setUploading(false)
    startTransition(() => { window.location.reload() })
  }

  return (
    <>
      {cropFile && (
        <ImageCropModal
          file={cropFile}
          aspect={1}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropFile(null)}
        />
      )}

      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title="Change profile photo"
        style={{
          position: 'relative',
          width: 52,
          height: 52,
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: uploading ? 'wait' : 'pointer',
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '0.5px solid var(--color-border)',
          opacity: uploading ? 0.6 : 1,
        }}>
          {preview ? (
            <Image
              src={preview}
              alt={name}
              width={52}
              height={52}
              style={{ objectFit: 'cover', width: 52, height: 52 }}
              unoptimized={preview.startsWith('blob:')}
            />
          ) : (
            <span style={{ fontSize: 16, color: '#fff', letterSpacing: '0.05em', fontFamily: 'Georgia, serif' }}>
              {initials}
            </span>
          )}
        </div>

        {!uploading && (
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 16, height: 16,
            background: 'var(--color-card)', border: 'var(--border)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth={2.5}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </button>
    </>
  )
}
