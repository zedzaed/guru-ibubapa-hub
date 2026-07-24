import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export function PhasePlaceholder({
  title,
  phase,
  description,
}: {
  title: string;
  phase: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="flex flex-col items-center px-6 py-14 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
            <Construction className="size-7" aria-hidden="true" />
          </div>
          <p className="mt-5 font-bold">Modul ini dijadualkan dalam {phase}</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Struktur route dan kawalan akses sudah tersedia. Fungsi data akan disambungkan
            mengikut urutan fasa supaya perubahan lebih selamat dan mudah diuji.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
