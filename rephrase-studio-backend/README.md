# Rephrase Studio Backend — Gemini

Backend Node.js/TypeScript yang memanggil Gemini melalui SDK resmi `@google/genai`. Browser tidak menerima API key.

## Konfigurasi

```bash
cp .env.example .env
```

Isi `.env`:

```env
GEMINI_API_KEY=api_key_anda
GEMINI_MODEL=gemini-3.8-flash
PORT=3001
REQUEST_TIMEOUT_MS=45000
MAX_INPUT_CHARS=12000
ALLOWED_ORIGIN=http://localhost:5173
```

`.env` masuk `.gitignore`. Jangan memakai `VITE_GEMINI_API_KEY`; semua variabel `VITE_*` dapat dibaca browser.

Node 20 dapat membaca file environment dengan:

```bash
npm install
npm run build
node --env-file=.env dist/server.js
```

Untuk development:

```bash
set -a; source .env; set +a
npm run dev
```

## Endpoint

- `GET /api/health` — status konfigurasi tanpa membocorkan key.
- `GET /api/models` — daftar model yang tersedia untuk API key melalui `ai.models.list()`.
- `POST /api/rewrite` — endpoint internal yang dipakai `HttpTextGenerator`.
- `POST /api/documents/import` — unggah multipart `file` untuk DOCX, PDF, atau TXT (maksimum 10 MB).
- `POST /api/documents/export` — buat DOCX, PDF, atau TXT dari blok hasil.

## Dokumen

- DOCX dibaca langsung dari OOXML. Paragraf, urutan blok, heading yang dikenali, dan isi tabel diekstrak. Tabel ditandai tidak dapat diparafrase otomatis.
- PDF dibaca per halaman dengan PDF.js. Halaman tanpa lapisan teks yang memadai ditandai sebagai kemungkinan scan/OCR. PDF kosong tidak dilaporkan sebagai ekstraksi berhasil.
- TXT divalidasi agar bukan file biner dan dibagi menurut paragraf.
- Chunker memotong pada batas kalimat jika memungkinkan, mempertahankan urutan, dan melewati blok yang tidak boleh diproses.
- DOCX hasil ekspor dapat diedit dan mempertahankan paragraf/heading yang dikenali.
- PDF dibuat ulang dengan margin dan page breaking otomatis. Tata letak asli tidak diklaim terpelihara.
- Upload memakai memory storage; backend tidak menulis dokumen ke disk atau menyimpannya permanen.

Model awal `gemini-3.8-flash` mengikuti dokumentasi resmi Gemini tanggal 15 Oktober 2026. Ketersediaan tetap bergantung pada akun/API key. Jika API mengembalikan 404/model unavailable, backend tidak berpura-pura berhasil: respons menjadi `model_unavailable`. Jalankan `GET /api/models`, pilih model teks yang tersedia, lalu ubah `GEMINI_MODEL` dan restart backend.

## Format terstruktur

Backend meminta JSON terstruktur:

- `paraphrasedText`
- `warnings[]`
- `validation.meaningPreserved`
- `validation.protectedElementsPreserved`
- `validation.requiresHumanReview`
- `validation.notes[]`

Zod memvalidasi respons setelah Gemini mengembalikannya. JSON valid belum membuktikan makna benar; core frontend tetap menjalankan validator makna dan protected span.

## Keamanan dan error

- Validasi schema dan panjang dilakukan sebelum panggilan Gemini.
- Key hanya dibaca dari `GEMINI_API_KEY` oleh backend.
- Log startup hanya menulis status configured/not-configured, bukan key.
- Ditangani: key hilang, model tidak tersedia, input terlalu panjang, respons kosong/tidak valid, rate limit/quota, timeout, dan gangguan jaringan.
- Detail mentah error upstream tidak dikirim ke browser agar tidak membocorkan informasi internal.
