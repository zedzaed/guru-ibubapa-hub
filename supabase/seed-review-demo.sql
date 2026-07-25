-- Data demo menyeluruh untuk semakan Madrasah Hub.
-- Semua rekod aplikasi ditanda [DEMO] atau menggunakan UUID awalan d...
-- Selamat dijalankan semula: rekod demo dibersihkan dan dibina semula.
-- Akaun demo menggunakan kata laluan sementara Demo@1234.

begin;

create extension if not exists pgcrypto;

-- ============================================================
-- 1. Akaun Auth khusus untuk semakan tiga portal
-- ============================================================

delete from auth.users
where lower(email) in (
  'admin.demo@madrasah.my',
  'guru.demo@madrasah.my',
  'ibubapa.demo@madrasah.my'
)
and id not in (
  'd0000000-0000-4000-8000-000000000001'::uuid,
  'd0000000-0000-4000-8000-000000000002'::uuid,
  'd0000000-0000-4000-8000-000000000003'::uuid
);

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  is_sso_user,
  is_anonymous
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    'd0000000-0000-4000-8000-000000000001',
    'authenticated', 'authenticated', 'admin.demo@madrasah.my',
    crypt('Demo@1234', gen_salt('bf')), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama":"[DEMO] Admin Semakan","phone":"+601190000001","role":"admin"}'::jsonb,
    now(), now(), '', '', '', '', false, false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'd0000000-0000-4000-8000-000000000002',
    'authenticated', 'authenticated', 'guru.demo@madrasah.my',
    crypt('Demo@1234', gen_salt('bf')), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama":"[DEMO] Ustaz Hakim","phone":"+601190000002","role":"guru"}'::jsonb,
    now(), now(), '', '', '', '', false, false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'd0000000-0000-4000-8000-000000000003',
    'authenticated', 'authenticated', 'ibubapa.demo@madrasah.my',
    crypt('Demo@1234', gen_salt('bf')), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nama":"[DEMO] Puan Aisyah","phone":"+601190000003","role":"ibu_bapa"}'::jsonb,
    now(), now(), '', '', '', '', false, false
  )
on conflict (id) do update set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  confirmed_at = excluded.confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now(),
  deleted_at = null,
  banned_until = null,
  is_sso_user = false,
  is_anonymous = false;

insert into auth.identities (
  id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, email
)
select
  gen_random_uuid(),
  u.email,
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', now(), now(), now(), u.email
from auth.users u
where u.id in (
  'd0000000-0000-4000-8000-000000000001',
  'd0000000-0000-4000-8000-000000000002',
  'd0000000-0000-4000-8000-000000000003'
)
on conflict (provider_id, provider) do update set
  user_id = excluded.user_id,
  identity_data = excluded.identity_data,
  email = excluded.email,
  updated_at = now();

insert into public.profiles (id, nama, email, phone, status)
values
  ('d0000000-0000-4000-8000-000000000001','[DEMO] Admin Semakan','admin.demo@madrasah.my','+601190000001','aktif'),
  ('d0000000-0000-4000-8000-000000000002','[DEMO] Ustaz Hakim','guru.demo@madrasah.my','+601190000002','aktif'),
  ('d0000000-0000-4000-8000-000000000003','[DEMO] Puan Aisyah','ibubapa.demo@madrasah.my','+601190000003','aktif')
on conflict (id) do update set
  nama = excluded.nama,
  email = excluded.email,
  phone = excluded.phone,
  status = 'aktif',
  updated_at = now();

delete from public.user_roles
where user_id in (
  'd0000000-0000-4000-8000-000000000001',
  'd0000000-0000-4000-8000-000000000002',
  'd0000000-0000-4000-8000-000000000003'
);

insert into public.user_roles (user_id, role)
values
  ('d0000000-0000-4000-8000-000000000001','admin'),
  ('d0000000-0000-4000-8000-000000000002','guru'),
  ('d0000000-0000-4000-8000-000000000003','ibu_bapa');

-- ============================================================
-- 2. Bersihkan data demo lama sebelum bina semula
-- ============================================================

delete from public.messages
where id::text like 'd8000000-%'
   or sender_id in ('d0000000-0000-4000-8000-000000000002','d0000000-0000-4000-8000-000000000003')
   or receiver_id in ('d0000000-0000-4000-8000-000000000002','d0000000-0000-4000-8000-000000000003');

delete from public.announcements where id::text like 'd6000000-%';
delete from public.events where id::text like 'd7000000-%';

delete from public.exam_results
where exam_id::text like 'd4000000-%'
   or student_id::text like 'd2000000-%'
   or subject_id::text like 'd3000000-%';
delete from public.exams where id::text like 'd4000000-%';
delete from public.subjects where id::text like 'd3000000-%';

delete from public.invoices
where student_id::text like 'd2000000-%'
   or fee_id::text like 'd5000000-%';
delete from public.fees where id::text like 'd5000000-%';

delete from public.behaviour where student_id::text like 'd2000000-%';
delete from public.hafazan where student_id::text like 'd2000000-%';
delete from public.tilawah where student_id::text like 'd2000000-%';
delete from public.attendance where student_id::text like 'd2000000-%';
delete from public.parents_students
where parent_id = 'd0000000-0000-4000-8000-000000000003'
   or student_id::text like 'd2000000-%';
delete from public.students where id::text like 'd2000000-%';
delete from public.classes where id::text like 'd1000000-%';
delete from public.infaq_submissions where reference_no like 'DEMO-%' or id::text like 'd9000000-%';

-- ============================================================
-- 3. Kelas, pelajar dan kaitan penjaga
-- ============================================================

insert into public.classes (id, nama_kelas, tingkatan, guru_id, tahun)
values
  ('d1000000-0000-4000-8000-000000000001','[DEMO] 1 Al-Fatih','Tahun 1','d0000000-0000-4000-8000-000000000002',2026),
  ('d1000000-0000-4000-8000-000000000002','[DEMO] 2 Al-Biruni','Tahun 2','d0000000-0000-4000-8000-000000000002',2026),
  ('d1000000-0000-4000-8000-000000000003','[DEMO] 3 Ibnu Sina','Tahun 3','d0000000-0000-4000-8000-000000000002',2026)
on conflict (id) do update set
  nama_kelas = excluded.nama_kelas,
  tingkatan = excluded.tingkatan,
  guru_id = excluded.guru_id,
  tahun = excluded.tahun,
  updated_at = now();

insert into public.students (id, nama, no_kp, tarikh_lahir, jantina, kelas_id, tahun_masuk, status)
values
  ('d2000000-0000-4000-8000-000000000001','[DEMO] Adam Rayyan','DEMO-PELAJAR-001','2019-01-10','lelaki','d1000000-0000-4000-8000-000000000001',2026,'aktif'),
  ('d2000000-0000-4000-8000-000000000002','[DEMO] Alya Sofea','DEMO-PELAJAR-002','2019-02-15','perempuan','d1000000-0000-4000-8000-000000000001',2026,'aktif'),
  ('d2000000-0000-4000-8000-000000000003','[DEMO] Irfan Danish','DEMO-PELAJAR-003','2019-03-21','lelaki','d1000000-0000-4000-8000-000000000001',2026,'aktif'),
  ('d2000000-0000-4000-8000-000000000004','[DEMO] Husna Balqis','DEMO-PELAJAR-004','2019-05-08','perempuan','d1000000-0000-4000-8000-000000000001',2026,'aktif'),
  ('d2000000-0000-4000-8000-000000000005','[DEMO] Sara Humaira','DEMO-PELAJAR-005','2018-01-12','perempuan','d1000000-0000-4000-8000-000000000002',2025,'aktif'),
  ('d2000000-0000-4000-8000-000000000006','[DEMO] Imran Qayyum','DEMO-PELAJAR-006','2018-02-28','lelaki','d1000000-0000-4000-8000-000000000002',2025,'aktif'),
  ('d2000000-0000-4000-8000-000000000007','[DEMO] Mariam Batrisyia','DEMO-PELAJAR-007','2018-04-07','perempuan','d1000000-0000-4000-8000-000000000002',2025,'aktif'),
  ('d2000000-0000-4000-8000-000000000008','[DEMO] Ammar Ziyad','DEMO-PELAJAR-008','2018-06-19','lelaki','d1000000-0000-4000-8000-000000000002',2025,'aktif'),
  ('d2000000-0000-4000-8000-000000000009','[DEMO] Luqman Hakim','DEMO-PELAJAR-009','2017-01-18','lelaki','d1000000-0000-4000-8000-000000000003',2024,'aktif'),
  ('d2000000-0000-4000-8000-000000000010','[DEMO] Dhia Zahra','DEMO-PELAJAR-010','2017-03-04','perempuan','d1000000-0000-4000-8000-000000000003',2024,'aktif'),
  ('d2000000-0000-4000-8000-000000000011','[DEMO] Arif Muaz','DEMO-PELAJAR-011','2017-05-16','lelaki','d1000000-0000-4000-8000-000000000003',2024,'aktif'),
  ('d2000000-0000-4000-8000-000000000012','[DEMO] Hana Maisarah','DEMO-PELAJAR-012','2017-08-22','perempuan','d1000000-0000-4000-8000-000000000003',2024,'aktif')
on conflict (id) do update set
  nama = excluded.nama,
  no_kp = excluded.no_kp,
  tarikh_lahir = excluded.tarikh_lahir,
  jantina = excluded.jantina,
  kelas_id = excluded.kelas_id,
  tahun_masuk = excluded.tahun_masuk,
  status = excluded.status,
  updated_at = now();

insert into public.parents_students (parent_id, student_id, hubungan)
values
  ('d0000000-0000-4000-8000-000000000003','d2000000-0000-4000-8000-000000000001','ibu'),
  ('d0000000-0000-4000-8000-000000000003','d2000000-0000-4000-8000-000000000005','ibu'),
  ('d0000000-0000-4000-8000-000000000003','d2000000-0000-4000-8000-000000000009','ibu')
on conflict (parent_id, student_id) do update set hubungan = excluded.hubungan;

-- ============================================================
-- 4. Kehadiran dua minggu dengan pelbagai status
-- ============================================================

with school_days as (
  select day::date as tarikh
  from generate_series(date '2026-07-13', date '2026-07-24', interval '1 day') day
  where extract(isodow from day) between 1 and 5
), demo_students as (
  select id
  from public.students
  where id::text like 'd2000000-%'
), records as (
  select
    s.id student_id,
    d.tarikh,
    case
      when mod(abs(hashtext(s.id::text || d.tarikh::text)), 23) = 0 then 'cuti'::public.attendance_status
      when mod(abs(hashtext(s.id::text || d.tarikh::text)), 17) = 0 then 'tidak_hadir'::public.attendance_status
      when mod(abs(hashtext(s.id::text || d.tarikh::text)), 11) = 0 then 'lewat'::public.attendance_status
      else 'hadir'::public.attendance_status
    end status
  from demo_students s cross join school_days d
)
insert into public.attendance (student_id, tarikh, status, sebab, direkod_oleh)
select
  student_id,
  tarikh,
  status,
  case
    when status = 'cuti' then '[DEMO] Cuti berkelulusan'
    when status = 'tidak_hadir' then '[DEMO] Tidak hadir kerana demam'
    when status = 'lewat' then '[DEMO] Tiba selepas waktu mula'
    else null
  end,
  'd0000000-0000-4000-8000-000000000002'
from records
on conflict (student_id, tarikh) do update set
  status = excluded.status,
  sebab = excluded.sebab,
  direkod_oleh = excluded.direkod_oleh,
  updated_at = now();

-- ============================================================
-- 5. Hafazan, tilawah dan akhlak
-- ============================================================

with ds as (
  select id, row_number() over (order by id)::int n
  from public.students where id::text like 'd2000000-%'
)
insert into public.hafazan (id, student_id, surah, ayat_mula, ayat_akhir, jenis, gred, catatan, tarikh, guru_id)
select gen_random_uuid(), id, 'Al-Fatihah', 1, 7, 'hafazan_baru',
  case mod(n,4) when 0 then 'mumtaz'::public.gred_hafazan when 1 then 'jayyid_jiddan'::public.gred_hafazan when 2 then 'jayyid'::public.gred_hafazan else 'dhaif'::public.gred_hafazan end,
  '[DEMO] Hafazan baharu — perhatikan tajwid dan kelancaran.', date '2026-07-21', 'd0000000-0000-4000-8000-000000000002'
from ds
union all
select gen_random_uuid(), id, 'An-Nas', 1, 6, 'murajaah',
  case when mod(n,3)=0 then 'jayyid'::public.gred_hafazan else 'mumtaz'::public.gred_hafazan end,
  '[DEMO] Murajaah mingguan.', date '2026-07-23', 'd0000000-0000-4000-8000-000000000002'
from ds;

with ds as (
  select id, row_number() over (order by id)::int n
  from public.students where id::text like 'd2000000-%'
)
insert into public.tilawah (id, student_id, jenis, muka_surat, juzuk, gred, tarikh, guru_id)
select
  gen_random_uuid(), id,
  case when n <= 4 then 'iqra'::public.tilawah_jenis else 'quran'::public.tilawah_jenis end,
  10 + n,
  case when n <= 4 then null else greatest(1, ceil(n / 4.0)::int) end,
  case mod(n,4) when 0 then 'mumtaz'::public.gred_hafazan when 1 then 'jayyid_jiddan'::public.gred_hafazan when 2 then 'jayyid'::public.gred_hafazan else 'dhaif'::public.gred_hafazan end,
  date '2026-07-22',
  'd0000000-0000-4000-8000-000000000002'
from ds;

with ds as (
  select id, row_number() over (order by id)::int n
  from public.students where id::text like 'd2000000-%'
)
insert into public.behaviour (id, student_id, jenis, mata, catatan, tarikh, guru_id)
select gen_random_uuid(), id, 'merit', 5, '[DEMO] Membantu rakan dan menjaga kebersihan kelas.', date '2026-07-20', 'd0000000-0000-4000-8000-000000000002'
from ds
union all
select gen_random_uuid(), id, 'demerit', -2, '[DEMO] Perlu bimbingan untuk hadir tepat pada masa.', date '2026-07-24', 'd0000000-0000-4000-8000-000000000002'
from ds where mod(n,4)=0;

-- ============================================================
-- 6. Subjek, peperiksaan dan keputusan
-- ============================================================

insert into public.subjects (id, nama_subjek)
values
  ('d3000000-0000-4000-8000-000000000001','[DEMO] Al-Quran'),
  ('d3000000-0000-4000-8000-000000000002','[DEMO] Akidah'),
  ('d3000000-0000-4000-8000-000000000003','[DEMO] Feqah'),
  ('d3000000-0000-4000-8000-000000000004','[DEMO] Sirah'),
  ('d3000000-0000-4000-8000-000000000005','[DEMO] Bahasa Arab')
on conflict (id) do update set nama_subjek = excluded.nama_subjek;

insert into public.exams (id, nama_peperiksaan, penggal, tahun, tarikh_mula, tarikh_tamat)
values
  ('d4000000-0000-4000-8000-000000000001','[DEMO] Ujian Pertengahan Tahun',1,2026,'2026-06-15','2026-06-19'),
  ('d4000000-0000-4000-8000-000000000002','[DEMO] Penilaian Al-Quran',2,2026,'2026-07-20','2026-07-22')
on conflict (id) do update set
  nama_peperiksaan = excluded.nama_peperiksaan,
  penggal = excluded.penggal,
  tahun = excluded.tahun,
  tarikh_mula = excluded.tarikh_mula,
  tarikh_tamat = excluded.tarikh_tamat;

with combinations as (
  select e.id exam_id, s.id student_id, sub.id subject_id,
    (60 + mod(abs(hashtext(e.id::text || s.id::text || sub.id::text)), 39))::numeric markah
  from public.exams e
  cross join public.students s
  cross join public.subjects sub
  where e.id::text like 'd4000000-%'
    and s.id::text like 'd2000000-%'
    and sub.id::text like 'd3000000-%'
)
insert into public.exam_results (id, exam_id, student_id, subject_id, markah, gred)
select
  gen_random_uuid(), exam_id, student_id, subject_id, markah,
  case
    when markah >= 85 then 'A'
    when markah >= 70 then 'B'
    when markah >= 55 then 'C'
    when markah >= 40 then 'D'
    else 'E'
  end
from combinations
on conflict (exam_id, student_id, subject_id) do update set
  markah = excluded.markah,
  gred = excluded.gred,
  updated_at = now();

-- ============================================================
-- 7. Yuran dan invois dengan pelbagai status
-- ============================================================

insert into public.fees (id, nama_yuran, amaun, jenis)
values
  ('d5000000-0000-4000-8000-000000000001','[DEMO] Yuran Bulanan',150.00,'bulanan'),
  ('d5000000-0000-4000-8000-000000000002','[DEMO] Yuran Aktiviti Tahunan',80.00,'sekali'),
  ('d5000000-0000-4000-8000-000000000003','[DEMO] Kem Tahfiz',50.00,'sekali')
on conflict (id) do update set
  nama_yuran = excluded.nama_yuran,
  amaun = excluded.amaun,
  jenis = excluded.jenis;

with ds as (
  select id, row_number() over (order by id)::int n
  from public.students where id::text like 'd2000000-%'
)
insert into public.invoices (id, student_id, fee_id, bulan, tahun, amaun, status, tarikh_bayar, rujukan_bayaran)
select
  gen_random_uuid(), id, 'd5000000-0000-4000-8000-000000000001', 7, 2026, 150.00,
  case when mod(n,4)=0 then 'tertunggak'::public.invoice_status when mod(n,3)=0 then 'belum_bayar'::public.invoice_status else 'sudah_bayar'::public.invoice_status end,
  case when mod(n,4)<>0 and mod(n,3)<>0 then date '2026-07-05' + (n % 5) else null end,
  case when mod(n,4)<>0 and mod(n,3)<>0 then 'DEMO-BYR-' || lpad(n::text,3,'0') else null end
from ds
union all
select
  gen_random_uuid(), id, 'd5000000-0000-4000-8000-000000000002', null, 2026, 80.00,
  case when mod(n,2)=0 then 'sudah_bayar'::public.invoice_status else 'belum_bayar'::public.invoice_status end,
  case when mod(n,2)=0 then date '2026-02-10' else null end,
  case when mod(n,2)=0 then 'DEMO-AKT-' || lpad(n::text,3,'0') else null end
from ds;

-- ============================================================
-- 8. Pengumuman, kalendar dan mesej
-- ============================================================

insert into public.announcements (id, tajuk, kandungan, target, class_id, student_id, tarikh, created_by)
values
  ('d6000000-0000-4000-8000-000000000001','[DEMO] Selamat Datang ke Madrasah Hub','Ini pengumuman umum untuk semua Admin, Guru dan Ibu Bapa.','semua',null,null,'2026-07-18','d0000000-0000-4000-8000-000000000001'),
  ('d6000000-0000-4000-8000-000000000002','[DEMO] Latihan Hafazan Kelas 1','Murid Kelas 1 diminta mengulang Surah Al-Fatihah di rumah.','kelas','d1000000-0000-4000-8000-000000000001',null,'2026-07-21','d0000000-0000-4000-8000-000000000002'),
  ('d6000000-0000-4000-8000-000000000003','[DEMO] Tahniah Adam Rayyan','Pencapaian hafazan minggu ini sangat baik.','individu',null,'d2000000-0000-4000-8000-000000000001','2026-07-23','d0000000-0000-4000-8000-000000000002'),
  ('d6000000-0000-4000-8000-000000000004','[DEMO] Notis Bayaran Yuran','Sila semak status invois bulan Julai dalam portal.','semua',null,null,'2026-07-24','d0000000-0000-4000-8000-000000000001')
on conflict (id) do update set
  tajuk = excluded.tajuk,
  kandungan = excluded.kandungan,
  target = excluded.target,
  class_id = excluded.class_id,
  student_id = excluded.student_id,
  tarikh = excluded.tarikh,
  created_by = excluded.created_by;

insert into public.events (id, tajuk, keterangan, tarikh_mula, tarikh_tamat, lokasi)
values
  ('d7000000-0000-4000-8000-000000000001','[DEMO] Hari Terbuka Madrasah','Pertemuan guru dan penjaga.','2026-08-01 08:30+08','2026-08-01 12:30+08','Dewan Utama'),
  ('d7000000-0000-4000-8000-000000000002','[DEMO] Majlis Tahlil Mingguan','Bacaan tahlil bersama pelajar dan warga madrasah.','2026-07-31 20:30+08','2026-07-31 21:30+08','Surau Madrasah'),
  ('d7000000-0000-4000-8000-000000000003','[DEMO] Kem Tahfiz Cilik','Program pengukuhan hafazan sehari.','2026-08-08 08:00+08','2026-08-08 17:00+08','Kompleks Madrasah'),
  ('d7000000-0000-4000-8000-000000000004','[DEMO] Cuti Pertengahan Penggal','Madrasah ditutup sempena cuti penggal.','2026-08-20 00:00+08','2026-08-23 23:59+08','Madrasah')
on conflict (id) do update set
  tajuk = excluded.tajuk,
  keterangan = excluded.keterangan,
  tarikh_mula = excluded.tarikh_mula,
  tarikh_tamat = excluded.tarikh_tamat,
  lokasi = excluded.lokasi;

insert into public.messages (id, sender_id, receiver_id, student_id, mesej, dibaca, tarikh)
values
  ('d8000000-0000-4000-8000-000000000001','d0000000-0000-4000-8000-000000000003','d0000000-0000-4000-8000-000000000002','d2000000-0000-4000-8000-000000000001','[DEMO] Assalamualaikum ustaz, bagaimana perkembangan hafazan Adam?',true,'2026-07-22 09:15+08'),
  ('d8000000-0000-4000-8000-000000000002','d0000000-0000-4000-8000-000000000002','d0000000-0000-4000-8000-000000000003','d2000000-0000-4000-8000-000000000001','[DEMO] Waalaikumussalam. Adam semakin lancar dan boleh teruskan murajaah di rumah.',true,'2026-07-22 10:05+08'),
  ('d8000000-0000-4000-8000-000000000003','d0000000-0000-4000-8000-000000000003','d0000000-0000-4000-8000-000000000002','d2000000-0000-4000-8000-000000000005','[DEMO] Sara tidak dapat hadir esok kerana temu janji klinik.',true,'2026-07-23 18:20+08'),
  ('d8000000-0000-4000-8000-000000000004','d0000000-0000-4000-8000-000000000002','d0000000-0000-4000-8000-000000000003','d2000000-0000-4000-8000-000000000005','[DEMO] Baik puan, saya catatkan sebagai cuti.',true,'2026-07-23 18:32+08'),
  ('d8000000-0000-4000-8000-000000000005','d0000000-0000-4000-8000-000000000002','d0000000-0000-4000-8000-000000000003','d2000000-0000-4000-8000-000000000009','[DEMO] Luqman terpilih menyertai persembahan Hari Terbuka.',false,'2026-07-24 14:10+08'),
  ('d8000000-0000-4000-8000-000000000006','d0000000-0000-4000-8000-000000000003','d0000000-0000-4000-8000-000000000002','d2000000-0000-4000-8000-000000000009','[DEMO] Alhamdulillah, terima kasih atas makluman.',false,'2026-07-24 15:02+08')
on conflict (id) do update set
  sender_id = excluded.sender_id,
  receiver_id = excluded.receiver_id,
  student_id = excluded.student_id,
  mesej = excluded.mesej,
  dibaca = excluded.dibaca,
  tarikh = excluded.tarikh;

-- ============================================================
-- 9. Tetapan dan rekod Infaq & Tahlil
-- ============================================================

update public.infaq_settings
set
  organization_name = '[DEMO] Madrasah Al-Hidayah',
  address = 'Jalan Contoh 1, 21000 Kuala Terengganu, Terengganu',
  phone = '09-000 0000',
  bank_name = 'BANK DEMO — JANGAN BUAT BAYARAN',
  account_name = '[DEMO] TABUNG INFAQ MADRASAH',
  account_number = '0000 0000 0000',
  qr_image_url = '/demo-qr-infaq.svg',
  payment_instructions = 'DEMO SAHAJA — jangan buat bayaran sebenar. Gunakan borang ini untuk menyemak aliran QR, bukti pembayaran dan pengesahan admin.',
  receipt_prefix = 'DEMO-INF',
  tahlil_day = 5,
  tahlil_time = '20:30',
  form_active = true,
  email_subject = '[DEMO] Pengesahan Infaq dan Resit Rasmi',
  email_body = 'Ini ialah e-mel demo bagi semakan aliran resit Infaq dan Tahlil.',
  updated_at = now()
where id = 1;

select setval('public.infaq_receipt_seq', greatest(100, (select last_value from public.infaq_receipt_seq)), true);

insert into public.infaq_submissions (
  id, reference_no, source, donor_name, email, phone, amount, tahlil_names, intention,
  is_private, payment_date, status, admin_note, verified_by, verified_at, tahlil_week,
  tahlil_completed_at, receipt_no, receipt_issued_at, email_sent_at, email_error, created_at, updated_at
)
values
  ('d9000000-0000-4000-8000-000000000001','DEMO-260725-001','public','[DEMO] Ahmad Firdaus','penginfaq1.demo@example.com','+601180000001',20.00,'Allahyarham Hassan bin Ali','Sedekah atas nama keluarga.',false,'2026-07-25','menunggu',null,null,null,null,null,null,null,null,null,'2026-07-25 08:15+08','2026-07-25 08:15+08'),
  ('d9000000-0000-4000-8000-000000000002','DEMO-260725-002','public','[DEMO] Nur Hidayah','penginfaq2.demo@example.com','+601180000002',50.00,'Allahyarhamah Aminah binti Omar','Mohon dimasukkan dalam bacaan minggu ini.',false,'2026-07-25','perlu_bukti_baharu','[DEMO] Gambar bukti bayaran kabur. Sila hantar semula.',null,null,null,null,null,null,null,null,'2026-07-25 09:00+08','2026-07-25 10:00+08'),
  ('d9000000-0000-4000-8000-000000000003','DEMO-260725-003','public','[DEMO] Hamba Allah','penginfaq3.demo@example.com','+601180000003',30.00,'Keluarga Abdullah','Mohon kesihatan dan dipermudahkan urusan.',true,'2026-07-24','ditolak','[DEMO] Transaksi tidak ditemui dalam penyata bank.',null,null,null,null,null,null,null,null,'2026-07-24 11:30+08','2026-07-25 09:30+08'),
  ('d9000000-0000-4000-8000-000000000004','DEMO-260724-004','admin','[DEMO] Siti Maryam','penginfaq4.demo@example.com','+601180000004',100.00,'Allahyarham Ismail bin Yusof, Allahyarhamah Zainab binti Musa','Infaq tunai di pejabat madrasah.',false,'2026-07-24','dijadualkan','[DEMO] Bayaran tunai diterima oleh admin.','d0000000-0000-4000-8000-000000000001','2026-07-24 13:00+08','2026-07-31',null,'DEMO-RESIT-0001','2026-07-24 13:01+08',null,null,'2026-07-24 12:55+08','2026-07-24 13:01+08'),
  ('d9000000-0000-4000-8000-000000000005','DEMO-260718-005','public','[DEMO] Mohd Azlan','penginfaq5.demo@example.com','+601180000005',80.00,'Allahyarham Rahman bin Salleh','Infaq mingguan.',false,'2026-07-18','selesai','[DEMO] Bacaan selesai pada malam Jumaat.','d0000000-0000-4000-8000-000000000001','2026-07-18 15:20+08','2026-07-24','2026-07-24 21:30+08','DEMO-RESIT-0002','2026-07-18 15:21+08','2026-07-18 15:22+08',null,'2026-07-18 14:40+08','2026-07-24 21:30+08'),
  ('d9000000-0000-4000-8000-000000000006','DEMO-260720-006','admin','[DEMO] Puan Salmah','penginfaq6.demo@example.com','+601180000006',200.00,'Arwah ibu bapa dan seluruh ahli keluarga','Rekod manual oleh pihak pejabat.',false,'2026-07-20','dijadualkan','[DEMO] Rekod bayaran manual.','d0000000-0000-4000-8000-000000000001','2026-07-20 16:00+08','2026-07-31',null,'DEMO-RESIT-0003','2026-07-20 16:01+08',null,'[DEMO] E-mel belum dihantar kerana RESEND_API_KEY belum disediakan.','2026-07-20 15:45+08','2026-07-20 16:01+08')
on conflict (id) do update set
  reference_no = excluded.reference_no,
  source = excluded.source,
  donor_name = excluded.donor_name,
  email = excluded.email,
  phone = excluded.phone,
  amount = excluded.amount,
  tahlil_names = excluded.tahlil_names,
  intention = excluded.intention,
  is_private = excluded.is_private,
  payment_date = excluded.payment_date,
  status = excluded.status,
  admin_note = excluded.admin_note,
  verified_by = excluded.verified_by,
  verified_at = excluded.verified_at,
  tahlil_week = excluded.tahlil_week,
  tahlil_completed_at = excluded.tahlil_completed_at,
  receipt_no = excluded.receipt_no,
  receipt_issued_at = excluded.receipt_issued_at,
  email_sent_at = excluded.email_sent_at,
  email_error = excluded.email_error,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

commit;
