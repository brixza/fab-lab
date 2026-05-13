-- Public token for shareable profile URLs
alter table customers
  add column if not exists public_token uuid not null default gen_random_uuid();

create unique index if not exists customers_public_token_idx on customers(public_token);

-- Wishlists
create table wishlists (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid references customers(id) on delete cascade not null,
  sku          text not null,
  product_name text not null,
  brand        text not null,
  unit_price   integer not null,
  image_url    text,
  created_at   timestamptz not null default now(),
  unique(customer_id, sku)
);

alter table wishlists enable row level security;

-- Customers manage their own wishlist
create policy "wishlists: own read"   on wishlists for select using (customer_id = (select id from customers where user_id = auth.uid()));
create policy "wishlists: own insert" on wishlists for insert with check (customer_id = (select id from customers where user_id = auth.uid()));
create policy "wishlists: own delete" on wishlists for delete using (customer_id = (select id from customers where user_id = auth.uid()));

-- Public read so shared profile pages can show the wishlist
create policy "wishlists: public read" on wishlists for select using (true);

create index on wishlists(customer_id);
