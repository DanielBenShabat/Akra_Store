-- General site/admin settings table.
-- Settings are JSON so new admin options can be added without a new table.

create table if not exists site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function set_site_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_settings_updated_at on site_settings;

create trigger site_settings_updated_at
before update on site_settings
for each row
execute function set_site_settings_updated_at();

alter table site_settings enable row level security;

insert into site_settings (key, value)
values
  (
    'shipping',
    jsonb_build_object(
      'expressFee', 40,
      'standardFee', 25,
      'pickupFee', 0,
      'freeStandardEnabled', true,
      'freeStandardThreshold', 400
    )
  ),
  (
    'logo',
    jsonb_build_object('url', null)
  ),
  (
    'top_logo',
    jsonb_build_object('url', null)
  ),
  (
    'hero_background',
    jsonb_build_object('url', null)
  )
on conflict (key) do nothing;
