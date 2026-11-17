# Administrasi Pegawai KPPN

Starter aplikasi internal berbasis React + Vite + Supabase. Konfigurasi Vercel sudah disertakan.

## Kebutuhan
- Node.js 20.19+ atau 22.12+
- Akun Supabase
- Akun GitHub dan Vercel untuk deployment

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env
```

Isi `.env`:

```env
VITE_SUPABASE_URL=https://PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=SUPABASE_ANON_OR_PUBLISHABLE_KEY
```

Lalu jalankan:

```bash
npm run dev
```

Buka alamat lokal yang ditampilkan Vite (umumnya `http://localhost:5173`).

## Build untuk produksi

```bash
npm run build
npm run preview
```

Folder hasil build: `dist`.

## Deploy otomatis ke Vercel

1. Buat repository baru di GitHub.
2. Ekstrak folder proyek ini, lalu commit dan push seluruh isinya ke repository.
3. Masuk Vercel, pilih **Add New → Project**, lalu impor repository GitHub.
4. Framework preset: **Vite** (biasanya terdeteksi otomatis).
5. Build command: `npm run build`.
6. Output directory: `dist`.
7. Tambahkan environment variables `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` pada Project Settings → Environment Variables.
8. Deploy. Setiap push ke branch production akan memicu deployment baru.

`vercel.json` sudah mengatur fallback route ke `index.html` agar refresh halaman tidak menghasilkan 404.

## Status fitur pada starter

- Layout responsif, tema light, navigasi tiga menu.
- Rekap bulanan dengan tabel kehadiran ringkas, pemilih bulan/tahun, pencarian, dan ekspor CSV.
- Master pegawai dengan pencarian dan form tambah lokal.
- Status koneksi Supabase dan konfigurasi environment.
- Data demo hanya untuk pratinjau. Jika Supabase terkonfigurasi, daftar pegawai dibaca dari `public.employees`.

## Catatan sebelum digunakan operasional

Starter ini belum menyimpan perubahan kehadiran atau perubahan master pegawai ke database. Integrasi tulis, autentikasi, RLS/policies, katalog kode kehadiran final, transaksi LP, perhitungan uang makan, dan lembur perlu diselesaikan dan diuji sebelum dipakai untuk data pegawai sebenarnya. Jangan menaruh `service_role` key di frontend; gunakan hanya anon/publishable key dengan RLS yang benar.
