-- Add avatar_url to customers
alter table customers add column if not exists avatar_url text;

-- Create avatars storage bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- RLS: customers can upload/update only their own avatar
create policy "avatars: upload own"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars: update own"
  on storage.objects for update
  using (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars');
