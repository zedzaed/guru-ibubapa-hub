import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Yuran & Invois</h1>
      <Card><CardHeader><CardTitle>Dalam pelan pembangunan</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Struktur yuran dan invois pukal akan dibina dalam Fasa 4.</CardContent></Card>
    </div>
  );
}
