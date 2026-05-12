-- Fragrance note profiles per SKU
-- All radar dimensions are 0-100 intensity scores
create table product_notes (
  id          uuid primary key default gen_random_uuid(),
  sku         text not null unique,

  -- Radar dimensions
  woody       integer not null default 0 check (woody    between 0 and 100),
  floral      integer not null default 0 check (floral   between 0 and 100),
  citrus      integer not null default 0 check (citrus   between 0 and 100),
  fresh       integer not null default 0 check (fresh    between 0 and 100),
  oriental    integer not null default 0 check (oriental between 0 and 100),
  spicy       integer not null default 0 check (spicy    between 0 and 100),

  -- Descriptive notes (for display + AI prompt context)
  top_notes    text[] not null default '{}',
  middle_notes text[] not null default '{}',
  base_notes   text[] not null default '{}',

  created_at  timestamptz not null default now()
);

-- Seed data for the products in our catalogue
insert into product_notes (sku, woody, floral, citrus, fresh, oriental, spicy, top_notes, middle_notes, base_notes) values
  ('PIG-BRU-100', 88, 10, 5,  12, 55, 72,
    array['black pepper', 'smoke'],
    array['leather', 'tar', 'concrete'],
    array['vetiver', 'oud', 'musk']),

  ('RPS-PHE-50',  20, 62, 38, 80, 28, 12,
    array['bergamot', 'lemon verbena'],
    array['jasmine', 'rose', 'iris'],
    array['musk', 'sandalwood', 'ambergris']),

  ('LBG-1992-75', 38, 72, 18, 22, 85, 48,
    array['saffron', 'cardamom'],
    array['rose', 'oud', 'patchouli'],
    array['amber', 'vanilla', 'benzoin']),

  ('LIV-IGG-50',  18, 88, 52, 74, 30, 14,
    array['neroli', 'grapefruit', 'pink pepper'],
    array['tuberose', 'magnolia', 'peony'],
    array['musk', 'cedar', 'ambrette']),

  ('XX-NEO-100',  10, 38, 78, 92, 18, 8,
    array['yuzu', 'lime', 'sea salt'],
    array['aquatic accord', 'white tea'],
    array['driftwood', 'musk', 'ambergris']);

-- RLS (staff + service role can read; customers read via join in app logic)
alter table product_notes enable row level security;
create policy "product_notes: public read" on product_notes for select using (true);
