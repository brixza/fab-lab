-- Auto-create a customers row when a user signs up via Supabase Auth
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.customers (user_id, email, name, member_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    ''  -- member_id will be set by the set_member_id trigger
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
