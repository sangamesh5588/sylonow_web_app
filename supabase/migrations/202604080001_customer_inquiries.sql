create extension if not exists pgcrypto;

create table if not exists public.customer_inquiries (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users (id) on delete set null,
  source text not null default 'home_popup' check (source in ('home_popup', 'support_fab')),
  occasion text not null check (char_length(trim(occasion)) > 0),
  budget_input text not null check (char_length(trim(budget_input)) > 0),
  phone_number text not null check (char_length(trim(phone_number)) > 0),
  page_path text not null default '/',
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists customer_inquiries_source_created_at_idx
  on public.customer_inquiries (source, created_at desc);

create index if not exists customer_inquiries_phone_number_idx
  on public.customer_inquiries (phone_number);

alter table public.customer_inquiries enable row level security;

drop policy if exists "customer inquiries are insertable publicly" on public.customer_inquiries;
create policy "customer inquiries are insertable publicly"
on public.customer_inquiries
for insert
to anon, authenticated
with check (
  char_length(regexp_replace(phone_number, '\D', '', 'g')) >= 10
  and (
    (auth.uid() is null and auth_user_id is null)
    or auth.uid() = auth_user_id
  )
);

grant insert on table public.customer_inquiries to anon, authenticated;
