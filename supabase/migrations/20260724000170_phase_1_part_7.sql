-- behaviour
drop policy if exists behaviour_select_accessible on public.behaviour;
create policy behaviour_select_accessible on public.behaviour
for select to authenticated
using (public.can_access_student(student_id));

drop policy if exists behaviour_teacher_write on public.behaviour;
create policy behaviour_teacher_write on public.behaviour
for all to authenticated
using (
  public.is_admin()
  or (public.is_teacher() and guru_id = auth.uid() and public.teacher_can_access_student(student_id))
)
with check (
  public.is_admin()
  or (public.is_teacher() and guru_id = auth.uid() and public.teacher_can_access_student(student_id))
);

-- fees
drop policy if exists fees_read_all_authenticated on public.fees;
create policy fees_read_all_authenticated on public.fees
for select to authenticated using (true);

drop policy if exists fees_admin_all on public.fees;
create policy fees_admin_all on public.fees
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- invoices
drop policy if exists invoices_select_admin_or_parent on public.invoices;
create policy invoices_select_admin_or_parent on public.invoices
for select to authenticated
using (public.is_admin() or public.parent_can_access_student(student_id));

drop policy if exists invoices_admin_all on public.invoices;
create policy invoices_admin_all on public.invoices
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- announcements
drop policy if exists announcements_select_visible on public.announcements;
create policy announcements_select_visible on public.announcements
for select to authenticated
using (
  public.is_admin()
  or target = 'semua'
  or (target = 'kelas' and public.can_access_class(class_id))
  or (target = 'individu' and public.can_access_student(student_id))
);

drop policy if exists announcements_admin_all on public.announcements;
create policy announcements_admin_all on public.announcements
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists announcements_teacher_class_write on public.announcements;
create policy announcements_teacher_class_write on public.announcements
for all to authenticated
using (
  public.is_teacher()
  and created_by = auth.uid()
  and target = 'kelas'
  and class_id is not null
  and public.can_access_class(class_id)
)
with check (
  public.is_teacher()
  and created_by = auth.uid()
  and target = 'kelas'
  and class_id is not null
  and public.can_access_class(class_id)
);

-- messages
drop policy if exists messages_select_participant on public.messages;
create policy messages_select_participant on public.messages
for select to authenticated
using (public.is_admin() or sender_id = auth.uid() or receiver_id = auth.uid());

drop policy if exists messages_insert_allowed_pair on public.messages;
create policy messages_insert_allowed_pair on public.messages
for insert to authenticated
with check (
  sender_id = auth.uid()
  and public.message_pair_allowed(student_id, receiver_id)
);

drop policy if exists messages_update_receiver on public.messages;
create policy messages_update_receiver on public.messages
for update to authenticated
using (public.is_admin() or receiver_id = auth.uid())
with check (public.is_admin() or receiver_id = auth.uid());

drop policy if exists messages_admin_delete on public.messages;
create policy messages_admin_delete on public.messages
for delete to authenticated using (public.is_admin());

-- events
drop policy if exists events_read_all_authenticated on public.events;
create policy events_read_all_authenticated on public.events
for select to authenticated using (true);

drop policy if exists events_admin_all on public.events;
create policy events_admin_all on public.events
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- class_activity_photos
drop policy if exists class_photos_select_accessible on public.class_activity_photos;
create policy class_photos_select_accessible on public.class_activity_photos
for select to authenticated using (public.can_access_class(class_id));

drop policy if exists class_photos_teacher_write on public.class_activity_photos;
create policy class_photos_teacher_write on public.class_activity_photos
for all to authenticated
using (
  public.is_admin()
  or (public.is_teacher() and uploaded_by = auth.uid() and public.can_access_class(class_id))
)
with check (
  public.is_admin()
  or (public.is_teacher() and uploaded_by = auth.uid() and public.can_access_class(class_id))
);

