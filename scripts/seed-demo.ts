import { createClient, type User } from "@supabase/supabase-js";

type Role = "admin" | "guru" | "ibu_bapa";

type DemoUser = {
  email: string;
  phone: string;
  nama: string;
  role: Role;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const demoPassword = "MadrasahDemo#2026";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Tetapkan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sebelum menjalankan seed.",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(email: string): Promise<User | undefined> {
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;

    const found = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < 200) return undefined;
    page += 1;
  }
}

async function ensureUser(definition: DemoUser) {
  let user = await findUserByEmail(definition.email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: definition.email,
      phone: definition.phone,
      password: demoPassword,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: {
        nama: definition.nama,
        phone: definition.phone,
      },
    });
    if (error) throw error;
    user = data.user;
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    nama: definition.nama,
    email: definition.email,
    phone: definition.phone,
    status: "aktif",
  });
  if (profileError) throw profileError;

  const { error: deleteRoleError } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", user.id);
  if (deleteRoleError) throw deleteRoleError;

  const { error: roleError } = await supabase.from("user_roles").insert({
    user_id: user.id,
    role: definition.role,
  });
  if (roleError) throw roleError;

  return user.id;
}

async function upsertRows(table: string, rows: Record<string, unknown>[], onConflict = "id") {
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) throw error;
}

async function main() {
  const definitions: DemoUser[] = [
    { email: "admin@demo.madrasah.my", phone: "+601100000001", nama: "Admin Madrasah", role: "admin" },
    { email: "guru1@demo.madrasah.my", phone: "+601100000002", nama: "Ustaz Ahmad Firdaus", role: "guru" },
    { email: "guru2@demo.madrasah.my", phone: "+601100000003", nama: "Ustazah Nur Hidayah", role: "guru" },
    { email: "penjaga1@demo.madrasah.my", phone: "+601100000011", nama: "Mohd Hakim", role: "ibu_bapa" },
    { email: "penjaga2@demo.madrasah.my", phone: "+601100000012", nama: "Siti Mariam", role: "ibu_bapa" },
    { email: "penjaga3@demo.madrasah.my", phone: "+601100000013", nama: "Abdul Rahman", role: "ibu_bapa" },
    { email: "penjaga4@demo.madrasah.my", phone: "+601100000014", nama: "Nor Aini", role: "ibu_bapa" },
    { email: "penjaga5@demo.madrasah.my", phone: "+601100000015", nama: "Faizal Ismail", role: "ibu_bapa" },
  ];

  const ids = new Map<string, string>();
  for (const definition of definitions) {
    ids.set(definition.email, await ensureUser(definition));
  }

  const adminId = ids.get("admin@demo.madrasah.my")!;
  const guru1Id = ids.get("guru1@demo.madrasah.my")!;
  const guru2Id = ids.get("guru2@demo.madrasah.my")!;
  const parentIds = [1, 2, 3, 4, 5].map(
    (number) => ids.get(`penjaga${number}@demo.madrasah.my`)! ,
  );

  const classIds = [
    "10000000-0000-4000-8000-000000000001",
    "10000000-0000-4000-8000-000000000002",
    "10000000-0000-4000-8000-000000000003",
  ];

  await upsertRows("classes", [
    { id: classIds[0], nama_kelas: "1 Al-Fatih", tingkatan: "Tahun 1", guru_id: guru1Id, tahun: 2026 },
    { id: classIds[1], nama_kelas: "2 Al-Biruni", tingkatan: "Tahun 2", guru_id: guru2Id, tahun: 2026 },
    { id: classIds[2], nama_kelas: "3 Ibnu Sina", tingkatan: "Tahun 3", guru_id: guru1Id, tahun: 2026 },
  ]);

  const studentNames = [
    "Aiman Hakimi", "Aisyah Humaira", "Danish Irfan", "Nur Aleeya", "Muhammad Rayyan",
    "Sofia Imani", "Haris Zikri", "Maryam Zahra", "Izzuddin Syah", "Nur Aqeela",
    "Adam Haziq", "Sara Qistina", "Umar Faruq", "Husna Balqis", "Yusuf Imran",
  ];

  const students = studentNames.map((nama, index) => ({
    id: `20000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    nama,
    no_kp: `16010${String(index + 1).padStart(2, "0")}-11-${String(index + 1).padStart(4, "0")}`,
    tarikh_lahir: `201${6 - Math.floor(index / 5)}-0${(index % 9) + 1}-15`,
    jantina: index % 2 === 0 ? "lelaki" : "perempuan",
    kelas_id: classIds[Math.floor(index / 5)],
    tahun_masuk: 2026,
    status: "aktif",
  }));

  await upsertRows("students", students);

  const parentDistribution = [0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 4];
  const links = students.map((student, index) => ({
    parent_id: parentIds[parentDistribution[index]],
    student_id: student.id,
    hubungan: index % 3 === 0 ? "bapa" : "ibu",
  }));
  await upsertRows("parents_students", links, "parent_id,student_id");

  await upsertRows("subjects", [
    { id: "30000000-0000-4000-8000-000000000001", nama_subjek: "Al-Quran" },
    { id: "30000000-0000-4000-8000-000000000002", nama_subjek: "Tauhid" },
    { id: "30000000-0000-4000-8000-000000000003", nama_subjek: "Feqah" },
    { id: "30000000-0000-4000-8000-000000000004", nama_subjek: "Sirah" },
    { id: "30000000-0000-4000-8000-000000000005", nama_subjek: "Bahasa Arab" },
  ]);

  await upsertRows("fees", [
    { id: "40000000-0000-4000-8000-000000000001", nama_yuran: "Yuran Bulanan", amaun: 180, jenis: "bulanan" },
    { id: "40000000-0000-4000-8000-000000000002", nama_yuran: "Yuran Aktiviti", amaun: 80, jenis: "sekali" },
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  await upsertRows(
    "attendance",
    students.map((student, index) => ({
      student_id: student.id,
      tarikh: today,
      status: index % 7 === 0 ? "lewat" : "hadir",
      direkod_oleh: index < 5 || index >= 10 ? guru1Id : guru2Id,
    })),
    "student_id,tarikh",
  );

  await upsertRows("hafazan", students.map((student, index) => ({
    id: `50000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    student_id: student.id,
    surah: index % 2 === 0 ? "Al-Fatihah" : "An-Nas",
    ayat_mula: 1,
    ayat_akhir: index % 2 === 0 ? 7 : 6,
    jenis: "hafazan_baru",
    gred: index % 4 === 0 ? "mumtaz" : "jayyid_jiddan",
    catatan: "Rekod contoh untuk paparan demo.",
    tarikh: today,
    guru_id: index < 5 || index >= 10 ? guru1Id : guru2Id,
  })));

  await upsertRows("invoices", students.map((student, index) => ({
    id: `60000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    student_id: student.id,
    fee_id: "40000000-0000-4000-8000-000000000001",
    bulan: currentMonth,
    tahun: currentYear,
    amaun: 180,
    status: index % 4 === 0 ? "tertunggak" : "belum_bayar",
  })));

  await upsertRows("announcements", [
    {
      id: "70000000-0000-4000-8000-000000000001",
      tajuk: "Selamat Datang ke Madrasah Connect",
      kandungan: "Portal demo telah disediakan untuk semakan Fasa 1.",
      target: "semua",
      class_id: null,
      student_id: null,
      tarikh: today,
      created_by: adminId,
    },
  ]);

  await upsertRows("events", [
    {
      id: "80000000-0000-4000-8000-000000000001",
      tajuk: "Hari Terbuka Madrasah",
      keterangan: "Sesi pertemuan ibu bapa bersama guru kelas.",
      tarikh_mula: `${currentYear}-08-15T01:00:00.000Z`,
      tarikh_tamat: `${currentYear}-08-15T05:00:00.000Z`,
      lokasi: "Dewan Utama Madrasah",
    },
  ]);

  console.log("Seed demo selesai.");
  console.log(`Kata laluan semua akaun demo: ${demoPassword}`);
}

main().catch((error) => {
  console.error("Seed demo gagal:", error);
  process.exitCode = 1;
});
