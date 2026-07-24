const DEFAULT_SUPABASE_URL = "https://znqtpnlykyyidshpqbbt.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_RBu1KfY2Z5WJ4dIfPSGGeA_gLWQZX82";

export function getSupabaseEnv() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    DEFAULT_SUPABASE_URL;

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    DEFAULT_SUPABASE_PUBLISHABLE_KEY;

  return {
    url,
    key,
    configured: Boolean(url && key),
  };
}
