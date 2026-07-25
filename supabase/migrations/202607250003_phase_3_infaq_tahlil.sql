-- Madrasah Hub — Fasa 3
-- Pengurusan Infaq, bukti bayaran, tahlil mingguan dan resit.

create extension if not exists pgcrypto;

do $$ begin
  create type public.infaq_payment_status as enum ('menunggu', 'disahkan', 'ditolak', 'perlu_bukti');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.infaq_tahlil_status as enum ('belum_dijadual', 'dijadualkan', 'selesai', 'dibawa_ke_hadapan');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.infaq_email_status as enum ('belum_dihantar', 'dihantar', 'gagal');
exception when duplicate_object then null; end $$;

create sequence if not exists public.infaq_reference_seq start 1;
create sequence if not exists public.infaq_receipt_seq start 1;

create table if not exists public.infaq_settings (
  id smallint primary key default 1 check (id = 1),
  enabled boolean not null default false,
  campaign_title text not null default 'Infaq & Tahlil Mingguan',
  campaign_description text,
  bank_name text,
  account_name text,
  account_number text,
  qr_path text,
  payment_instructions text,
  suggested_amounts numeric(12,2)[] not null default array[10, 20, 50, 100]::numeric(12,2)[],
  tahlil_day smallint not null default 5 check (tahlil_day between 0 and 6),
  receipt_prefix text not null default 'INF',
  organisation_name text not null default 'Madrasah Hub',
  organisation_address text,
  organisation_phone text,
  sender_email text,
  email_subject text not null default 'Resit Infaq {{reference_no}}',
  email_body text not null default 'Terima kasih atas infaq anda. Resit rasmi dilampirkan bersama e-mel ini.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.infaq_settings (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.infaq_submissions (
  id uuid primary key default gen_random_uuid(),
  reference_no text not null unique default (
    'INFQ-' || to_char(current_date, 'YYYYMMDD') || '-' ||
    lpad(nextval('public.infaq_reference_seq')::text, 5, '0')
  ),
  public_token uuid not null unique default gen_random_uuid(),
  source text not null default 'public' check (source in ('public', 'admin')),
  donor_name text not null,
  email text,
  phone text not null,
  address text,
  amount numeric(12,2) not null check (amount > 0),
  tahlil_names text not null,
  relationship text,
  purpose_note text,
  display_publicly boolean not null default false,
  payment_method text not null default 'qr' check (payment_method in ('qr', 'bank', 'tunai', 'lain')),
  payment_proof_path text,
  payment_status public.infaq_payment_status not null default 'menunggu',
  tahlil_status public.infaq_tahlil_status not null default 'belum_dijadual',
  scheduled_week date,
  admin_note text,
  receipt_no text unique,
  receipt_issued_at timestamptz,
  email_status public.infaq_email_status not null default 'belum_dihantar',
  email_sent_at timestamptz,
  email_error text,
  created_by uuid,
  verified_by uuid,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists infaq_submissions_created_at_idx
  on public.infaq_submissions (created_at desc);
create index if not exists infaq_submissions_payment_status_idx
  on public.infaq_submissions (payment_status);
create index if not exists infaq_submissions_tahlil_status_idx
  on public.infaq_submissions (tahlil_status, scheduled_week);

create or replace function public.touch_infaq_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists infaq_settings_touch_updated_at on public.infaq_settings;
create trigger infaq_settings_touch_updated_at
before update on public.infaq_settings
for each row execute function public.touch_infaq_updated_at();

drop trigger if exists infaq_submissions_touch_updated_at on public.infaq_submissions;
create trigger infaq_submissions_touch_updated_at
before update on public.infaq_submissions
for each row execute function public.touch_infaq_updated_at();

create or replace function public.next_infaq_receipt_no(p_prefix text default 'INF')
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_prefix text;
begin
  if not exists (
    select 1
    from public.user_roles
    where user_id = auth.uid() and role::text = 'admin'
  ) then
    raise exception 'Akses admin diperlukan';
  end if;

  clean_prefix := upper(regexp_replace(coalesce(nullif(trim(p_prefix), ''), 'INF'), '[^A-Za-z0-9_-]', '', 'g'));
  return clean_prefix || '-' || to_char(current_date, 'YYYY') || '-' ||
    lpad(nextval('public.infaq_receipt_seq')::text, 6, '0');
end;
$$;

create or replace function public.get_infaq_status(p_token uuid)
returns table (
  reference_no text,
  donor_name text,
  amount numeric,
  tahlil_names text,
  payment_status public.infaq_payment_status,
  tahlil_status public.infaq_tahlil_status,
  scheduled_week date,
  receipt_no text,
  created_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select
    s.reference_no,
    s.donor_name,
    s.amount,
    s.tahlil_names,
    s.payment_status,
    s.tahlil_status,
    s.scheduled_week,
    s.receipt_no,
    s.created_at
  from public.infaq_submissions s
  where s.public_token = p_token
  limit 1;
$$;

create or replace function public.get_infaq_receipt(p_token uuid)
returns table (
  reference_no text,
  receipt_no text,
  donor_name text,
  email text,
  phone text,
  amount numeric,
  tahlil_names text,
  payment_method text,
  verified_at timestamptz,
  organisation_name text,
  organisation_address text,
  organisation_phone text
)
language sql
security definer
stable
set search_path = public
as $$
  select
    s.reference_no,
    s.receipt_no,
    s.donor_name,
    s.email,
    s.phone,
    s.amount,
    s.tahlil_names,
    s.payment_method,
    s.verified_at,
    cfg.organisation_name,
    cfg.organisation_address,
    cfg.organisation_phone
  from public.infaq_submissions s
  cross join public.infaq_settings cfg
  where s.public_token = p_token
    and s.payment_status = 'disahkan'
    and s.receipt_no is not null
  limit 1;
$$;

alter table public.infaq_settings enable row level security;
alter table public.infaq_submissions enable row level security;

drop policy if exists infaq_settings_public_read on public.infaq_settings;
create policy infaq_settings_public_read on public.infaq_settings
for select to anon, authenticated
using (true);

drop policy if exists infaq_settings_admin_write on public.infaq_settings;
create policy infaq_settings_admin_write on public.infaq_settings
for all to authenticated
using (
  exists (select 1 from public.user_roles where user_id = auth.uid() and role::text = 'admin')
)
with check (
  exists (select 1 from public.user_roles where user_id = auth.uid() and role::text = 'admin')
);

drop policy if exists infaq_submissions_public_insert on public.infaq_submissions;
create policy infaq_submissions_public_insert on public.infaq_submissions
for insert to anon, authenticated
with check (
  source = 'public'
  and payment_status = 'menunggu'
  and tahlil_status = 'belum_dijadual'
  and created_by is null
  and verified_by is null
);

drop policy if exists infaq_submissions_admin_all on public.infaq_submissions;
create policy infaq_submissions_admin_all on public.infaq_submissions
for all to authenticated
using (
  exists (select 1 from public.user_roles where user_id = auth.uid() and role::text = 'admin')
)
with check (
  exists (select 1 from public.user_roles where user_id = auth.uid() and role::text = 'admin')
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('infaq-proofs', 'infaq-proofs', false, 5242880, array['image/jpeg','image/png','image/webp','application/pdf']),
  ('infaq-assets', 'infaq-assets', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists infaq_proofs_public_insert on storage.objects;
create policy infaq_proofs_public_insert on storage.objects
for insert to anon, authenticated
with check (
  bucket_id = 'infaq-proofs'
  and (storage.foldername(name))[1] = 'public'
);

drop policy if exists infaq_proofs_admin_access on storage.objects;
create policy infaq_proofs_admin_access on storage.objects
for all to authenticated
using (
  bucket_id = 'infaq-proofs'
  and exists (select 1 from public.user_roles where user_id = auth.uid() and role::text = 'admin')
)
with check (
  bucket_id = 'infaq-proofs'
  and exists (select 1 from public.user_roles where user_id = auth.uid() and role::text = 'admin')
);

drop policy if exists infaq_assets_admin_write on storage.objects;
create policy infaq_assets_admin_write on storage.objects
for all to authenticated
using (
  bucket_id = 'infaq-assets'
  and exists (select 1 from public.user_roles where user_id = auth.uid() and role::text = 'admin')
)
with check (
  bucket_id = 'infaq-assets'
  and exists (select 1 from public.user_roles where user_id = auth.uid() and role::text = 'admin')
);

grant select on public.infaq_settings to anon, authenticated;
grant insert on public.infaq_submissions to anon, authenticated;
grant select, insert, update, delete on public.infaq_submissions to authenticated;
grant usage, select on sequence public.infaq_reference_seq to anon, authenticated;
grant usage, select on sequence public.infaq_receipt_seq to authenticated;
grant execute on function public.next_infaq_receipt_no(text) to authenticated;
grant execute on function public.get_infaq_status(uuid) to anon, authenticated;
grant execute on function public.get_infaq_receipt(uuid) to anon, authenticated;
