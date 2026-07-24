import { PhasePlaceholder } from "@/components/phase-placeholder";

const modules: Record<string, { title: string; phase: string; description: string }> = {
  kehadiran: { title: "Kehadiran", phase: "Fasa 2", description: "Kalendar bulanan dan ringkasan status kehadiran." },
  hafazan: { title: "Hafazan", phase: "Fasa 3", description: "Timeline hafazan, progress juzuk dan graf perkembangan." },
  tilawah: { title: "Tilawah", phase: "Fasa 3", description: "Muka surat, juzuk semasa dan sejarah bacaan." },
  keputusan: { title: "Keputusan Peperiksaan", phase: "Fasa 3", description: "Markah, gred, purata dan perbandingan penggal." },
  akhlak: { title: "Akhlak", phase: "Fasa 3", description: "Rekod merit, demerit dan jumlah mata semasa." },
  yuran: { title: "Yuran", phase: "Fasa 4", description: "Senarai bil, status, sejarah dan resit PDF." },
  pengumuman: { title: "Pengumuman & Kalendar", phase: "Fasa 5", description: "Hebahan madrasah dan aktiviti akan datang." },
  mesej: { title: "Mesej Guru", phase: "Fasa 5", description: "Chat ringkas dengan guru kelas anak." },
  laporan: { title: "Laporan Perkembangan", phase: "Fasa 5", description: "Muat turun laporan perkembangan dalam format PDF." },
};

export default async function ParentModulePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const key = slug[0] ?? "modul";
  const moduleInfo = modules[key] ?? {
    title: "Modul Ibu Bapa",
    phase: "Fasa seterusnya",
    description: "Modul ini belum dimasukkan dalam skop Fasa 1.",
  };
  return <PhasePlaceholder {...moduleInfo} />;
}
