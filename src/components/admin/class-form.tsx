import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface TeacherOption { id: string; nama: string; }
interface ClassValue { id: string; nama_kelas: string; tingkatan: string; guru_id: string | null; tahun: number; }

export function ClassForm({
  value,
  teachers,
  action,
}: {
  value?: ClassValue | null;
  teachers: TeacherOption[];
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <Card>
      <CardHeader><CardTitle>{value ? "Kemaskini kelas" : "Tambah kelas"}</CardTitle></CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={value?.id ?? ""} />
          <div className="space-y-1.5">
            <Label htmlFor="nama_kelas">Nama kelas</Label>
            <Input id="nama_kelas" name="nama_kelas" defaultValue={value?.nama_kelas ?? ""} placeholder="Contoh: 1 Al-Fatih" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tingkatan">Tingkatan</Label>
            <Input id="tingkatan" name="tingkatan" defaultValue={value?.tingkatan ?? ""} placeholder="Contoh: Tahun 1" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tahun">Tahun</Label>
            <Input id="tahun" name="tahun" type="number" min="2000" max="2100" defaultValue={value?.tahun ?? new Date().getFullYear()} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="guru_id">Guru kelas</Label>
            <Select id="guru_id" name="guru_id" defaultValue={value?.guru_id ?? ""}>
              <option value="">Belum ditetapkan</option>
              {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.nama}</option>)}
            </Select>
          </div>
          <div className="sm:col-span-2"><Button type="submit">{value ? "Simpan perubahan" : "Tambah kelas"}</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}
