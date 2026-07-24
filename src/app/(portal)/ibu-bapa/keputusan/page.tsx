import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Keputusan</h1>
      <Card><CardHeader><CardTitle>Dalam pelan pembangunan</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Keputusan dan graf perbandingan akan dibina dalam Fasa 3.</CardContent></Card>
    </div>
  );
}
