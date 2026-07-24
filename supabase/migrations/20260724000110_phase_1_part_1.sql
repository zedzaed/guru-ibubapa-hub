-- Sistem Pengurusan Madrasah — Fasa 1
-- Skema penuh, helper authorization, RLS, trigger profil dan Storage policies.


create extension if not exists pgcrypto;

-- =========================
-- ENUMS
-- =========================
do $$ begin
  create type public.user_role as enum ('admin', 'guru', 'ibu_bapa');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.user_status as enum ('aktif', 'tidak_aktif', 'digantung');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.student_status as enum ('aktif', 'tidak_aktif', 'tamat', 'berhenti');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.gender_type as enum ('lelaki', 'perempuan');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.attendance_status as enum ('hadir', 'lewat', 'tidak_hadir', 'cuti');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.hafazan_type as enum ('hafazan_baru', 'murajaah');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.academic_grade as enum ('mumtaz', 'jayyid_jiddan', 'jayyid', 'dhaif');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.tilawah_type as enum ('iqra', 'quran');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.behaviour_type as enum ('merit', 'demerit');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.fee_type as enum ('bulanan', 'sekali');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.invoice_status as enum ('belum_bayar', 'sudah_bayar', 'tertunggak');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.announcement_target as enum ('semua', 'kelas', 'individu');
exception when duplicate_object then null; end $$;

-- =========================
-- TABLES
-- =========================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  nama text not null,
  email text unique,
  phone text unique,
  role public.user_role not null default 'ibu_bapa',
  status public.user_status not null default 'aktif',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_contact_check check (email is not null or phone is not null)
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  nama_kelas text not null,
  tingkatan text not null,
  guru_id uuid references public.users(id) on delete set null,
  tahun integer not null check (tahun between 2000 and 2100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (nama_kelas, tahun)
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  no_kp text unique,
  tarikh_lahir date not null,
  jantina public.gender_type not null,
  kelas_id uuid references public.classes(id) on delete set null,
  tahun_masuk integer not null check (tahun_masuk between 2000 and 2100),
  status public.student_status not null default 'aktif',
  gambar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parents_students (
  parent_id uuid not null references public.users(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  hubungan text not null,
  created_at timestamptz not null default now(),
  primary key (parent_id, student_id)
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  tarikh date not null,
  status public.attendance_status not null,
  sebab text,
  direkod_oleh uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, tarikh)
);

create table if not exists public.hafazan (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  surah text not null,
  ayat_mula integer not null check (ayat_mula > 0),
  ayat_akhir integer not null check (ayat_akhir >= ayat_mula),
  jenis public.hafazan_type not null,
  gred public.academic_grade not null,
  catatan text,
  tarikh date not null,
  guru_id uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tilawah (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  jenis public.tilawah_type not null,
  muka_surat integer check (muka_surat is null or muka_surat > 0),
  juzuk integer check (juzuk is null or juzuk between 1 and 30),
  gred public.academic_grade not null,
  tarikh date not null,
  guru_id uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tilawah_position_check check (
    (jenis = 'iqra' and muka_surat is not null)
    or (jenis = 'quran' and (muka_surat is not null or juzuk is not null))
  )
);

