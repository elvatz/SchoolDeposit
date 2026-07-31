# Kas & Tabungan Siswa

Aplikasi web untuk mengelola tabungan siswa, kas kelas, dan pengeluaran,
dengan seluruh transaksi tercatat dalam satu **Buku Besar (General Ledger)**
sehingga semua laporan berasal dari satu sumber data.

Dibangun dengan **Next.js 15 (App Router)**, **TypeScript**, **TailwindCSS**,
**shadcn/ui-style components**, **TanStack Query**, **React Hook Form + Zod**,
dan **Google Spreadsheet** (via Google Apps Script) sebagai database — tanpa
database tradisional seperti MySQL/PostgreSQL.

## Fitur

- **Dashboard** — total siswa, total tabungan, total kas, total penarikan,
  total belanja, total saldo, grafik ringkasan, dan transaksi terbaru
  (auto-refresh).
- **Siswa** — CRUD data siswa (NIS, nama, kelas) dengan pencarian.
- **Transaksi** — pilih **Jenis Transaksi** terlebih dahulu (Deposit /
  Withdrawal / Belanja), lalu field lain menyesuaikan otomatis:
  - **Deposit** — bisa ke Tabungan atau Kas, wajib pilih siswa yang menyetor.
    Setiap Deposit dikaitkan ke satu atau lebih **periode iuran** (bulan +
    tahun) — kalau setor sekaligus untuk beberapa bulan (mis. Rp500.000
    untuk 5 bulan), tinggal klik "+ Tambah Bulan" dan nominalnya otomatis
    terbagi rata per bulan, tercatat sebagai baris terpisah di Buku Besar.
  - **Withdrawal** — akun otomatis terkunci ke **Tabungan** (saldo pribadi
    siswa), wajib pilih siswa, dan tidak boleh melebihi saldo Tabungan
    siswa tersebut.
  - **Belanja** — akun otomatis terkunci ke **Kas** (pengeluaran kas kelas,
    mis. beli alat kebersihan), **tidak** dikaitkan ke siswa manapun karena
    Kas adalah dana bersama, dan tidak boleh melebihi total saldo Kas
    gabungan seluruh siswa.
- **Buku Besar** — seluruh transaksi dengan kolom Debit/Credit/Saldo Berjalan
  (running balance dihitung realtime, bukan disimpan), pencarian, filter
  tanggal/siswa/akun, sorting, pagination, dan export CSV.
- **Buku Besar per Siswa** — saldo Tabungan & Kas per siswa beserta riwayat
  transaksinya.
- **Laporan** — ringkasan total, laporan bulanan (filter bulan/tahun), laporan
  per siswa, dan **Iuran Bulanan** (matriks siswa × bulan seperti rekap kas
  kelas manual, terpisah untuk Tabungan dan Kas, rentang bulan bebas
  dipilih) — masing-masing bisa diexport ke PDF/CSV/Excel/print.
- **Pengaturan** — status koneksi ke Google Apps Script.
- **Dark mode**, skeleton loading, empty state, toast notification, dan
  confirmation dialog sebelum delete.

## Struktur Folder

```
app/            Routing Next.js App Router (halaman per fitur)
components/     Komponen UI reusable (primitives + layout)
features/       Komponen spesifik per fitur (dashboard, students, dst.)
hooks/          Custom hooks (TanStack Query per entitas)
lib/            Utilities, validasi Zod, konstanta, export helpers
services/       Repository pattern — komunikasi ke Google Apps Script API
types/          TypeScript types bersama
google-apps-script/  Kode backend (Code.gs) untuk di-deploy ke Apps Script
docs/           Panduan setup Spreadsheet/Apps Script dan deployment Vercel
```

## Mulai Menjalankan

### 1. Setup Backend (Spreadsheet + Apps Script)

Ikuti panduan lengkap di [`docs/SETUP.md`](./docs/SETUP.md).

### 2. Install & Jalankan Frontend

```bash
npm install
cp .env.example .env.local
# isi NEXT_PUBLIC_GAS_API_URL di .env.local dengan URL Apps Script Anda
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### 3. Deploy ke Production

Ikuti panduan di [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) untuk deploy
ke Vercel.

## Cara Kerja Saldo

Saldo **tidak disimpan** sebagai kolom di Spreadsheet. Setiap kali data
dibutuhkan, backend menghitung:

```
Saldo = Total Deposit − Total Withdrawal
```

dari seluruh baris di sheet `Ledger`, difilter sesuai konteks (per siswa,
per akun, per periode, dsb).

## Desain

Identitas visual aplikasi terinspirasi dari buku kas sekolah: warna hijau
tua ala sampul buku besar, aksen kuningan (brass) seperti stempel resmi,
tipografi serif (Fraunces) untuk angka & judul, serta angka tabular
(IBM Plex Mono) di seluruh tampilan nominal agar mudah dibaca dan dibandingkan.

## Rencana Pengembangan (Future Scalability)

Struktur project ini disiapkan agar mudah dikembangkan menjadi:

- Multi User Login & Role Admin
- Multiple Schools / Kelas / Tahun Ajaran
- Import Excel massal
- Backup Spreadsheet otomatis
- Audit Log

## Lisensi

Proyek internal — sesuaikan lisensi sesuai kebutuhan sekolah Anda.
