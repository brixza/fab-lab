create table products (
  id           uuid primary key default gen_random_uuid(),
  sku          text not null unique,
  product_name text not null,
  brand        text not null,
  unit_price   integer not null,        -- SEK, whole units
  image_url    text,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Public read — products are store inventory, not sensitive
alter table products enable row level security;
create policy "products: public read" on products for select using (true);

-- Seed with known catalogue
insert into products (sku, product_name, brand, unit_price, image_url) values
  ('PIG-BRU-100', 'Brutalist',       'Pigmentarium',              2200, 'https://fab-lab.nu/cdn/shop/files/brutal-pigmentarium-975502.png?v=1768956738&width=600'),
  ('RPS-PHE-50',  'Pheromones',      'Reinvented Perfumes Sweden', 1600, 'https://fab-lab.nu/cdn/shop/files/pheromones-reinvented-perfumes-sweden.jpg?v=1770107004&width=600'),
  ('LBG-1992-75', '1992 Purple Night','Les Bains Guerbois',        2400, 'https://fab-lab.nu/cdn/shop/products/1992-purple-night-les-bains-guerbois-984195.jpg?v=1768956642&width=600'),
  ('LIV-IGG-50',  'Iggy Woo',        'Liv Botanicals',            2900, 'https://fab-lab.nu/cdn/shop/files/06_IGGYWOO_LIV_FrontShot_4K_Transparent.webp?v=1776296820&width=600'),
  ('XX-NEO-100',  'Neon Splash',     'Exnihilo',                  2800, 'https://fab-lab.nu/cdn/shop/files/Neon-Splash-EDP-2.jpg?v=1768957469&width=600');
