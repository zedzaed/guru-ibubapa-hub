import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <FileQuestion className="mx-auto size-14 text-primary" aria-hidden="true" />
        <h1 className="mt-5 text-3xl font-bold">Halaman tidak ditemui</h1>
        <p className="mt-2 text-sm text-muted-foreground">Alamat yang dibuka tidak wujud atau telah dipindahkan.</p>
        <Link href="/" className={buttonVariants({ className: "mt-6" })}>
          Kembali ke dashboard
        </Link>
      </div>
    </main>
  );
}
