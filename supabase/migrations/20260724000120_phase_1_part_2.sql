create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  nama_subjek text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  nama_peperiksaan text not null,
  penggal integer not null check (penggal between 1 and 3),
  tahun integer not null check (tahun between 2000 and 2100),
  tarikh_mula date not null,
  tarikh_tamat date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exam_date_check check (tarikh_tamat >= tarikh_mula),
  unique (nama_peperiksaan, penggal, tahun)
);

create table if not exists public.exam_results (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  markah numeric(5,2) not null check (markah between 0 and 100),
  gred text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (exam_id, student_id, subject_id)
);

create table if not exists public.behaviour (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  jenis public.behaviour_type not null,
  mata integer not null check (mata > 0),
  catatan text not null,
  tarikh date not null,
  guru_id uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fees (
  id uuid primary key default gen_random_uuid(),
  nama_yuran text not null,
  amaun numeric(10,2) not null check (amaun >= 0),
  jenis public.fee_type not null,
  aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (nama_yuran, jenis)
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  fee_id uuid not null references public.fees(id) on delete restrict,
  bulan integer check (bulan is null or bulan between 1 and 12),
  tahun integer not null check (tahun between 2000 and 2100),
  amaun numeric(10,2) not null check (amaun >= 0),
  status public.invoice_status not null default 'belum_bayar',
  tarikh_bayar timestamptz,
  rujukan_bayaran text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (student_id, fee_id, bulan, tahun),
  constraint invoice_payment_check check (
    (status = 'sudah_bayar' and tarikh_bayar is not null)
    or (status <> 'sudah_bayar')
  )
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  tajuk text not null,
  kandungan text not null,
  target public.announcement_target not null default 'semua',
  class_id uuid references public.classes(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  tarikh timestamptz not null default now(),
  lampiran_url text,
  created_by uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcement_target_check check (
    (target = 'semua' and class_id is null and student_id is null)
    or (target = 'kelas' and class_id is not null and student_id is null)
    or (target = 'individu' and student_id is not null)
  )
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  mesej text not null check (length(trim(mesej)) > 0),
  dibaca boolean not null default false,
  tarikh timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint message_participant_check check (sender_id <> receiver_id)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  tajuk text not null,
  keterangan text,
  tarikh_mula timestamptz not null,
  tarikh_tamat timestamptz not null,
  lokasi text,
  created_by uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_date_check check (tarikh_tamat >= tarikh_mula)
);

create table if not exists public.class_activity_photos (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  uploaded_by uuid not null references public.users(id) on delete restrict,
  storage_path text not null,
  kapsyen text,
  tarikh timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Index untuk semakan RLS dan carian lazim.
create index if not exists idx_classes_guru_id on public.classes(guru_id);
create index if not exists idx_students_kelas_id on public.students(kelas_id);
create index if not exists idx_parents_students_parent on public.parents_students(parent_id);
create index if not exists idx_parents_students_student on public.parents_students(student_id);
create index if not exists idx_attendance_student_date on public.attendance(student_id, tarikh desc);
create index if not exists idx_hafazan_student_date on public.hafazan(student_id, tarikh desc);
create index if not exists idx_tilawah_student_date on public.tilawah(student_id, tarikh desc);
create index if not exists idx_exam_results_student on public.exam_results(student_id, exam_id);
create index if not exists idx_behaviour_student_date on public.behaviour(student_id, tarikh desc);
create index if not exists idx_invoices_student_status on public.invoices(student_id, status);
create index if not exists idx_announcements_class_date on public.announcements(class_id, tarikh desc);
create index if not exists idx_messages_participants on public.messages(sender_id, receiver_id, tarikh desc);
create index if not exists idx_events_dates on public.events(tarikh_mula, tarikh_tamat);

