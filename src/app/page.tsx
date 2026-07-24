import Link from "next/link";
import { BookOpenCheck, Database, ExternalLink } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/profile";
import { portalPathForRole } from "@/lib/auth/require-role";
import { getSupabaseEnv } from "@/lib/supabase/env";

export default async function HomePage() {
  const { configured } = getSupabaseEnv();

  if (!configured) {
    return (
      <main className="grid min-h-screen place-items-center px-4 py-8">
        <Card className="w-full max-w-xl border-emerald-200 shadow-lg">
          <CardHeader>
            <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <BookOpenCheck className="size-6" />
            </div>
            <CardTitle className="text-2xl">Portal Madrasah sudah dipasang</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm leading-6 text-muted-foreground">
              Aplikasi Next.js telah berjaya dideploy. Sambungkan projek Supabase untuk mengaktifkan log masuk, data pelajar dan tiga portal pengguna.
            </p>
            <div className="rounded-2xl border bg-muted p-4">
              <div className="mb-3 flex items-center gap-2 font-semibold"><Database className="size-4 text-primary" /> Environment Variables Vercel</div>
              <code className="block break-all text-xs">NEXT_PUBLIC_SUPABASE_URL</code>
              <code className="mt-2 block break-all text-xs">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Selepas kedua-dua nilai dimasukkan dalam Vercel, redeploy projek dan jalankan migration SQL dalam folder <code>supabase/migrations</code>.
            </p>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/login">Pergi ke log masuk <ExternalLink className="size-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  redirect(portalPathForRole(profile.role));
}
