# Rephrase Studio Web

Frontend React + TypeScript untuk modul `@rephrase-studio/core`.

## Menjalankan

```bash
# build core lebih dahulu
cd ../rephrase-studio-core
npm install
npm run build

# jalankan frontend
cd ../rephrase-studio-web
npm install
npm run dev
```

Buka URL yang ditampilkan Vite. Build produksi:

```bash
npm run build
```

## Mode pemrosesan

Secara default, frontend memanggil `/api/rewrite`. Vite meneruskan rute `/api` ke backend pada `http://127.0.0.1:3001`, sehingga Gemini tetap dipanggil hanya oleh backend.

Untuk backend di origin lain, buat `.env.local`:

```env
VITE_REWRITE_API_URL=https://alamat-backend-anda/api/rewrite
```

Endpoint harus menerima `GenerationRequest` dari core dan mengembalikan JSON:

```json
{ "text": "hasil dengan placeholder tetap dipertahankan" }
```

Jangan menaruh API key rahasia dalam variabel `VITE_*`; browser dapat membacanya. Autentikasi sebaiknya dilakukan oleh backend/BFF.

## Fitur yang berfungsi

- Deteksi bahasa otomatis atau pilihan manual Indonesia/Inggris.
- Tujuh gaya penulisan dan tiga intensitas.
- Editor dengan hitungan kata/karakter serta batas 12.000 karakter.
- Parafrase melalui core lokal atau endpoint API opsional.
- Loading, sukses, input kosong, API error, kuota 429, offline, dan batas panjang.
- Salin hasil, unduh `.txt`, reset, dan undo.
- Unggah `.txt` sampai 300 KB.
- Perbandingan sumber/hasil.
- Riwayat lokal opsional sampai 20 item; dinonaktifkan secara default sampai pengguna memberi persetujuan.
- Riwayat menyimpan waktu, bahasa, gaya, intensitas, hasil, serta teks sumber hanya jika dipilih.
- Buka ulang, salin, unduh, hapus satu item, atau hapus seluruh riwayat.
- Pengaturan bahasa antarmuka, bahasa parafrase, gaya/intensitas default, penyimpanan draf, dan privasi.
- Tombol hapus semua data lokal untuk riwayat, draf, dan preferensi; preferensi lalu kembali ke nilai default.
- Navigasi keyboard, focus state, reduced motion, dan layout responsif.

## Struktur penting

```text
src/
├─ components/
│  ├─ Sidebar.tsx
│  ├─ Header.tsx
│  ├─ SettingsPanel.tsx
│  ├─ EditorPanel.tsx
│  ├─ ResultPanel.tsx
│  ├─ ComparePanel.tsx
│  ├─ HistoryView.tsx
│  └─ GuideView.tsx
├─ hooks/useOnlineStatus.ts
├─ App.tsx
├─ styles.css
├─ types.ts
└─ main.tsx
```

## Penyimpanan dan privasi

Frontend memakai `localStorage` tanpa akun atau database:

- `rephrase-studio-settings-v1`: preferensi pengguna.
- `rephrase-studio-history-v1`: maksimal 20 hasil, hanya saat riwayat diaktifkan.
- `rephrase-studio-draft-v1`: isi editor, hanya saat “ingat draf” diaktifkan.

Data ini dapat hilang saat pengguna menghapus data browser dan tidak berpindah perangkat. API key Gemini tidak pernah disimpan oleh frontend. Dokumen dan teks yang diproses tetap dikirim ke backend/Gemini sesuai konfigurasi layanan.

## Verifikasi yang sudah dilakukan

`npm run build` berhasil pada 15 Oktober 2026. Build memproses 1.599 modul dan menghasilkan bundle produksi tanpa error. Server pengembangan juga berhasil dijalankan pada `0.0.0.0:5173`.

Belum dilakukan pengujian browser otomatis Playwright pada tahap frontend ini. Tidak ada klaim bahwa seluruh kombinasi browser/perangkat sudah tervalidasi.
