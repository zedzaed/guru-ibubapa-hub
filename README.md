# Sistem Pengurusan Madrasah

Web application mobile-first menggunakan Next.js App Router, TypeScript, Tailwind CSS, komponen gaya shadcn/ui dan Supabase.

## Status pembangunan

- **Fasa 1 siap:** Auth SSR, skema pangkalan data, RLS dan layout tiga portal mengikut role.
- **Fasa 2 siap:** CRUD pelajar dan kelas, kaitan penjaga, kehadiran pukal guru dan kalendar kehadiran ibu bapa.
- **Fasa 3 dalam semakan:** Pengurusan Infaq & Tahlil — borang awam, QR statik, bukti bayaran, rekod manual admin, jadual tahlil, resit PDF dan e-mel.
- Laluan placeholder Fasa 4–5 kekal untuk pembangunan seterusnya.

## Persediaan tempatan

```bash
cp .env.example .env.local
npm install
npm run dev
```

Isi `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SERVICE_ROLE_KEY=service_role_xxx
RESEND_API_KEY=re_xxx
INFAQ_FROM_EMAIL=Madrasah Hub <infaq@domain-madrasah.my>
```

`SUPABASE_SERVICE_ROLE_KEY` membolehkan admin mencipta akaun pengguna yang terus disahkan. `RESEND_API_KEY` dan `INFAQ_FROM_EMAIL` diperlukan untuk menghantar resit PDF infaq melalui e-mel.

Selepas menambah atau mengubah environment variables di Vercel, jalankan deployment baharu supaya nilainya digunakan oleh build production.

## Supabase

Dengan Supabase CLI, migration dalam folder `supabase/migrations` dijalankan secara automatik mengikut nama fail:

1. `20260724000110_phase_1_part_1.sql` hingga `20260724000180_phase_1_part_8.sql`
2. `202607240002_phase_2_students_classes_attendance.sql`
3. `20260725120000_infaq_tahlil.sql`

Untuk projek local:

```bash
supabase start
supabase db reset
```

Seed demo:

- `supabase/seed.sql` — 3 kelas, 15 pelajar, 5 penjaga, 2 guru dan 1 admin.
- `supabase/seed-phase2.sql` — rekod kehadiran demo pilihan.

## Modul Infaq & Tahlil

- Borang awam: `/infaq`
- Semakan status: `/infaq/semak`
- Pengurusan admin: `/admin/infaq`
- Bukti bayaran disimpan dalam bucket private `infaq-proofs`.
- QR statik disimpan dalam bucket public `infaq-assets`.
- Resit PDF dijana selepas admin mengesahkan bayaran dan dilampirkan dalam e-mel.

## Akaun demo

Kata laluan semua akaun: `Demo@1234`

- Admin: `admin@demo.madrasah.my`
- Guru: `guru1@demo.madrasah.my`, `guru2@demo.madrasah.my`
- Penjaga: `ibu1@demo.madrasah.my` hingga `ibu5@demo.madrasah.my`

## Semakan

```bash
npm run verify:structure
npm run typecheck
npm run lint
npm run build
```
