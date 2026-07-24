# Sistem Pengurusan Madrasah

Web application mobile-first menggunakan Next.js App Router, TypeScript, Tailwind CSS, shadcn-style components dan Supabase.

## Status pembangunan

- **Fasa 1 siap:** Auth SSR, skema penuh, RLS dan tiga portal berasaskan role.
- **Fasa 2 siap:** CRUD pelajar/kelas, kaitan penjaga, kehadiran pukal guru dan kalendar kehadiran ibu bapa.
- Fasa 3–5 mempunyai route placeholder untuk pembangunan seterusnya.

## Persediaan

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

## Supabase

Untuk projek local:

```bash
supabase start
supabase db reset
```

Urutan SQL:

1. `supabase/migrations/202607240001_phase_1_schema_rls.sql`
2. `supabase/migrations/202607240002_phase_2_students_classes_attendance.sql`
3. `supabase/seed.sql`
4. `supabase/seed-phase2.sql` — data kehadiran demo pilihan

## Akaun demo

Kata laluan semua akaun: `Demo@1234`

- Admin: `admin@demo.madrasah.my`
- Guru: `guru1@demo.madrasah.my`, `guru2@demo.madrasah.my`
- Penjaga: `ibu1@demo.madrasah.my` hingga `ibu5@demo.madrasah.my`

## Semakan

```bash
npm run typecheck
npm run lint
npm run build
```

Rujuk `docs/PHASE-1-STRUCTURE.md` dan `docs/PHASE-2-IMPLEMENTATION.md`.
