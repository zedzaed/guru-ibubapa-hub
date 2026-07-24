-- =========================
-- STORAGE BUCKETS + POLICIES
-- Path conventions:
-- student-photos/{student_id}/filename.ext
-- announcement-attachments/{announcement_id}/filename.ext
-- class-activities/{class_id}/filename.ext
-- =========================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('student-photos', 'student-photos', false, 5242880, array['image/jpeg','image/png','image/webp']),
  ('announcement-attachments', 'announcement-attachments', false, 10485760, array['image/jpeg','image/png','image/webp','application/pdf']),
  ('class-activities', 'class-activities', false, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- student photos
drop policy if exists student_photos_select on storage.objects;
create policy student_photos_select on storage.objects
for select to authenticated
using (
  bucket_id = 'student-photos'
  and public.can_access_student((storage.foldername(name))[1]::uuid)
);

drop policy if exists student_photos_write on storage.objects;
create policy student_photos_write on storage.objects
for insert to authenticated
with check (
  bucket_id = 'student-photos'
  and (
    public.is_admin()
    or (public.is_teacher() and public.teacher_can_access_student((storage.foldername(name))[1]::uuid))
  )
);

drop policy if exists student_photos_update on storage.objects;
create policy student_photos_update on storage.objects
for update to authenticated
using (
  bucket_id = 'student-photos'
  and (
    public.is_admin()
    or (public.is_teacher() and public.teacher_can_access_student((storage.foldername(name))[1]::uuid))
  )
)
with check (
  bucket_id = 'student-photos'
  and (
    public.is_admin()
    or (public.is_teacher() and public.teacher_can_access_student((storage.foldername(name))[1]::uuid))
  )
);

drop policy if exists student_photos_delete on storage.objects;
create policy student_photos_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'student-photos'
  and (
    public.is_admin()
    or (public.is_teacher() and public.teacher_can_access_student((storage.foldername(name))[1]::uuid))
  )
);

-- announcement attachments
drop policy if exists announcement_attachments_select on storage.objects;
create policy announcement_attachments_select on storage.objects
for select to authenticated
using (
  bucket_id = 'announcement-attachments'
  and public.can_view_announcement((storage.foldername(name))[1]::uuid)
);

drop policy if exists announcement_attachments_admin_write on storage.objects;
create policy announcement_attachments_admin_write on storage.objects
for all to authenticated
using (bucket_id = 'announcement-attachments' and public.is_admin())
with check (bucket_id = 'announcement-attachments' and public.is_admin());

-- class activities
drop policy if exists class_activities_select on storage.objects;
create policy class_activities_select on storage.objects
for select to authenticated
using (
  bucket_id = 'class-activities'
  and public.can_access_class((storage.foldername(name))[1]::uuid)
);

drop policy if exists class_activities_teacher_write on storage.objects;
create policy class_activities_teacher_write on storage.objects
for all to authenticated
using (
  bucket_id = 'class-activities'
  and (
    public.is_admin()
    or (public.is_teacher() and public.can_access_class((storage.foldername(name))[1]::uuid))
  )
)
with check (
  bucket_id = 'class-activities'
  and (
    public.is_admin()
    or (public.is_teacher() and public.can_access_class((storage.foldername(name))[1]::uuid))
  )
);

-- API grants. RLS masih menentukan row yang dibenarkan.
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

