-- Reusable fragrance note entities
create table if not exists fragrance_notes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  image_url   text,
  created_at  timestamptz default now()
);

-- Links notes to products with pyramid layer
create table if not exists product_notes (
  id          uuid primary key default gen_random_uuid(),
  sku         text not null references products(sku) on delete cascade,
  note_id     uuid not null references fragrance_notes(id) on delete cascade,
  layer       text not null check (layer in ('top', 'middle', 'base')),
  sort_order  int not null default 0,
  unique (sku, note_id, layer)
);

-- RLS: readable by any authenticated user, writable only by service role
alter table fragrance_notes enable row level security;
alter table product_notes    enable row level security;

create policy "authenticated read fragrance_notes"
  on fragrance_notes for select to authenticated using (true);

create policy "authenticated read product_notes"
  on product_notes for select to authenticated using (true);

-- Seed: St. Vetyver (DS & Durga, SKU: st-vetyver)
-- Insert notes (ignore if already exist)
insert into fragrance_notes (name) values
  ('Seagrass'),
  ('Bitter Orange'),
  ('Pink Pepper'),
  ('Hat Straw'),
  ('Reed'),
  ('Clove Leaf'),
  ('Rhum Agricole'),
  ('Vetiver'),
  ('Breadnut')
on conflict (name) do nothing;

-- Link notes to the product
insert into product_notes (sku, note_id, layer, sort_order)
select 'st-vetyver-d-s-durga', id, 'top', 0    from fragrance_notes where name = 'Seagrass'
union all
select 'st-vetyver-d-s-durga', id, 'top', 1    from fragrance_notes where name = 'Bitter Orange'
union all
select 'st-vetyver-d-s-durga', id, 'top', 2    from fragrance_notes where name = 'Pink Pepper'
union all
select 'st-vetyver-d-s-durga', id, 'middle', 0 from fragrance_notes where name = 'Hat Straw'
union all
select 'st-vetyver-d-s-durga', id, 'middle', 1 from fragrance_notes where name = 'Reed'
union all
select 'st-vetyver-d-s-durga', id, 'middle', 2 from fragrance_notes where name = 'Clove Leaf'
union all
select 'st-vetyver-d-s-durga', id, 'base', 0   from fragrance_notes where name = 'Rhum Agricole'
union all
select 'st-vetyver-d-s-durga', id, 'base', 1   from fragrance_notes where name = 'Vetiver'
union all
select 'st-vetyver-d-s-durga', id, 'base', 2   from fragrance_notes where name = 'Breadnut'
on conflict (sku, note_id, layer) do nothing;
