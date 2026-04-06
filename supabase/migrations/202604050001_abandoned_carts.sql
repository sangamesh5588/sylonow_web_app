create extension if not exists pgcrypto;

create table if not exists public.abandoned_carts (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users (id) on delete cascade,
  phone_number text,
  full_name text,
  cart_items jsonb not null default '[]'::jsonb,
  cart_fingerprint text not null default '',
  item_count integer not null default 0 check (item_count >= 0),
  cart_total numeric(10, 2) not null default 0 check (cart_total >= 0),
  status text not null default 'active' check (status in ('active', 'archived', 'converted')),
  recovery_url text,
  metadata jsonb not null default '{}'::jsonb,
  first_abandoned_at timestamptz,
  last_activity_at timestamptz not null default now(),
  converted_at timestamptz,
  last_notified_at timestamptz,
  notification_count integer not null default 0 check (notification_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (auth_user_id)
);

create table if not exists public.abandoned_cart_reminders (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.abandoned_carts (id) on delete cascade,
  auth_user_id uuid not null references auth.users (id) on delete cascade,
  reminder_type text not null default 'webhook',
  status text not null check (status in ('queued', 'sent', 'failed', 'skipped')),
  destination text,
  payload jsonb not null default '{}'::jsonb,
  provider_response jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists abandoned_carts_status_activity_idx
  on public.abandoned_carts (status, last_activity_at);

create index if not exists abandoned_carts_phone_number_idx
  on public.abandoned_carts (phone_number);

create index if not exists abandoned_cart_reminders_cart_id_idx
  on public.abandoned_cart_reminders (cart_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists abandoned_carts_set_updated_at on public.abandoned_carts;

create trigger abandoned_carts_set_updated_at
before update on public.abandoned_carts
for each row
execute function public.set_updated_at();

alter table public.abandoned_carts enable row level security;
alter table public.abandoned_cart_reminders enable row level security;

drop policy if exists "abandoned carts are readable by owner" on public.abandoned_carts;
create policy "abandoned carts are readable by owner"
on public.abandoned_carts
for select
to authenticated
using (auth.uid() = auth_user_id);

drop policy if exists "abandoned carts are insertable by owner" on public.abandoned_carts;
create policy "abandoned carts are insertable by owner"
on public.abandoned_carts
for insert
to authenticated
with check (auth.uid() = auth_user_id);

drop policy if exists "abandoned carts are updatable by owner" on public.abandoned_carts;
create policy "abandoned carts are updatable by owner"
on public.abandoned_carts
for update
to authenticated
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

drop policy if exists "abandoned reminders are readable by owner" on public.abandoned_cart_reminders;
create policy "abandoned reminders are readable by owner"
on public.abandoned_cart_reminders
for select
to authenticated
using (auth.uid() = auth_user_id);

create or replace function public.upsert_abandoned_cart_snapshot(
  p_cart_items jsonb,
  p_item_count integer,
  p_cart_total numeric,
  p_cart_fingerprint text default '',
  p_phone_number text default null,
  p_full_name text default null,
  p_recovery_url text default null,
  p_metadata jsonb default '{}'::jsonb,
  p_status text default null
)
returns public.abandoned_carts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_user_id uuid := auth.uid();
  v_status text := coalesce(
    nullif(trim(p_status), ''),
    case when coalesce(p_item_count, 0) = 0 then 'archived' else 'active' end
  );
  v_row public.abandoned_carts;
begin
  if v_auth_user_id is null then
    raise exception 'Authentication required';
  end if;

  if v_status not in ('active', 'archived', 'converted') then
    raise exception 'Invalid abandoned cart status: %', v_status;
  end if;

  insert into public.abandoned_carts (
    auth_user_id,
    phone_number,
    full_name,
    cart_items,
    cart_fingerprint,
    item_count,
    cart_total,
    status,
    recovery_url,
    metadata,
    first_abandoned_at,
    last_activity_at,
    converted_at,
    last_notified_at,
    notification_count
  )
  values (
    v_auth_user_id,
    nullif(trim(p_phone_number), ''),
    nullif(trim(p_full_name), ''),
    coalesce(p_cart_items, '[]'::jsonb),
    coalesce(p_cart_fingerprint, ''),
    greatest(coalesce(p_item_count, 0), 0),
    greatest(coalesce(p_cart_total, 0), 0),
    v_status,
    nullif(trim(p_recovery_url), ''),
    coalesce(p_metadata, '{}'::jsonb),
    null,
    now(),
    case when v_status = 'converted' then now() else null end,
    null,
    case when v_status = 'active' then 0 else 0 end
  )
  on conflict (auth_user_id) do update
  set
    phone_number = excluded.phone_number,
    full_name = excluded.full_name,
    cart_items = excluded.cart_items,
    cart_fingerprint = excluded.cart_fingerprint,
    item_count = excluded.item_count,
    cart_total = excluded.cart_total,
    status = excluded.status,
    recovery_url = excluded.recovery_url,
    metadata = excluded.metadata,
    last_activity_at = now(),
    converted_at = case when excluded.status = 'converted' then now() else null end,
    first_abandoned_at = case when excluded.status = 'active' then null else public.abandoned_carts.first_abandoned_at end,
    last_notified_at = case when excluded.status = 'active' then null else public.abandoned_carts.last_notified_at end,
    notification_count = case when excluded.status = 'active' then 0 else public.abandoned_carts.notification_count end
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.upsert_abandoned_cart_snapshot(
  jsonb,
  integer,
  numeric,
  text,
  text,
  text,
  text,
  jsonb,
  text
) from public;

grant execute on function public.upsert_abandoned_cart_snapshot(
  jsonb,
  integer,
  numeric,
  text,
  text,
  text,
  text,
  jsonb,
  text
) to authenticated;
