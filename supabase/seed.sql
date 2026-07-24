-- Seed demo Fasa 1.
-- Untuk Supabase local/dev sahaja. Semua akaun menggunakan kata laluan Demo@1234.

begin;

-- UUID pengguna demo.
-- Admin:  10000000-0000-0000-0000-000000000001
-- Guru 1: 20000000-0000-0000-0000-000000000001
-- Guru 2: 20000000-0000-0000-0000-000000000002
-- Ibu 1-5: 30000000-0000-0000-0000-000000000001 ... 005

insert into auth.users (
  instance_id, id, aud, role, email, phone, encrypted_password,
  email_confirmed_at, phone_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
values
  ('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000001','authenticated','authenticated','admin@demo.madrasah.my','+601110000001',crypt('Demo@1234', gen_salt('bf')),now(),now(),'{"provider":"email","providers":["email"],"role":"admin"}','{"nama":"Admin Madrasah"}',now(),now(),'','','',''),
  ('00000000-0000-0000-0000-000000000000','20000000-0000-0000-0000-000000000001','authenticated','authenticated','guru1@demo.madrasah.my','+601120000001',crypt('Demo@1234', gen_salt('bf')),now(),now(),'{"provider":"email","providers":["email"],"role":"guru"}','{"nama":"Ustaz Ahmad Hakim"}',now(),now(),'','','',''),
  ('00000000-0000-0000-0000-000000000000','20000000-0000-0000-0000-000000000002','authenticated','authenticated','guru2@demo.madrasah.my','+601120000002',crypt('Demo@1234', gen_salt('bf')),now(),now(),'{"provider":"email","providers":["email"],"role":"guru"}','{"nama":"Ustazah Nur Iman"}',now(),now(),'','','',''),
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000001','authenticated','authenticated','ibu1@demo.madrasah.my','+601130000001',crypt('Demo@1234', gen_salt('bf')),now(),now(),'{"provider":"email","providers":["email"],"role":"ibu_bapa"}','{"nama":"Puan Aisyah"}',now(),now(),'','','',''),
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000002','authenticated','authenticated','ibu2@demo.madrasah.my','+601130000002',crypt('Demo@1234', gen_salt('bf')),now(),now(),'{"provider":"email","providers":["email"],"role":"ibu_bapa"}','{"nama":"Encik Firdaus"}',now(),now(),'','','',''),
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000003','authenticated','authenticated','ibu3@demo.madrasah.my','+601130000003',crypt('Demo@1234', gen_salt('bf')),now(),now(),'{"provider":"email","providers":["email"],"role":"ibu_bapa"}','{"nama":"Puan Zulaikha"}',now(),now(),'','','',''),
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000004','authenticated','authenticated','ibu4@demo.madrasah.my','+601130000004',crypt('Demo@1234', gen_salt('bf')),now(),now(),'{"provider":"email","providers":["email"],"role":"ibu_bapa"}','{"nama":"Encik Hamzah"}',now(),now(),'','','',''),
  ('00000000-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000005','authenticated','authenticated','ibu5@demo.madrasah.my','+601130000005',crypt('Demo@1234', gen_salt('bf')),now(),now(),'{"provider":"email","providers":["email"],"role":"ibu_bapa"}','{"nama":"Puan Maryam"}',now(),now(),'','','','')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id,
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
       'email', u.email, now(), now(), now()
from auth.users u
where u.id in (
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0000-000000000004',
  '30000000-0000-0000-0000-000000000005'
)
on conflict (provider_id, provider) do nothing;

-- Pastikan profil wujud walaupun trigger tidak berjalan pada data lama.
insert into public.users (id, nama, email, phone, role, status)
values
  ('10000000-0000-0000-0000-000000000001','Admin Madrasah','admin@demo.madrasah.my','+601110000001','admin','aktif'),
  ('20000000-0000-0000-0000-000000000001','Ustaz Ahmad Hakim','guru1@demo.madrasah.my','+601120000001','guru','aktif'),
  ('20000000-0000-0000-0000-000000000002','Ustazah Nur Iman','guru2@demo.madrasah.my','+601120000002','guru','aktif'),
  ('30000000-0000-0000-0000-000000000001','Puan Aisyah','ibu1@demo.madrasah.my','+601130000001','ibu_bapa','aktif'),
  ('30000000-0000-0000-0000-000000000002','Encik Firdaus','ibu2@demo.madrasah.my','+601130000002','ibu_bapa','aktif'),
  ('30000000-0000-0000-0000-000000000003','Puan Zulaikha','ibu3@demo.madrasah.my','+601130000003','ibu_bapa','aktif'),
  ('30000000-0000-0000-0000-000000000004','Encik Hamzah','ibu4@demo.madrasah.my','+601130000004','ibu_bapa','aktif'),
  ('30000000-0000-0000-0000-000000000005','Puan Maryam','ibu5@demo.madrasah.my','+601130000005','ibu_bapa','aktif')
on conflict (id) do update set
  nama = excluded.nama,
  email = excluded.email,
  phone = excluded.phone,
  role = excluded.role,
  status = excluded.status;

insert into public.classes (id, nama_kelas, tingkatan, guru_id, tahun)
values
  ('40000000-0000-0000-0000-000000000001','1 Al-Fatih','Tahun 1','20000000-0000-0000-0000-000000000001',2026),
  ('40000000-0000-0000-0000-000000000002','2 Al-Biruni','Tahun 2','20000000-0000-0000-0000-000000000002',2026),
  ('40000000-0000-0000-0000-000000000003','3 Ibnu Sina','Tahun 3','20000000-0000-0000-0000-000000000001',2026)
on conflict (id) do update set nama_kelas = excluded.nama_kelas, guru_id = excluded.guru_id;

insert into public.students (id, nama, no_kp, tarikh_lahir, jantina, kelas_id, tahun_masuk, status)
values
  ('50000000-0000-0000-0000-000000000001','Adam Rayyan','190101-11-1001','2019-01-01','lelaki','40000000-0000-0000-0000-000000000001',2026,'aktif'),
  ('50000000-0000-0000-0000-000000000002','Alya Sofea','190215-11-1002','2019-02-15','perempuan','40000000-0000-0000-0000-000000000001',2026,'aktif'),
  ('50000000-0000-0000-0000-000000000003','Irfan Danish','190310-11-1003','2019-03-10','lelaki','40000000-0000-0000-0000-000000000001',2026,'aktif'),
  ('50000000-0000-0000-0000-000000000004','Husna Balqis','190422-11-1004','2019-04-22','perempuan','40000000-0000-0000-0000-000000000001',2026,'aktif'),
  ('50000000-0000-0000-0000-000000000005','Yusuf Harith','190530-11-1005','2019-05-30','lelaki','40000000-0000-0000-0000-000000000001',2026,'aktif'),
  ('50000000-0000-0000-0000-000000000006','Sara Humaira','180112-11-1006','2018-01-12','perempuan','40000000-0000-0000-0000-000000000002',2025,'aktif'),
  ('50000000-0000-0000-0000-000000000007','Imran Qayyum','180228-11-1007','2018-02-28','lelaki','40000000-0000-0000-0000-000000000002',2025,'aktif'),
  ('50000000-0000-0000-0000-000000000008','Mariam Batrisyia','180407-11-1008','2018-04-07','perempuan','40000000-0000-0000-0000-000000000002',2025,'aktif'),
  ('50000000-0000-0000-0000-000000000009','Ammar Ziyad','180619-11-1009','2018-06-19','lelaki','40000000-0000-0000-0000-000000000002',2025,'aktif'),
  ('50000000-0000-0000-0000-000000000010','Nurin Irdina','180731-11-1010','2018-07-31','perempuan','40000000-0000-0000-0000-000000000002',2025,'aktif'),
  ('50000000-0000-0000-0000-000000000011','Luqman Hakim','170118-11-1011','2017-01-18','lelaki','40000000-0000-0000-0000-000000000003',2024,'aktif'),
  ('50000000-0000-0000-0000-000000000012','Dhia Zahra','170304-11-1012','2017-03-04','perempuan','40000000-0000-0000-0000-000000000003',2024,'aktif'),
  ('50000000-0000-0000-0000-000000000013','Arif Muaz','170516-11-1013','2017-05-16','lelaki','40000000-0000-0000-0000-000000000003',2024,'aktif'),
  ('50000000-0000-0000-0000-000000000014','Hana Maisarah','170822-11-1014','2017-08-22','perempuan','40000000-0000-0000-0000-000000000003',2024,'aktif'),
  ('50000000-0000-0000-0000-000000000015','Zaid Aqil','171103-11-1015','2017-11-03','lelaki','40000000-0000-0000-0000-000000000003',2024,'aktif')
on conflict (id) do update set nama = excluded.nama, kelas_id = excluded.kelas_id, status = excluded.status;

-- Seorang penjaga boleh mempunyai lebih daripada seorang anak.
insert into public.parents_students (parent_id, student_id, hubungan)
values
  ('30000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','Ibu'),
  ('30000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000006','Ibu'),
  ('30000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000011','Ibu'),
  ('30000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000002','Bapa'),
  ('30000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000007','Bapa'),
  ('30000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000012','Bapa'),
  ('30000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000003','Ibu'),
  ('30000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000008','Ibu'),
  ('30000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000013','Ibu'),
  ('30000000-0000-0000-0000-000000000004','50000000-0000-0000-0000-000000000004','Bapa'),
  ('30000000-0000-0000-0000-000000000004','50000000-0000-0000-0000-000000000009','Bapa'),
  ('30000000-0000-0000-0000-000000000004','50000000-0000-0000-0000-000000000014','Bapa'),
  ('30000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000005','Ibu'),
  ('30000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000010','Ibu'),
  ('30000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000015','Ibu')
on conflict do nothing;

insert into public.subjects (id, nama_subjek)
values
  ('60000000-0000-0000-0000-000000000001','Al-Quran'),
  ('60000000-0000-0000-0000-000000000002','Akidah'),
  ('60000000-0000-0000-0000-000000000003','Feqah'),
  ('60000000-0000-0000-0000-000000000004','Sirah'),
  ('60000000-0000-0000-0000-000000000005','Bahasa Arab')
on conflict (id) do update set nama_subjek = excluded.nama_subjek;

insert into public.fees (id, nama_yuran, amaun, jenis)
values
  ('70000000-0000-0000-0000-000000000001','Yuran Bulanan',150.00,'bulanan'),
  ('70000000-0000-0000-0000-000000000002','Yuran Aktiviti Tahunan',80.00,'sekali')
on conflict (id) do update set amaun = excluded.amaun;

insert into public.events (id, tajuk, keterangan, tarikh_mula, tarikh_tamat, lokasi, created_by)
values
  ('80000000-0000-0000-0000-000000000001','Hari Terbuka Madrasah','Pertemuan guru dan penjaga.','2026-08-15 08:30+08','2026-08-15 12:30+08','Dewan Utama','10000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

insert into public.announcements (id, tajuk, kandungan, target, tarikh, created_by)
values
  ('90000000-0000-0000-0000-000000000001','Selamat Datang ke Portal Madrasah','Portal demo Fasa 1 telah tersedia untuk semakan akses pengguna.','semua',now(),'10000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

commit;
