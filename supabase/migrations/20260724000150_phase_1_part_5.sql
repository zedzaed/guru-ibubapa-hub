-- =========================
-- ENABLE RLS
-- =========================
alter table public.users enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.parents_students enable row level security;
alter table public.attendance enable row level security;
alter table public.hafazan enable row level security;
alter table public.tilawah enable row level security;
alter table public.subjects enable row level security;
alter table public.exams enable row level security;
alter table public.exam_results enable row level security;
alter table public.behaviour enable row level security;
alter table public.fees enable row level security;
alter table public.invoices enable row level security;
alter table public.announcements enable row level security;
alter table public.messages enable row level security;
alter table public.events enable row level security;
alter table public.class_activity_photos enable row level security;

-- =========================
-- RLS POLICIES
-- =========================
-- users
drop policy if exists users_select_related on public.users;
create policy users_select_related on public.users
for select to authenticated
using (public.can_read_user(id));

drop policy if exists users_admin_insert on public.users;
create policy users_admin_insert on public.users
for insert to authenticated
with check (public.is_admin());

drop policy if exists users_update_self_or_admin on public.users;
create policy users_update_self_or_admin on public.users
for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists users_admin_delete on public.users;
create policy users_admin_delete on public.users
for delete to authenticated
using (public.is_admin());

-- classes
drop policy if exists classes_select_accessible on public.classes;
create policy classes_select_accessible on public.classes
for select to authenticated
using (public.can_access_class(id));

drop policy if exists classes_admin_all on public.classes;
create policy classes_admin_all on public.classes
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- students
drop policy if exists students_select_accessible on public.students;
create policy students_select_accessible on public.students
for select to authenticated
using (public.can_access_student(id));

drop policy if exists students_admin_all on public.students;
create policy students_admin_all on public.students
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- parents_students
drop policy if exists parents_students_select_accessible on public.parents_students;
create policy parents_students_select_accessible on public.parents_students
for select to authenticated
using (
  public.is_admin()
  or parent_id = auth.uid()
  or public.teacher_can_access_student(student_id)
);

drop policy if exists parents_students_admin_all on public.parents_students;
create policy parents_students_admin_all on public.parents_students
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

