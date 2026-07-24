import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const phase1Migrations = [
  "supabase/migrations/20260724000110_phase_1_part_1.sql",
  "supabase/migrations/20260724000120_phase_1_part_2.sql",
  "supabase/migrations/20260724000130_phase_1_part_3.sql",
  "supabase/migrations/20260724000140_phase_1_part_4.sql",
  "supabase/migrations/20260724000150_phase_1_part_5.sql",
  "supabase/migrations/20260724000160_phase_1_part_6.sql",
  "supabase/migrations/20260724000170_phase_1_part_7.sql",
  "supabase/migrations/20260724000180_phase_1_part_8.sql",
];
const phase2Migration = "supabase/migrations/202607240002_phase_2_students_classes_attendance.sql";
const requiredFiles = [
  ...phase1Migrations,
  phase2Migration,
  "supabase/seed.sql",
  "supabase/seed-phase2.sql",
  "src/proxy.ts",
  "src/app/(portal)/admin/pelajar/actions.ts",
  "src/app/(portal)/admin/pelajar/page.tsx",
  "src/app/(portal)/admin/kelas/actions.ts",
  "src/app/(portal)/admin/kelas/page.tsx",
  "src/app/(portal)/guru/kehadiran/actions.ts",
  "src/app/(portal)/guru/kehadiran/page.tsx",
  "src/app/(portal)/ibu-bapa/kehadiran/page.tsx",
  "src/components/attendance/attendance-register.tsx",
  "src/components/attendance/attendance-calendar.tsx",
];

const missing = requiredFiles.filter((file) => !existsSync(resolve(root, file)));
if (missing.length) {
  console.error("Fail wajib tiada:\n" + missing.map((file) => `- ${file}`).join("\n"));
  process.exit(1);
}

const phase1Sql = phase1Migrations
  .map((file) => readFileSync(resolve(root, file), "utf8"))
  .join("\n");
const phase2Sql = readFileSync(resolve(root, phase2Migration), "utf8");

const requiredPhase1Sql = [
  "alter table public.students enable row level security",
  "create policy students_select_accessible",
  "create policy attendance_select_accessible",
  "create policy class_activities_teacher_write",
];
const requiredPhase2Sql = [
  "create or replace function public.save_class_attendance",
  "security invoker",
  "grant execute on function public.save_class_attendance",
  "create policy attendance_teacher_update",
];

const missingSql = [
  ...requiredPhase1Sql.filter((snippet) => !phase1Sql.toLowerCase().includes(snippet.toLowerCase())),
  ...requiredPhase2Sql.filter((snippet) => !phase2Sql.toLowerCase().includes(snippet.toLowerCase())),
];
if (missingSql.length) {
  console.error("Semakan migration gagal:\n" + missingSql.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log(`Semakan struktur lulus: ${requiredFiles.length} fail wajib dan ${requiredPhase1Sql.length + requiredPhase2Sql.length} kawalan SQL ditemui.`);
