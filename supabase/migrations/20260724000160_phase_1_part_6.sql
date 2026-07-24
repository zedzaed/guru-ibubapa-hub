-- attendance
drop policy if exists attendance_select_accessible on public.attendance;
create policy attendance_select_accessible on public.attendance
for select to authenticated
using (public.can_access_student(student_id));

drop policy if exists attendance_teacher_insert on public.attendance;
create policy attendance_teacher_insert on public.attendance
for insert to authenticated
with check (
  (public.is_teacher() and public.teacher_can_access_student(student_id) and direkod_oleh = auth.uid())
  or public.is_admin()
);

drop policy if exists attendance_teacher_update on public.attendance;
create policy attendance_teacher_update on public.attendance
for update to authenticated
using (
  (public.is_teacher() and public.teacher_can_access_student(student_id) and direkod_oleh = auth.uid())
  or public.is_admin()
)
with check (
  (public.is_teacher() and public.teacher_can_access_student(student_id) and direkod_oleh = auth.uid())
  or public.is_admin()
);

drop policy if exists attendance_teacher_delete on public.attendance;
create policy attendance_teacher_delete on public.attendance
for delete to authenticated
using (
  (public.is_teacher() and public.teacher_can_access_student(student_id) and direkod_oleh = auth.uid())
  or public.is_admin()
);

-- hafazan
drop policy if exists hafazan_select_accessible on public.hafazan;
create policy hafazan_select_accessible on public.hafazan
for select to authenticated
using (public.can_access_student(student_id));

drop policy if exists hafazan_teacher_write on public.hafazan;
create policy hafazan_teacher_write on public.hafazan
for all to authenticated
using (
  public.is_admin()
  or (public.is_teacher() and guru_id = auth.uid() and public.teacher_can_access_student(student_id))
)
with check (
  public.is_admin()
  or (public.is_teacher() and guru_id = auth.uid() and public.teacher_can_access_student(student_id))
);

-- tilawah
drop policy if exists tilawah_select_accessible on public.tilawah;
create policy tilawah_select_accessible on public.tilawah
for select to authenticated
using (public.can_access_student(student_id));

drop policy if exists tilawah_teacher_write on public.tilawah;
create policy tilawah_teacher_write on public.tilawah
for all to authenticated
using (
  public.is_admin()
  or (public.is_teacher() and guru_id = auth.uid() and public.teacher_can_access_student(student_id))
)
with check (
  public.is_admin()
  or (public.is_teacher() and guru_id = auth.uid() and public.teacher_can_access_student(student_id))
);

-- subjects
drop policy if exists subjects_read_all_authenticated on public.subjects;
create policy subjects_read_all_authenticated on public.subjects
for select to authenticated using (true);

drop policy if exists subjects_admin_all on public.subjects;
create policy subjects_admin_all on public.subjects
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- exams
drop policy if exists exams_read_all_authenticated on public.exams;
create policy exams_read_all_authenticated on public.exams
for select to authenticated using (true);

drop policy if exists exams_admin_all on public.exams;
create policy exams_admin_all on public.exams
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- exam_results
drop policy if exists exam_results_select_accessible on public.exam_results;
create policy exam_results_select_accessible on public.exam_results
for select to authenticated
using (public.can_access_student(student_id));

drop policy if exists exam_results_teacher_write on public.exam_results;
create policy exam_results_teacher_write on public.exam_results
for all to authenticated
using (
  public.is_admin()
  or (public.is_teacher() and public.teacher_can_access_student(student_id))
)
with check (
  public.is_admin()
  or (public.is_teacher() and public.teacher_can_access_student(student_id))
);

