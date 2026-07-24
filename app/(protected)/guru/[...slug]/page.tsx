import { PhasePlaceholder } from "@/components/phase-placeholder";

const modules: Record<string, { title: string; phase: string; description: string }> = {
  kehadiran: { title: "Ambil Kehadiran", phase: "Fasa 2", description: "Tanda semua pelajar dalam satu skrin dan simpan sekali gus." },
  hafazan: { title: "Rekod Hafazan", phase: "Fasa 3", description: "Rekod hafazan baharu, murajaah, gred dan catatan." },
  tilawah: { title: "Rekod Tilawah", phase: "Fasa 3", description: "Kemajuan Iqra atau al-Quran setiap pelajar." },
  keputusan: { title: "Markah Peperiksaan", phase: "Fasa 3", description: "Grid kemasukan markah mengikut kelas dan subjek." },
  akhlak: { title: "Merit & Demerit", phase: "Fasa 3", description: "Rekod perkembangan akhlak dan jumlah mata." },
  mesej: { title: "Mesej Ibu Bapa", phase: "Fasa 5", description: "Komunikasi berkaitan pelajar dengan penjaga yang sah." },
  aktiviti: { title: "Aktiviti Kelas", phase: "Fasa 5", description: "Muat naik gambar aktiviti kelas secara terkawal." },
};

export default async function TeacherModulePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const key = slug[0] ?? "modul";
  const module = modules[key] ?? {
    title: "Modul Guru",
    phase: "Fasa seterusnya",
    description: "Modul ini belum dimasukkan dalam skop Fasa 1.",
  };
  return <PhasePlaceholder {...module} />;
}
