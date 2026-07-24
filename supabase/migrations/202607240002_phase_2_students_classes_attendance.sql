-- Sistem Pengurusan Madrasah — Fasa 2
-- Pelajar, kelas dan penyimpanan kehadiran pukal.

begin;

create index if not exists idx_classes_year_name
  on public.classes(tahun desc, nama_kelas);

create index if not exists idx_students_status_class
  on public.students(status, kelas_id, nama);

create index if not exists idx_attendance_date_status
  on public.attendance(tarikh desc, status);

-- Guru kelas dibenarkan membetulkan rekod lama bagi pelajar kelasnya,
-- walaupun rekod asal dimasukkan oleh admin. Nilai direkod_oleh bagi rekod
-- baharu/kemas kini tetap mesti menjadi pengguna semasa.
drop policy if exists attendance_teacher_update on public.attendance;
create policy attendance_teacher_update on public.attendance
for update to authenticated
using (
  public.is_admin()
  or (public.is_teacher() and public.teacher_can_access_student(student_id))
)
with check (
  public.is_admin()
  or (
    public.is_teacher()
    and public.teacher_can_access_student(student_id)
    and direkod_oleh = auth.uid()
  )
);

drop policy if exists attendance_teacher_delete on public.attendance;
create policy attendance_teacher_delete on public.attendance
for delete to authenticated
using (
  public.is_admin()
  or (public.is_teacher() and public.teacher_can_access_student(student_id))
);

-- Simpan satu kelas dalam satu panggilan RPC / transaksi.
-- Contoh p_records:
-- [{"student_id":"...","status":"hadir","sebab":null}]
create or replace function public.save_class_attendance(
  p_class_id uuid,
  p_tarikh date,
  p_records jsonb
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_saved integer := 0;
begin
  if v_actor is null then
    raise exception 'Sesi pengguna tidak sah';
  end if;

  if p_tarikh is null then
    raise exception 'Tarikh diperlukan';
  end if;

  if jsonb_typeof(p_records) is distinct from 'array' then
    raise exception 'Rekod kehadiran mesti dalam bentuk array';
  end if;

  if not public.is_admin()
     and not exists (
       select 1
       from public.classes c
       where c.id = p_class_id
         and c.guru_id = v_actor
     ) then
    raise exception 'Anda tidak dibenarkan merekod kelas ini';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_records)
      as r(student_id uuid, status text, sebab text)
    left join public.students s
      on s.id = r.student_id
     and s.kelas_id = p_class_id
    where s.id is null
  ) then
    raise exception 'Terdapat pelajar yang bukan daripada kelas dipilih';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_records)
      as r(student_id uuid, status text, sebab text)
    where r.status not in ('hadir', 'lewat', 'tidak_hadir', 'cuti')
  ) then
    raise exception 'Status kehadiran tidak sah';
  end if;

  insert into public.attendance (
    student_id,
    tarikh,
    status,
    sebab,
    direkod_oleh
  )
  select
    r.student_id,
    p_tarikh,
    r.status::public.attendance_status,
    nullif(trim(r.sebab), ''),
    v_actor
  from jsonb_to_recordset(p_records)
    as r(student_id uuid, status text, sebab text)
  on conflict (student_id, tarikh)
  do update set
    status = excluded.status,
    sebab = excluded.sebab,
    direkod_oleh = excluded.direkod_oleh,
    updated_at = now();

  get diagnostics v_saved = row_count;
  return v_saved;
end;
$$;

revoke all on function public.save_class_attendance(uuid, date, jsonb) from public;
grant execute on function public.save_class_attendance(uuid, date, jsonb) to authenticated;

commit;
