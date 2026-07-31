# Setup: Google Spreadsheet & Google Apps Script

Aplikasi ini tidak menggunakan database seperti MySQL/PostgreSQL. Semua data
disimpan di Google Spreadsheet, dan diakses melalui Google Apps Script yang
di-deploy sebagai Web App (REST API sederhana).

## 1. Buat Google Spreadsheet

1. Buka [sheets.google.com](https://sheets.google.com) dan buat spreadsheet baru.
2. Beri nama, misalnya **"Kas & Tabungan Siswa - Database"**.
3. Hapus sheet default (`Sheet1`) jika mau — sheet yang dibutuhkan akan dibuat
   otomatis di langkah berikutnya oleh skrip `setupSheets()`.

Struktur sheet yang dibutuhkan:

### Sheet `Students`
| id | nis | name | class | createdAt |
|----|-----|------|-------|-----------|

### Sheet `Ledger`
| id | date | studentId | studentName | account | transactionType | period | amount | description | createdAt |
|----|------|-----------|-------------|---------|------------------|--------|--------|-------------|-----------|

Semua transaksi (Tabungan maupun Kas) masuk ke satu sheet `Ledger` yang sama.
Saldo **tidak** disimpan sebagai kolom — dihitung realtime dari seluruh baris
di `Ledger` (Total Deposit − Total Withdrawal/Belanja).

`period` diisi otomatis oleh aplikasi untuk transaksi **Deposit** (format
`yyyy-MM`, misalnya `2026-01`), menandai iuran bulan apa yang dibayar —
terpisah dari `date` (tanggal transaksi sebenarnya terjadi). Kosong untuk
Withdrawal/Belanja. Kolom ini dipakai oleh laporan **Iuran Bulanan**.

> **Sudah pernah deploy sebelumnya (sebelum ada kolom `period`)?** Buka
> Apps Script editor, pilih fungsi **`migrateAddPeriodColumn`** di dropdown
> toolbar, lalu klik **Run** sekali. Ini menyisipkan kolom `period` tanpa
> mengubah data yang sudah ada, lalu buat **New deployment** baru seperti
> biasa.

## 2. Pasang Apps Script

1. Di spreadsheet, buka menu **Extensions → Apps Script**.
2. Hapus isi file `Code.gs` default, lalu salin-tempel seluruh isi file
   [`google-apps-script/Code.gs`](../google-apps-script/Code.gs) dari project ini.
3. Simpan project (nama bebas, misalnya "Kas Siswa API").
4. Di dropdown fungsi (toolbar atas), pilih fungsi **`setupSheets`**, lalu klik
   **Run**. Ini akan otomatis membuat sheet `Students` dan `Ledger` dengan
   header kolom yang benar jika belum ada.
   - Saat pertama kali dijalankan, Google akan meminta otorisasi izin akses
     ke spreadsheet Anda — klik **Review permissions**, pilih akun Anda, lalu
     **Allow** (mungkin perlu klik "Advanced" → "Go to ... (unsafe)" karena
     skrip belum diverifikasi Google — ini normal untuk skrip pribadi).

## 3. Deploy sebagai Web App

1. Di editor Apps Script, klik **Deploy → New deployment**.
2. Pilih tipe **Web app**.
3. Isi konfigurasi:
   - **Execute as**: `Me (email Anda)`
   - **Who has access**: `Anyone` (agar Next.js app bisa memanggilnya tanpa
     login Google)
4. Klik **Deploy**, lalu salin **Web app URL** yang muncul (formatnya
   `https://script.google.com/macros/s/XXXXXXXX/exec`).

> Setiap kali Anda mengubah isi `Code.gs`, Anda perlu membuat **New
> deployment** baru (atau gunakan "Manage deployments" → edit versi) agar
> perubahan aktif di URL yang sama.

## 4. Hubungkan ke Aplikasi Next.js

1. Salin file `.env.example` menjadi `.env.local` di root project.
2. Isi variabel berikut dengan URL Web App dari langkah sebelumnya:

   ```
   NEXT_PUBLIC_GAS_API_URL=https://script.google.com/macros/s/XXXXXXXX/exec
   ```

3. Jalankan aplikasi (`npm run dev`), lalu buka halaman **Pengaturan** dan
   klik **Tes Koneksi** untuk memastikan aplikasi berhasil terhubung ke
   Apps Script.

## Catatan Keamanan

- Karena Web App di-deploy dengan akses "Anyone", siapa pun yang mengetahui
  URL-nya bisa memanggil API ini. Untuk penggunaan internal sekolah, ini
  umumnya cukup, tetapi jangan sebarkan URL secara publik.
- Untuk keamanan tambahan di masa depan (lihat roadmap "Multi User Login" di
  README), Anda bisa menambahkan validasi token sederhana di `doGet`/`doPost`
  dan menyimpannya sebagai environment variable di sisi Next.js.
- Google Apps Script memiliki kuota harian (jumlah eksekusi, waktu eksekusi).
  Untuk skala satu sekolah dengan pemakaian harian normal, kuota gratis
  biasanya lebih dari cukup.

## Troubleshooting

| Gejala | Kemungkinan Penyebab |
|---|---|
| "URL Google Apps Script belum dikonfigurasi" | `NEXT_PUBLIC_GAS_API_URL` belum diisi di `.env.local`, atau server dev belum di-restart setelah mengisi env. |
| Request gagal / CORS error | Pastikan deployment "Who has access" diset ke `Anyone`, dan gunakan URL yang berakhiran `/exec` (bukan `/dev`). |
| Data tidak muncul setelah deploy ulang | Pastikan Anda membuat deployment baru setelah mengubah `Code.gs`, atau update deployment yang sudah ada lewat "Manage deployments". |
| "Sheet tidak ditemukan: Students/Ledger" | Jalankan fungsi `setupSheets` sekali dari editor Apps Script. |
| Laporan "Iuran Bulanan" kosong padahal data sudah ada di sheet | Google Sheets kadang otomatis mengubah nilai `period` (`2026-07`) menjadi tipe Tanggal, bukan teks — ini membuat laporan gagal mencocokkan bulan. Jalankan fungsi **`fixPeriodColumnFormat`** sekali dari Apps Script editor, lalu deploy ulang. |
