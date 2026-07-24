import { PhasePlaceholder } from "@/components/phase-placeholder";

const modules: Record<string, { title: string; phase: string; description: string }> = {
  pelajar: { title: "Pengurusan Pelajar", phase: "Fasa 2", description: "CRUD pelajar, profil dan kaitan kelas." },
  kelas: { title: "Pengurusan Kelas", phase: "Fasa 2", description: "Struktur kelas, tingkatan dan guru kelas." },
  pengguna: { title: "Pengurusan Pengguna", phase: "Fasa 2", description: "Akaun guru, penjaga dan kawalan peranan." },
  subjek: { title: "Pengurusan Subjek", phase: "Fasa 3", description: "Senarai subjek dan kaitan peperiksaan." },
  yuran: { title: "Yuran & Invois", phase: "Fasa 4", description: "Struktur yuran dan penjanaan invois pukal." },
  laporan: { title: "Laporan Madrasah", phase: "Fasa 5", description: "Laporan PDF, Excel dan statistik operasi." },
  pengumuman: { title: "Pengumuman", phase: "Fasa 5", description: "Urus hebahan kepada semua, kelas atau individu." },
};

export default async function AdminModulePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const key = slug[0] ?? "modul";
  const module = modules[key] ?? {
    title: "Modul Admin",
    phase: "Fasa seterusnya",
    description: "Modul ini belum dimasukkan dalam skop Fasa 1.",
  };
  return <PhasePlaceholder {...module} />;
}
