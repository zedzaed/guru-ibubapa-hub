-- =========================
-- AUTHORIZATION HELPERS
-- =========================
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid() and status = 'aktif' limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'guru', false);
$$;

create or replace function public.parent_can_access_student(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.parents_students ps
    where ps.parent_id = auth.uid()
      and ps.student_id = target_student_id
  );
$$;

create or replace function public.teacher_can_access_student(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.students s
    join public.classes c on c.id = s.kelas_id
    where s.id = target_student_id
      and c.guru_id = auth.uid()
  );
$$;

create or replace function public.can_access_student(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
      or public.parent_can_access_student(target_student_id)
      or public.teacher_can_access_student(target_student_id);
$$;

create or replace function public.can_access_class(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
      or exists (
        select 1 from public.classes c
        where c.id = target_class_id and c.guru_id = auth.uid()
      )
      or exists (
        select 1
        from public.parents_students ps
        join public.students s on s.id = ps.student_id
        where ps.parent_id = auth.uid() and s.kelas_id = target_class_id
      );
$$;

create or replace function public.can_read_user(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() = target_user_id
      or public.is_admin()
      or exists (
        select 1
        from public.classes c
        join public.students s on s.kelas_id = c.id
        join public.parents_students ps on ps.student_id = s.id
        where (c.guru_id = auth.uid() and ps.parent_id = target_user_id)
           or (ps.parent_id = auth.uid() and c.guru_id = target_user_id)
      );
$$;

create or replace function public.can_view_announcement(target_announcement_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.announcements a
    where a.id = target_announcement_id
      and (
        public.is_admin()
        or a.target = 'semua'
        or (a.target = 'kelas' and public.can_access_class(a.class_id))
        or (a.target = 'individu' and public.can_access_student(a.student_id))
      )
  );
$$;

create or replace function public.message_pair_allowed(
  target_student_id uuid,
  other_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
      or (
        public.can_access_student(target_student_id)
        and (
          -- Guru kelas berhubung dengan penjaga pelajar.
          exists (
            select 1
            from public.students s
            join public.classes c on c.id = s.kelas_id
            join public.parents_students ps on ps.student_id = s.id
            where s.id = target_student_id
              and (
                (c.guru_id = auth.uid() and ps.parent_id = other_user_id)
                or (ps.parent_id = auth.uid() and c.guru_id = other_user_id)
              )
          )
        )
      );
$$;

revoke all on function public.current_user_role() from public;
revoke all on function public.is_admin() from public;
revoke all on function public.is_teacher() from public;
revoke all on function public.parent_can_access_student(uuid) from public;
revoke all on function public.teacher_can_access_student(uuid) from public;
revoke all on function public.can_access_student(uuid) from public;
revoke all on function public.can_access_class(uuid) from public;
revoke all on function public.can_read_user(uuid) from public;
revoke all on function public.can_view_announcement(uuid) from public;
revoke all on function public.message_pair_allowed(uuid, uuid) from public;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_teacher() to authenticated;
grant execute on function public.parent_can_access_student(uuid) to authenticated;
grant execute on function public.teacher_can_access_student(uuid) to authenticated;
grant execute on function public.can_access_student(uuid) to authenticated;
grant execute on function public.can_access_class(uuid) to authenticated;
grant execute on function public.can_read_user(uuid) to authenticated;
grant execute on function public.can_view_announcement(uuid) to authenticated;
grant execute on function public.message_pair_allowed(uuid, uuid) to authenticated;

