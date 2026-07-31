# Deployment ke Vercel

## Prasyarat

- Sudah menyelesaikan [`docs/SETUP.md`](./SETUP.md) (Spreadsheet + Apps Script
  sudah di-deploy dan Anda punya URL `/exec`).
- Project ini sudah ada di repository Git (GitHub/GitLab/Bitbucket) — atau
  Anda bisa deploy langsung dari CLI tanpa Git.

## Opsi A — Deploy via Dashboard Vercel (disarankan)

1. Push project ini ke repository GitHub.
2. Buka [vercel.com](https://vercel.com) → **Add New → Project**.
3. Import repository yang berisi project ini.
4. Vercel akan otomatis mendeteksi framework **Next.js** — biarkan default
   build settings (`next build`).
5. Di bagian **Environment Variables**, tambahkan:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_GAS_API_URL` | URL Web App Apps Script Anda (`.../exec`) |

6. Klik **Deploy**. Setelah selesai, aplikasi bisa diakses di domain
   `*.vercel.app` yang diberikan (atau domain custom yang Anda hubungkan).

## Opsi B — Deploy via Vercel CLI

```bash
npm install -g vercel
cd tabungan-kas-siswa
vercel login
vercel
```

Ikuti prompt untuk konfigurasi project. Saat ditanya environment variables,
tambahkan `NEXT_PUBLIC_GAS_API_URL`, atau set manual setelahnya:

```bash
vercel env add NEXT_PUBLIC_GAS_API_URL production
```

Lalu deploy ke production:

```bash
vercel --prod
```

## Update Environment Variable Setelah Deploy

Jika URL Apps Script berubah (misalnya setelah membuat deployment baru):

1. Buka project di dashboard Vercel → **Settings → Environment Variables**.
2. Update nilai `NEXT_PUBLIC_GAS_API_URL`.
3. Buka tab **Deployments**, klik deployment terakhir → **Redeploy**
   (environment variable baru hanya berlaku setelah redeploy).

## Custom Domain (opsional)

1. Di dashboard project Vercel → **Settings → Domains**.
2. Tambahkan domain sekolah Anda (misalnya `kas.sekolahanda.sch.id`) dan
   ikuti instruksi konfigurasi DNS (biasanya menambahkan record `CNAME`
   atau `A` di penyedia domain Anda).

## Catatan

- Aplikasi ini murni frontend (Next.js) yang memanggil Apps Script sebagai
  backend, jadi tidak ada database atau server tambahan yang perlu
  dikonfigurasi di Vercel.
- Karena beberapa halaman memakai data yang sering berubah (dashboard,
  ledger), halaman-halaman tersebut dirender di sisi client (`"use client"`)
  dan mengambil data langsung dari Apps Script saat dibuka — tidak perlu
  build ulang setiap ada transaksi baru.
