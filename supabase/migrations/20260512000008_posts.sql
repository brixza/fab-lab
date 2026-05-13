create table posts (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  content          text not null,
  author_name      text not null,
  author_image_url text,
  image_url        text,
  published_at     timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

alter table posts enable row level security;
create policy "posts: public read" on posts for select using (true);

-- Storage bucket for post images
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create policy "post-images: public read" on storage.objects
  for select using (bucket_id = 'post-images');

-- Only service role (staff API) can insert images — enforced in app layer
