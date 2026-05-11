-- Enable pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- ─────────────────────────────────────────
-- customers
-- ─────────────────────────────────────────
create table customers (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null unique,
  email         text not null unique,
  name          text not null,
  member_id     text not null unique,           -- e.g. FL-4821
  points_balance integer not null default 0,
  tier          text not null default 'bronze' check (tier in ('bronze', 'silver', 'gold')),
  created_at    timestamptz not null default now()
);

-- auto-generate member_id: FL- + 4 random digits padded
create sequence customer_member_seq start 1000;

create or replace function generate_member_id() returns trigger as $$
begin
  new.member_id := 'FL-' || lpad(nextval('customer_member_seq')::text, 4, '0');
  return new;
end;
$$ language plpgsql;

create trigger set_member_id
  before insert on customers
  for each row
  when (new.member_id is null or new.member_id = '')
  execute function generate_member_id();

-- ─────────────────────────────────────────
-- purchases
-- ─────────────────────────────────────────
create table purchases (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid references customers(id) on delete cascade not null,
  source           text not null check (source in ('shopify', 'zettle', 'manual')),
  reference_number text,                        -- Shopify order ID or Zettle payment ID
  total_amount     integer not null,            -- in SEK, whole units
  points_awarded   integer not null default 0,
  claimed_at       timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- purchase_items
-- ─────────────────────────────────────────
create table purchase_items (
  id           uuid primary key default gen_random_uuid(),
  purchase_id  uuid references purchases(id) on delete cascade not null,
  sku          text not null,
  product_name text not null,
  brand        text not null,
  quantity     integer not null default 1,
  unit_price   integer not null,               -- in SEK, whole units
  created_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- claim_tokens  (in-store QR flow)
-- ─────────────────────────────────────────
create table claim_tokens (
  id                    uuid primary key default gen_random_uuid(),
  token                 text not null unique,   -- e.g. tx_abc123
  zettle_transaction_id text not null,
  expires_at            timestamptz not null,
  claimed_at            timestamptz,            -- null = unclaimed
  purchase_id           uuid references purchases(id) on delete set null,

  -- snapshot of the sale at token creation time
  -- stored as JSONB so we don't need a separate pending_items table
  line_items            jsonb not null default '[]',
  total_amount          integer not null,

  created_at            timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- unclaimed_shopify_orders
-- orders that arrived before a customer registered
-- ─────────────────────────────────────────
create table unclaimed_shopify_orders (
  id               uuid primary key default gen_random_uuid(),
  email            text not null,
  shopify_order_id text not null unique,
  total_amount     integer not null,
  line_items       jsonb not null default '[]',
  created_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- functions: recalculate tier after points change
-- ─────────────────────────────────────────
create or replace function recalculate_tier() returns trigger as $$
begin
  new.tier := case
    when new.points_balance >= 8000 then 'gold'
    when new.points_balance >= 2000 then 'silver'
    else 'bronze'
  end;
  return new;
end;
$$ language plpgsql;

create trigger update_tier
  before update of points_balance on customers
  for each row
  execute function recalculate_tier();

-- ─────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────
alter table customers       enable row level security;
alter table purchases        enable row level security;
alter table purchase_items   enable row level security;
alter table claim_tokens     enable row level security;
alter table unclaimed_shopify_orders enable row level security;

-- customers: read/update own row only
create policy "customers: own row" on customers
  for all using (auth.uid() = user_id);

-- purchases: read own purchases
create policy "purchases: own" on purchases
  for select using (
    customer_id = (select id from customers where user_id = auth.uid())
  );

-- purchase_items: read items belonging to own purchases
create policy "purchase_items: own" on purchase_items
  for select using (
    purchase_id in (
      select p.id from purchases p
      join customers c on c.id = p.customer_id
      where c.user_id = auth.uid()
    )
  );

-- claim_tokens: readable by anyone with the token (enforced in app logic)
-- no RLS select needed — token lookup happens via service role in API routes

-- ─────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────
create index on customers (email);
create index on purchases (customer_id, created_at desc);
create index on purchase_items (purchase_id);
create index on claim_tokens (token);
create index on claim_tokens (expires_at) where claimed_at is null;
create index on unclaimed_shopify_orders (email);
