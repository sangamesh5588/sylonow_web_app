alter table public.customer_inquiries
add column if not exists other_occasion text;

alter table public.customer_inquiries
drop constraint if exists customer_inquiries_other_occasion_check;

alter table public.customer_inquiries
add constraint customer_inquiries_other_occasion_check
check (
  other_occasion is null
  or char_length(trim(other_occasion)) > 0
);
