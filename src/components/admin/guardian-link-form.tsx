import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface ParentOption { id: string; nama: string; email: string | null; phone: string | null; }

export function GuardianLinkForm({
  studentId,
  parents,
  action,
}: {
  studentId: string;
  parents: ParentOption[];
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="grid gap-3 rounded-2xl border bg-muted/40 p-4 sm:grid-cols-[1fr_160px_auto] sm:items-end">
      <input type="hidden" name="student_id" value={studentId} />
      <div className="space-y-1.5">
        <Label htmlFor="parent_id">Tambah penjaga</Label>
        <Select id="parent_id" name="parent_id" required defaultValue="">
          <option value="" disabled>Pilih akaun penjaga</option>
          {parents.map((parent) => (
            <option key={parent.id} value={parent.id}>{parent.nama} — {parent.phone ?? parent.email ?? "Tiada kontak"}</option>
          ))}
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="hubungan">Hubungan</Label>
        <Select id="hubungan" name="hubungan" defaultValue="Ibu">
          <option>Ibu</option><option>Bapa</option><option>Penjaga</option><option>Datuk</option><option>Nenek</option>
        </Select>
      </div>
      <Button type="submit">Kaitkan</Button>
    </form>
  );
}
