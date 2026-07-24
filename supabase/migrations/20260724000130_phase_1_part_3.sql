-- =========================
-- COMMON TRIGGERS
-- =========================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role public.user_role;
begin
  assigned_role := case
    when new.raw_app_meta_data ->> 'role' in ('admin', 'guru', 'ibu_bapa')
      then (new.raw_app_meta_data ->> 'role')::public.user_role
    else 'ibu_bapa'::public.user_role
  end;

  insert into public.users (id, nama, email, phone, role, status)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'nama', ''), split_part(coalesce(new.email, new.phone, 'Pengguna'), '@', 1)),
    new.email,
    new.phone,
    assigned_role,
    'aktif'
  )
  on conflict (id) do update set
    email = excluded.email,
    phone = excluded.phone,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of email, phone on auth.users
for each row execute procedure public.handle_new_auth_user();

-- Cegah pengguna biasa menaikkan role atau mengaktifkan akaun sendiri.
create or replace function public.protect_user_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role public.user_role;
begin
  select role into actor_role from public.users where id = auth.uid();

  if auth.uid() = old.id and coalesce(actor_role, 'ibu_bapa'::public.user_role) <> 'admin' then
    if new.role is distinct from old.role or new.status is distinct from old.status then
      raise exception 'Role dan status hanya boleh diubah oleh admin';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_user_privileges_trigger on public.users;
create trigger protect_user_privileges_trigger
before update on public.users
for each row execute procedure public.protect_user_privileges();

-- Penerima mesej hanya boleh menukar status dibaca, bukan kandungan/participant.
create or replace function public.protect_message_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.users where id = auth.uid() and role = 'admin') then
    return new;
  end if;

  if auth.uid() <> old.receiver_id then
    raise exception 'Hanya penerima boleh mengemas kini mesej';
  end if;

  if new.sender_id is distinct from old.sender_id
     or new.receiver_id is distinct from old.receiver_id
     or new.student_id is distinct from old.student_id
     or new.mesej is distinct from old.mesej
     or new.tarikh is distinct from old.tarikh then
    raise exception 'Hanya status dibaca boleh diubah';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_message_update_trigger on public.messages;
create trigger protect_message_update_trigger
before update on public.messages
for each row execute procedure public.protect_message_update();

-- Pasang updated_at pada jadual yang berkaitan.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'users','classes','students','attendance','hafazan','tilawah','subjects',
    'exams','exam_results','behaviour','fees','invoices','announcements','events'
  ] loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute procedure public.set_updated_at()',
      table_name, table_name
    );
  end loop;
end $$;

