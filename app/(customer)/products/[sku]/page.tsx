import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Customer, Product, WishlistItem, ProductNoteWithNote, NoteLayer } from '@/types/database'
import WishlistToggle from './WishlistToggle'

const LAYER_LABELS: Record<NoteLayer, string> = {
  top: 'Top Notes',
  middle: 'Middle Notes',
  base: 'Base Notes',
}

export default async function ProductPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', user.id)
    .single() as { data: Customer | null }

  if (!customer) redirect('/dashboard')

  const [
    { data: product },
    { data: wishlistItem },
    { data: productNotes },
  ] = await Promise.all([
    supabase.from('products').select('*').eq('sku', sku).single() as unknown as Promise<{ data: Product | null }>,
    supabase.from('wishlists').select('id').eq('customer_id', customer.id).eq('sku', sku).single() as unknown as Promise<{ data: Pick<WishlistItem, 'id'> | null }>,
    supabase.from('product_notes').select('*, fragrance_notes(*)').eq('sku', sku).order('sort_order') as unknown as Promise<{ data: ProductNoteWithNote[] | null }>,
  ])

  if (!product) notFound()

  const notesByLayer = (productNotes ?? []).reduce<Record<NoteLayer, ProductNoteWithNote[]>>(
    (acc, n) => { acc[n.layer].push(n); return acc },
    { top: [], middle: [], base: [] }
  )
  const hasPyramid = (productNotes ?? []).length > 0

  return (
    <div style={{ paddingBottom: 40 }}>

      {/* Back */}
      <div style={{ padding: '16px 20px', borderBottom: 'var(--border)' }}>
        <Link href="/products" style={{
          fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--color-text-muted)', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Products
        </Link>
      </div>

      {/* Image */}
      <div style={{ position: 'relative', width: '100%', paddingBottom: '65%', background: '#f0ede8' }}>
        {product.image_url && (
          <Image
            src={product.image_url}
            alt={product.product_name}
            fill
            style={{ objectFit: 'cover' }}
            sizes="480px"
            priority
          />
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="label" style={{ margin: '0 0 6px', color: 'var(--color-text-muted)' }}>
              {product.brand}
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 'normal', color: 'var(--color-primary)', margin: '0 0 8px', lineHeight: 1.3 }}>
              {product.product_name}
            </h1>
            <p style={{ fontSize: 18, color: 'var(--color-primary)', margin: 0 }}>
              {product.unit_price.toLocaleString('sv-SE')} kr
            </p>
          </div>
          <WishlistToggle
            customerId={customer.id}
            product={product}
            initialWishlisted={!!wishlistItem}
          />
        </div>

        {/* Description */}
        {product.description && (
          <p style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.7, margin: 0, overflowWrap: 'break-word' }}>
            {product.description}
          </p>
        )}

        {/* Scent family */}
        {product.scent_family && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <p className="label" style={{ margin: 0, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>Scent family</p>
            <p style={{ fontSize: 12, color: 'var(--color-primary)', margin: 0 }}>{product.scent_family}</p>
          </div>
        )}

        {/* Fragrance pyramid */}
        {hasPyramid && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, borderTop: 'var(--border)', paddingTop: 20 }}>
            {(['top', 'middle', 'base'] as NoteLayer[]).map(layer => {
              const notes = notesByLayer[layer]
              if (!notes.length) return null
              return (
                <div key={layer}>
                  <p className="label" style={{ margin: '0 0 12px', color: 'var(--color-text-muted)' }}>
                    {LAYER_LABELS[layer]}
                  </p>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {notes.map(n => (
                      <div key={n.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 56 }}>
                        {n.fragrance_notes.image_url ? (
                          <div style={{ width: 56, height: 56, position: 'relative', overflow: 'hidden', background: '#f0ede8' }}>
                            <Image
                              src={n.fragrance_notes.image_url}
                              alt={n.fragrance_notes.name}
                              fill
                              style={{ objectFit: 'cover' }}
                              sizes="56px"
                            />
                          </div>
                        ) : (
                          <div style={{ width: 56, height: 56, background: '#f0ede8' }} />
                        )}
                        <span style={{ fontSize: 10, color: 'var(--color-primary)', textAlign: 'center', letterSpacing: '0.04em' }}>
                          {n.fragrance_notes.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Buy on Shopify */}
        <a
          href={`https://fab-lab.nu/products/${product.sku}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            padding: '14px',
            background: 'var(--color-primary)',
            color: '#fff',
            textDecoration: 'none',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textAlign: 'center',
            fontFamily: 'inherit',
          }}
        >
          Buy at fab-lab.nu
        </a>

      </div>
    </div>
  )
}
