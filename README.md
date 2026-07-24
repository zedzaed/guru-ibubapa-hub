# Sistem Pengurusan Madrasah

Web application mobile-first menggunakan Next.js App Router, TypeScript, Tailwind CSS, komponen gaya shadcn/ui dan Supabase.

## Status pembangunan

- **Fasa 1 siap:** Auth SSR, skema pangkalan data, RLS dan layout tiga portal mengikut role.
- **Fasa 2 siap:** CRUD pelajar dan kelas, kaitan penjaga, kehadiran pukal guru dan kalendar kehadiran ibu bapa.
- Laluan placeholder Fasa 3–5 sudah disediakan untuk pembangunan seterusnya.

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
```

Aplikasi juga menerima nama lama `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` untuk memudahkan peralihan projek lama ke Next.js.

## Supabase

Dengan Supabase CLI, migration dalam folder `supabase/migrations` dijalankan secara automatik mengikut nama fail:

1. `20260724000110_phase_1_part_1.sql` hingga `20260724000180_phase_1_part_8.sql`
2. `202607240002_phase_2_students_classes_attendance.sql`

Untuk projek local:

```bash
supabase start
supabase db reset
```

Seed demo:

- `supabase/seed.sql` — 3 kelas, 15 pelajar, 5 penjaga, 2 guru dan 1 admin.
- `supabase/seed-phase2.sql` — rekod kehadiran demo pilihan.

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
