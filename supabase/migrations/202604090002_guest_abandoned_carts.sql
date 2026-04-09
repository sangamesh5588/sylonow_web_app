alter table public.abandoned_carts
alter column auth_user_id drop not null;

alter table public.abandoned_carts
add column if not exists guest_session_id text;

create unique index if not exists abandoned_carts_guest_session_id_idx
on public.abandoned_carts (guest_session_id)
where guest_session_id is not null;

alter table public.abandoned_carts
drop constraint if exists abandoned_carts_identity_check;

alter table public.abandoned_carts
add constraint abandoned_carts_identity_check check (
  auth_user_id is not null
  or (guest_session_id is not null and char_length(trim(guest_session_id)) > 0)
);

create or replace function public.upsert_abandoned_cart_snapshot(
  p_cart_items jsonb,
  p_item_count integer,
  p_cart_total numeric,
  p_cart_fingerprint text default '',
  p_phone_number text default null,
  p_full_name text default null,
  p_recovery_url text default null,
  p_metadata jsonb default '{}'::jsonb,
  p_status text default null,
  p_guest_session_id text default null
)
returns public.abandoned_carts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_user_id uuid := auth.uid();
  v_guest_session_id text := nullif(trim(p_guest_session_id), '');
  v_status text := coalesce(
    nullif(trim(p_status), ''),
    case when coalesce(p_item_count, 0) = 0 then 'archived' else 'active' end
  );
  v_row public.abandoned_carts;
  v_target_id uuid;
begin
  if v_auth_user_id is null and v_guest_session_id is null then
    raise exception 'Authentication or guest session required';
  end if;

  if v_status not in ('active', 'archived', 'converted') then
    raise exception 'Invalid abandoned cart status: %', v_status;
  end if;

  if v_auth_user_id is not null then
    select id
    into v_target_id
    from public.abandoned_carts
    where auth_user_id = v_auth_user_id
    limit 1;
  end if;

  if v_target_id is null and v_guest_session_id is not null then
    select id
    into v_target_id
    from public.abandoned_carts
    where guest_session_id = v_guest_session_id
    limit 1;
  end if;

  if v_target_id is null then
    insert into public.abandoned_carts (
      auth_user_id,
      guest_session_id,
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
      v_guest_session_id,
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
      0
    )
    returning * into v_row;
  else
    update public.abandoned_carts
    set
      auth_user_id = coalesce(v_auth_user_id, auth_user_id),
      phone_number = nullif(trim(p_phone_number), ''),
      full_name = nullif(trim(p_full_name), ''),
      cart_items = coalesce(p_cart_items, '[]'::jsonb),
      cart_fingerprint = coalesce(p_cart_fingerprint, ''),
      item_count = greatest(coalesce(p_item_count, 0), 0),
      cart_total = greatest(coalesce(p_cart_total, 0), 0),
      status = v_status,
      recovery_url = nullif(trim(p_recovery_url), ''),
      metadata = coalesce(p_metadata, '{}'::jsonb),
      last_activity_at = now(),
      converted_at = case when v_status = 'converted' then now() else null end,
      first_abandoned_at = case when v_status = 'active' then null else public.abandoned_carts.first_abandoned_at end,
      last_notified_at = case when v_status = 'active' then null else public.abandoned_carts.last_notified_at end,
      notification_count = case when v_status = 'active' then 0 else public.abandoned_carts.notification_count end
    where id = v_target_id
    returning * into v_row;
  end if;

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
  text,
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
  text,
  text
) to anon, authenticated;
