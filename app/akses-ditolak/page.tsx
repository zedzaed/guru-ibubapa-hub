import Link from "next/link";
import { ShieldX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentAccount, portalForRole } from "@/lib/auth";

export const metadata = { title: "Akses Ditolak" };

export default async function AccessDeniedPage() {
  const account = await getCurrentAccount();
  const href = account ? portalForRole(account.role) : "/log-masuk";

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-red-50 text-red-700">
            <ShieldX className="size-8" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-2xl font-bold">Akses tidak dibenarkan</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Akaun ini tidak mempunyai kebenaran untuk membuka portal tersebut.
          </p>
          <Link href={href} className={buttonVariants({ className: "mt-6 w-full" })}>
            Kembali ke portal saya
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
