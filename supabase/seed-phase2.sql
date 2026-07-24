-- Data demo kehadiran Fasa 2.
-- Jalankan selepas supabase/seed.sql.

begin;

with school_days as (
  select day::date as tarikh
  from generate_series(date '2026-07-01', date '2026-07-24', interval '1 day') as day
  where extract(isodow from day) between 1 and 5
), demo_records as (
  select
    s.id as student_id,
    d.tarikh,
    case
      when mod(abs(hashtext(s.id::text || d.tarikh::text)), 29) = 0 then 'cuti'::public.attendance_status
      when mod(abs(hashtext(s.id::text || d.tarikh::text)), 17) = 0 then 'tidak_hadir'::public.attendance_status
      when mod(abs(hashtext(s.id::text || d.tarikh::text)), 11) = 0 then 'lewat'::public.attendance_status
      else 'hadir'::public.attendance_status
    end as status,
    c.guru_id as direkod_oleh
  from public.students s
  join public.classes c on c.id = s.kelas_id
  cross join school_days d
  where s.status = 'aktif' and c.guru_id is not null
)
insert into public.attendance (student_id, tarikh, status, sebab, direkod_oleh)
select
  student_id,
  tarikh,
  status,
  case
    when status = 'cuti' then 'Cuti berkelulusan'
    when status = 'tidak_hadir' then 'Tidak hadir — data demo'
    when status = 'lewat' then 'Tiba selepas waktu mula'
    else null
  end,
  direkod_oleh
from demo_records
on conflict (student_id, tarikh)
do update set
  status = excluded.status,
  sebab = excluded.sebab,
  direkod_oleh = excluded.direkod_oleh,
  updated_at = now();

commit;
