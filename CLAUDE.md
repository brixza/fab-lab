@AGENTS.md

# Fab-lab Loyalty PWA — Project Context

## What this is
A customer-facing loyalty/membership PWA for Fab-lab (fab-lab.nu), a Stockholm luxury perfume boutique. Built with Next.js 16 App Router, Supabase, and deployed on Vercel.

## Tech stack
- **Framework:** Next.js 16 App Router (`proxy.ts` replaces `middleware.ts` — Next.js 16 breaking change)
- **Database/Auth:** Supabase (Postgres + RLS + Storage)
- **Deployment:** Vercel (`fab-lab-seven.vercel.app`)
- **Email:** Resend (key in env, email confirmation disabled for now)
- **Analytics:** Vercel Analytics (active)
- **Language:** TypeScript throughout

## Design system — follow strictly
- **Brand color:** `#26526F` (dark navy) — `var(--color-primary)`
- **Background:** `#f7f5f2` — `var(--color-bg)`
- **Card background:** `#ffffff` — `var(--color-card)`
- **Border:** `0.5px solid #e0ddd8` — `var(--border)`
- **Typography:** Georgia serif (`var(--font-serif)`)
- **No rounded corners** — `border-radius: 0` everywhere
- **Labels:** 10px, `letter-spacing: 0.12em`, uppercase — use `.label` CSS class
- All CSS variables defined in `app/globals.css`

## Database schema (Supabase)
Key tables:
- `customers` — id, user_id, email, name, member_id, points_balance, tier, avatar_url, public_token
- `products` — id, sku (= Shopify handle), product_name, brand, unit_price, image_url, description, scent_family, active
- `purchases` — id, customer_id, source (shopify/zettle/manual), total_amount, points_awarded
- `purchase_items` — id, purchase_id, sku, product_name, brand, quantity, unit_price, image_url
- `wishlists` — id, customer_id, sku, product_name, brand, unit_price, image_url
- `claim_tokens` — id, token, line_items (JSONB), total_amount, claimed_at, purchase_id
- `posts` — id, title, content, author_name, author_image_url, image_url, published_at
- `fragrance_notes` — id, name, image_url (reusable note entities)
- `product_notes` — id, sku, note_id, layer (top/middle/base), sort_order

TypeScript types are in `types/database.ts`. Supabase client doesn't infer custom types well — use explicit casts: `as { data: Product | null }`.

## Tier system (`lib/tier.ts`)
- Bronze: 0–4,999 pts
- Silver: 5,000–14,999 pts
- Gold: 15,000–34,999 pts
- Platinum: 35,000+ pts
- Points awarded = 10% of purchase amount in kr

## Points system
- 1 kr spent = 0.1 points (10% of purchase value)
- Points awarded on both in-store (Zettle claim token flow) and online (Shopify webhook — not yet implemented)

## App structure
```
app/
  (auth)/           — login, register, reset-password (public)
  (customer)/       — all customer-facing pages (requires auth)
    layout.tsx      — BottomNav + PendingClaimHandler + InstallPrompt
    dashboard/      — points balance, tier progress, recent purchases
    products/       — product catalogue with search/filter + [sku]/ detail page
    purchases/      — full purchase history
    profile/        — radar chart, fragrance profile, wishlist, share
    news/           — blog posts written by staff
  staff/            — staff tablet interface (PIN auth via httpOnly cookie)
    (protected)/    — main staff screen, transaction (QR flow), posts CRUD
  claim/            — public QR scan landing page
  p/[token]/        — public shareable customer profile
  api/
    claim/          — validates claim token, awards points
    staff/auth/     — PIN login/logout
    staff/upload/   — image upload via service role (bypasses RLS)
    share/          — sends profile share email via Resend
proxy.ts            — Next.js 16 middleware (named proxy, not middleware)
```

## Key conventions
- Server components fetch data; client components handle interactivity
- Supabase server client: `@/lib/supabase/server` (for server components/routes)
- Supabase browser client: `@/lib/supabase/client` (for client components)
- Image uploads go through `/api/staff/upload` (service role) to bypass RLS
- All pages under `(customer)/` redirect to `/login` if no auth session
- Bottom nav has 4 tabs: Home (`/dashboard`), Products (`/products`), News (`/news`), Profile (`/profile`)
- Nav icons are PNGs at `public/icons/` (32×32px displayed)
- PWA manifest at `public/manifest.json`, icon at `public/icon.png`

## Shopify integration
- 499 products imported from Shopify CSV via `scripts/import-products.mjs`
- Product SKU = Shopify handle (e.g. `st-vetyver-d-s-durga`)
- Product descriptions populated via `scripts/update-descriptions.mjs`
- Product images hosted on Shopify CDN (`cdn.shopify.com`) — whitelisted in `next.config.ts`
- "Buy at fab-lab.nu" button on product detail page links to `https://fab-lab.nu/products/[sku]`
- Shopify order webhook (`/api/webhooks/shopify`) — **not yet implemented**

## Staff flow
- Staff authenticate with a PIN (stored hashed in env), sets httpOnly cookie
- Main screen: search customers, create transactions, manage posts
- Transaction flow: add products to cart → generate QR claim token → customer scans → points credited
- QR scan triggers celebration animation, then redirects back to staff home

## PWA
- Installed via "Add to Home Screen" (iOS: manual instructions shown in app; Android: beforeinstallprompt intercepted)
- `public/manifest.json` — name: "Fab-lab", start_url: "/dashboard", theme_color: "#26526F"

## Pending / not yet built
- Shopify order webhook for auto-crediting points on online purchases
- Zettle webhook handler
- Points redemption / discount code generation (Shopify Admin API)
- Product catalog auto-sync from Shopify webhooks
- Fragrance notes pyramid data (schema exists, only St. Vetyver seeded as example)
- PWA icon needs dark blue background (#26526F) + white text version

## iOS-specific gotcha
Input `font-size` must be `≥ 16px` or iOS Safari/Chrome auto-zooms on focus. Set globally in `globals.css` — never override with a smaller inline fontSize on inputs.
