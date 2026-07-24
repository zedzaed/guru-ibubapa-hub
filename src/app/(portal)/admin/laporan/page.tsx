import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Laporan</h1>
      <Card><CardHeader><CardTitle>Dalam pelan pembangunan</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Laporan PDF dan Excel akan dibina mengikut fasa modul.</CardContent></Card>
    </div>
  );
}
