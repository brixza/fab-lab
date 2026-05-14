'use client'

import { useState, useRef, useCallback } from 'react'
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface Props {
  file: File
  aspect?: number          // e.g. 3/2 for post images, 1 for author photos
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

function centerAspectCrop(width: number, height: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height),
    width,
    height
  )
}

export default function ImageCropModal({ file, aspect, onConfirm, onCancel }: Props) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = useRef<HTMLImageElement>(null)
  const srcUrl = useRef(URL.createObjectURL(file))

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    if (aspect) {
      setCrop(centerAspectCrop(width, height, aspect))
    } else {
      setCrop({ unit: '%', x: 5, y: 5, width: 90, height: 90 })
    }
  }

  const confirm = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return

    const canvas = document.createElement('canvas')
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height

    canvas.width = completedCrop.width * scaleX
    canvas.height = completedCrop.height * scaleY

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0, 0,
      canvas.width,
      canvas.height
    )

    canvas.toBlob(blob => {
      if (blob) onConfirm(blob)
    }, 'image/jpeg', 0.92)
  }, [completedCrop, onConfirm])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24, gap: 20,
    }}>
      <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
        Crop image
      </p>

      <div style={{ maxWidth: '100%', maxHeight: '65dvh', overflow: 'auto' }}>
        <ReactCrop
          crop={crop}
          onChange={c => setCrop(c)}
          onComplete={c => setCompletedCrop(c)}
          aspect={aspect}
          style={{ maxWidth: '100%' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={srcUrl.current}
            alt="Crop preview"
            onLoad={onImageLoad}
            style={{ maxWidth: '100%', maxHeight: '65dvh', display: 'block' }}
          />
        </ReactCrop>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onCancel} style={{
          padding: '12px 24px', background: 'none',
          border: '0.5px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.6)',
          fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Cancel
        </button>
        <button onClick={confirm} disabled={!completedCrop} style={{
          padding: '12px 28px', background: '#fff', color: '#26526F',
          border: 'none', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
          cursor: completedCrop ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
          opacity: completedCrop ? 1 : 0.5,
        }}>
          Use this crop
        </button>
      </div>
    </div>
  )
}
