-- Add platinum tier and update thresholds
-- New tiers: Bronze 0-4,999 · Silver 5,000-14,999 · Gold 15,000-34,999 · Platinum 35,000+

alter table customers
  drop constraint if exists customers_tier_check;

alter table customers
  add constraint customers_tier_check
  check (tier in ('bronze', 'silver', 'gold', 'platinum'));

create or replace function recalculate_tier() returns trigger as $$
begin
  new.tier := case
    when new.points_balance >= 35000 then 'platinum'
    when new.points_balance >= 15000 then 'gold'
    when new.points_balance >= 5000  then 'silver'
    else 'bronze'
  end;
  return new;
end;
$$ language plpgsql;

-- Recalculate existing customers
update customers set points_balance = points_balance;
