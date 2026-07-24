import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

export function createClient() {
  const { url, key } = getSupabaseEnv();

  if (!url || !key) {
    throw new Error("Pemboleh ubah persekitaran Supabase belum ditetapkan.");
  }

  return createBrowserClient(url, key);
}
