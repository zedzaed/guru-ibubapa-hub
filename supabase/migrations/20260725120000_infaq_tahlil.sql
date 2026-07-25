-- Fasa 3: Pengurusan Infaq & Tahlil
create extension if not exists pgcrypto;

-- Keserasian dengan skema role Lovable semasa.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), 'admin'::public.app_role);
$$;

grant execute on function public.is_admin() to authenticated;

create table if not exists public.infaq_settings (
  id smallint primary key default 1 check (id = 1),
  organization_name text not null default 'Madrasah Hub',
  address text,
  phone text,
  bank_name text,
  account_name text,
  account_number text,
  qr_image_url text,
  payment_instructions text not null default 'Sila imbas QR atau buat pindahan bank, kemudian muat naik bukti bayaran.',
  receipt_prefix text not null default 'INF',
  tahlil_day smallint not null default 5 check (tahlil_day between 0 and 6),
  tahlil_time time not null default '20:30',
  form_active boolean not null default true,
  email_subject text not null default 'Pengesahan Infaq dan Resit Rasmi',
  email_body text not null default 'Terima kasih atas sumbangan infaq anda. Resit rasmi dilampirkan bersama e-mel ini.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.infaq_settings (id)
values (1)
on conflict (id) do nothing;

create sequence if not exists public.infaq_receipt_seq start 1;

create table if not exists public.infaq_submissions (
  id uuid primary key default gen_random_uuid(),
  reference_no text not null unique,
  source text not null default 'public' check (source in ('public', 'admin')),
  donor_name text not null,
  email text not null,
  phone text not null,
  amount numeric(12,2) not null check (amount > 0),
  tahlil_names text not null,
  intention text,
  is_private boolean not null default false,
  payment_date date,
  proof_path text,
  proof_filename text,
  status text not null default 'menunggu' check (
    status in ('menunggu', 'perlu_bukti_baharu', 'ditolak', 'dijadualkan', 'selesai')
  ),
  admin_note text,
  verified_by uuid references public.profiles(id) on delete set null,
  verified_at timestamptz,
  tahlil_week date,
  tahlil_completed_at timestamptz,
  receipt_no text unique,
  receipt_issued_at timestamptz,
  email_sent_at timestamptz,
  email_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists infaq_submissions_status_idx on public.infaq_submissions(status);
create index if not exists infaq_submissions_created_at_idx on public.infaq_submissions(created_at desc);
create index if not exists infaq_submissions_tahlil_week_idx on public.infaq_submissions(tahlil_week);
create index if not exists infaq_submissions_email_idx on public.infaq_submissions(lower(email));

create or replace function public.set_infaq_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists infaq_settings_updated_at on public.infaq_settings;
create trigger infaq_settings_updated_at
before update on public.infaq_settings
for each row execute function public.set_infaq_updated_at();

drop trigger if exists infaq_submissions_updated_at on public.infaq_submissions;
create trigger infaq_submissions_updated_at
before update on public.infaq_submissions
for each row execute function public.set_infaq_updated_at();

alter table public.infaq_settings enable row level security;
alter table public.infaq_submissions enable row level security;

drop policy if exists infaq_settings_public_read on public.infaq_settings;
create policy infaq_settings_public_read on public.infaq_settings
for select to anon, authenticated using (true);

drop policy if exists infaq_settings_admin_write on public.infaq_settings;
create policy infaq_settings_admin_write on public.infaq_settings
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists infaq_submissions_public_insert on public.infaq_submissions;
create policy infaq_submissions_public_insert on public.infaq_submissions
for insert to anon, authenticated
with check (
  source = 'public'
  and status = 'menunggu'
  and verified_by is null
  and receipt_no is null
  and email_sent_at is null
);

drop policy if exists infaq_submissions_admin_all on public.infaq_submissions;
create policy infaq_submissions_admin_all on public.infaq_submissions
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.lookup_infaq_status(
  p_reference_no text,
  p_email text
)
returns table (
  reference_no text,
  donor_name text,
  amount numeric,
  status text,
  tahlil_week date,
  tahlil_completed_at timestamptz,
  receipt_no text,
  admin_note text,
  created_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select
    i.reference_no,
    i.donor_name,
    i.amount,
    i.status,
    i.tahlil_week,
    i.tahlil_completed_at,
    i.receipt_no,
    case when i.status in ('ditolak', 'perlu_bukti_baharu') then i.admin_note else null end,
    i.created_at
  from public.infaq_submissions i
  where upper(i.reference_no) = upper(trim(p_reference_no))
    and lower(i.email) = lower(trim(p_email))
  limit 1;
$$;

create or replace function public.approve_infaq(
  p_submission_id uuid,
  p_tahlil_week date,
  p_admin_note text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefix text;
  v_receipt_no text;
begin
  if not public.is_admin() then
    raise exception 'Akses admin diperlukan';
  end if;

  select coalesce(nullif(trim(receipt_prefix), ''), 'INF')
  into v_prefix
  from public.infaq_settings
  where id = 1;

  v_receipt_no := v_prefix || '-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('public.infaq_receipt_seq')::text, 6, '0');

  update public.infaq_submissions
  set
    status = 'dijadualkan',
    verified_by = auth.uid(),
    verified_at = now(),
    tahlil_week = p_tahlil_week,
    admin_note = nullif(trim(p_admin_note), ''),
    receipt_no = coalesce(receipt_no, v_receipt_no),
    receipt_issued_at = coalesce(receipt_issued_at, now()),
    email_error = null
  where id = p_submission_id
  returning receipt_no into v_receipt_no;

  if v_receipt_no is null then
    raise exception 'Rekod infaq tidak ditemui';
  end if;

  return v_receipt_no;
end;
$$;

grant select on public.infaq_settings to anon, authenticated;
grant insert on public.infaq_submissions to anon, authenticated;
grant select, insert, update, delete on public.infaq_submissions to authenticated;
grant usage, select on sequence public.infaq_receipt_seq to authenticated;
grant execute on function public.lookup_infaq_status(text, text) to anon, authenticated;
grant execute on function public.approve_infaq(uuid, date, text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('infaq-proofs', 'infaq-proofs', false, 10485760, array['image/jpeg','image/png','image/webp','application/pdf']),
  ('infaq-assets', 'infaq-assets', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists infaq_proofs_public_upload on storage.objects;
create policy infaq_proofs_public_upload on storage.objects
for insert to anon, authenticated
with check (
  bucket_id = 'infaq-proofs'
  and (storage.foldername(name))[1] = 'public'
);

drop policy if exists infaq_proofs_admin_read on storage.objects;
create policy infaq_proofs_admin_read on storage.objects
for select to authenticated
using (bucket_id = 'infaq-proofs' and public.is_admin());

drop policy if exists infaq_proofs_admin_manage on storage.objects;
create policy infaq_proofs_admin_manage on storage.objects
for all to authenticated
using (bucket_id = 'infaq-proofs' and public.is_admin())
with check (bucket_id = 'infaq-proofs' and public.is_admin());

drop policy if exists infaq_assets_public_read on storage.objects;
create policy infaq_assets_public_read on storage.objects
for select to anon, authenticated
using (bucket_id = 'infaq-assets');

drop policy if exists infaq_assets_admin_manage on storage.objects;
create policy infaq_assets_admin_manage on storage.objects
for all to authenticated
using (bucket_id = 'infaq-assets' and public.is_admin())
with check (bucket_id = 'infaq-assets' and public.is_admin());