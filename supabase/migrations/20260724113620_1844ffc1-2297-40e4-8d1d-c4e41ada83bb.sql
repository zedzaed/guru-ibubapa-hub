
-- Trigger-only functions: revoke from all callers
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Role/ownership helpers: authenticated only (used inside RLS)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_parent_of(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_teacher_of(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_parent_of(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_teacher_of(uuid) TO authenticated;
