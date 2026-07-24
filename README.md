# Madrasah Connect

Sistem pengurusan madrasah dengan tiga portal berasingan untuk Admin, Guru dan Ibu Bapa/Penjaga.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + komponen gaya shadcn/ui
- Supabase Auth, Postgres, Storage dan RLS
- Bahasa Melayu, reka bentuk mobile-first

## Fasa 1

- Log masuk menggunakan e-mel atau nombor telefon
- Middleware penyegaran sesi Supabase
- Protected layout mengikut role `admin`, `guru`, `ibu_bapa`
- Dashboard asas untuk ketiga-tiga portal
- `StudentSwitcher` untuk penjaga yang mempunyai ramai anak
- Migration keselamatan tambahan dan bucket Storage private
- Seed demo: 3 kelas, 15 pelajar, 5 penjaga, 2 guru dan 1 admin

Struktur terperinci: `docs/fasa-1-struktur.md`.

## Environment

Salin `.env.example` kepada `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
SUPABASE_SERVICE_ROLE_KEY="sb_secret_..."
```

`SUPABASE_SERVICE_ROLE_KEY` hanya diperlukan untuk seed dan operasi server yang dipercayai. Jangan gunakan key ini dalam komponen client.

## Jalankan aplikasi

```bash
npm install
npm run dev
```

## Migration

Jalankan migration Supabase mengikut urutan fail dalam `supabase/migrations`.

## Seed demo

```bash
npm run seed:demo
```

Semua akaun demo menggunakan kata laluan:

```text
MadrasahDemo#2026
```

Akaun utama:

- Admin: `admin@demo.madrasah.my`
- Guru: `guru1@demo.madrasah.my`
- Penjaga: `penjaga1@demo.madrasah.my`

## Semakan sebelum merge

```bash
npm run typecheck
npm run lint
npm run build
```
