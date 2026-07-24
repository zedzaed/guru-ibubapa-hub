import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { ClassSummary, StudentRecord } from "@/types/database";

interface StudentFormProps {
  student?: StudentRecord | null;
  classes: ClassSummary[];
  action: (formData: FormData) => Promise<void>;
}

export function StudentForm({ student, classes, action }: StudentFormProps) {
  const currentYear = new Date().getFullYear();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{student ? "Kemaskini pelajar" : "Tambah pelajar"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={student?.id ?? ""} />
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="nama">Nama penuh</Label>
            <Input id="nama" name="nama" defaultValue={student?.nama ?? ""} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="no_kp">No. KP / MyKid</Label>
            <Input id="no_kp" name="no_kp" defaultValue={student?.no_kp ?? ""} placeholder="Contoh: 190101-11-1001" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tarikh_lahir">Tarikh lahir</Label>
            <Input id="tarikh_lahir" name="tarikh_lahir" type="date" defaultValue={student?.tarikh_lahir ?? ""} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jantina">Jantina</Label>
            <Select id="jantina" name="jantina" defaultValue={student?.jantina ?? "lelaki"} required>
              <option value="lelaki">Lelaki</option>
              <option value="perempuan">Perempuan</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tahun_masuk">Tahun masuk</Label>
            <Input id="tahun_masuk" name="tahun_masuk" type="number" min="2000" max="2100" defaultValue={student?.tahun_masuk ?? currentYear} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kelas_id">Kelas</Label>
            <Select id="kelas_id" name="kelas_id" defaultValue={student?.kelas_id ?? ""}>
              <option value="">Belum ditetapkan</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>{item.nama_kelas} — {item.tahun}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select id="status" name="status" defaultValue={student?.status ?? "aktif"} required>
              <option value="aktif">Aktif</option>
              <option value="tidak_aktif">Tidak aktif</option>
              <option value="tamat">Tamat</option>
              <option value="berhenti">Berhenti</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full sm:w-auto">
              {student ? "Simpan perubahan" : "Tambah pelajar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
