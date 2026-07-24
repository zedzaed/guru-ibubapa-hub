import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotAuthorisedPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="space-y-4 pt-8">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-amber-100 text-amber-700">
            <ShieldAlert className="size-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Akses tidak dibenarkan</h1>
            <p className="mt-2 text-sm text-muted-foreground">Akaun ini tidak mempunyai kebenaran untuk membuka halaman tersebut.</p>
          </div>
          <Button asChild className="w-full"><Link href="/">Kembali ke portal</Link></Button>
        </CardContent>
      </Card>
    </main>
  );
}
