# Fasa 1 — Struktur Projek

Fasa ini memindahkan scaffold kosong Lovable/TanStack kepada Next.js App Router dan menyediakan asas keselamatan sebelum modul operasi dibina.

```text
app/
├── (auth)/
│   └── log-masuk/page.tsx
├── (protected)/
│   ├── admin/
│   │   ├── [...slug]/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── guru/
│   │   ├── [...slug]/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── ibu-bapa/
│       ├── [...slug]/page.tsx
│       ├── layout.tsx
│       └── page.tsx
├── akses-ditolak/page.tsx
├── auth/
│   ├── callback/route.ts
│   └── keluar/route.ts
├── globals.css
├── layout.tsx
└── page.tsx

components/
├── auth/login-form.tsx
├── ui/
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── label.tsx
├── app-shell.tsx
├── brand-mark.tsx
├── page-header.tsx
├── phase-placeholder.tsx
├── stat-card.tsx
└── student-switcher.tsx

lib/
├── supabase/
│   ├── client.ts
│   ├── env.ts
│   ├── middleware.ts
│   └── server.ts
├── auth.ts
├── format.ts
├── types.ts
└── utils.ts

scripts/
└── seed-demo.ts

supabase/
└── migrations/
    ├── 20260724113551_39dcf610-78db-4015-ae6d-f3ad59375f2b.sql
    ├── 20260724113620_1844ffc1-2297-40e4-8d1d-c4e41ada83bb.sql
    └── 20260724193000_fasa1_security_storage.sql
```

## Migration SQL Fasa 1

Migration baharu melakukan perkara berikut:

1. Menambah constraint untuk markah, amaun, bulan, juzuk dan julat tarikh.
2. Mengehadkan guru kepada kelas dan pelajar di bawah jagaan sendiri.
3. Mengehadkan profil, pautan penjaga dan invois mengikut hubungan sebenar.
4. Mengehadkan mesej hanya antara guru kelas dan penjaga berkaitan.
5. Mengehadkan kemas kini mesej kepada medan `dibaca` sahaja.
6. Mewujudkan bucket private `student-photos` dan `class-activities`.
7. Menambah polisi Storage berdasarkan ID pelajar atau kelas pada folder pertama.

Konvensyen path Storage:

```text
student-photos/<student_id>/<filename>
class-activities/<class_id>/<filename>
```

Folder `src/` lama daripada scaffold TanStack masih berada dalam sejarah repository tetapi dikecualikan daripada TypeScript dan tidak digunakan oleh aplikasi Next.js.
