# Rephrase Studio

Workspace parafrase Indonesia/Inggris dengan rule engine terpisah, backend Gemini, dukungan dokumen, pemeriksaan integritas akademik, dan kontrol privasi lokal.

## Struktur

```text
rephrase-studio-core/       Mesin aturan, protection layer, validator, integrity checker
rephrase-studio-backend/    Express, Gemini SDK, impor/ekspor dokumen
rephrase-studio-web/        React + TypeScript + Vite
scripts/                    Build, test, dan dev launcher
test-results/               Bukti E2E terakhir
rephrase-studio-test-report.md
```

## Prasyarat

- Node.js 20 atau lebih baru
- npm
- Gemini API key untuk generasi nyata

## Instalasi dan build

```bash
chmod +x scripts/*.sh
./scripts/build-all.sh
```

## Konfigurasi Gemini

```bash
cp rephrase-studio-backend/.env.example rephrase-studio-backend/.env
```

Isi file `.env`:

```env
GEMINI_API_KEY=key_anda
GEMINI_MODEL=gemini-3.8-flash
PORT=3001
REQUEST_TIMEOUT_MS=45000
MAX_INPUT_CHARS=12000
ALLOWED_ORIGIN=http://localhost:5173
```

`gemini-3.8-flash` adalah default, bukan jaminan ketersediaan akun. Jika backend mengembalikan `model_unavailable`, panggil `GET /api/models`, pilih model teks yang tersedia, ubah `GEMINI_MODEL`, lalu restart backend. Jangan memakai variabel `VITE_GEMINI_API_KEY`.

## Development

```bash
./scripts/dev.sh
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:3001`

Vite meneruskan `/api` ke backend.

## Production satu layanan

```bash
./scripts/build-all.sh
cd rephrase-studio-backend
SERVE_FRONTEND=true node --env-file=.env dist/server.js
```

Backend melayani API dan build frontend dari port `PORT`. Gunakan reverse proxy HTTPS, secret manager, batas request di edge, dan persistent process manager/container. Health check: `GET /api/health`.

## Production terpisah

1. Build core lalu frontend.
2. Deploy `rephrase-studio-web/dist` ke static hosting.
3. Deploy backend Node secara terpisah.
4. Build frontend dengan `VITE_REWRITE_API_URL=https://api.example.com/api/rewrite`.
5. Set `ALLOWED_ORIGIN=https://app.example.com` pada backend.
6. API key hanya berada di environment/secret manager backend.

Catatan: endpoint dokumen frontend memakai path `/api/documents/*`; gunakan reverse proxy origin yang sama. Untuk deployment lintas origin, proxy seluruh `/api`, bukan hanya rewrite.

## Pengujian

```bash
./scripts/test-all.sh
```

E2E membutuhkan Chromium Playwright dan system dependencies. Perintah serta hasil aktual ada di `rephrase-studio-test-report.md`.

## Data dan privasi

Riwayat dan draf bersifat opsional dan memakai localStorage browser. Data dapat hilang saat data browser dihapus dan tidak berpindah perangkat. Upload memakai memory storage backend dan tidak ditulis permanen. Teks yang diparafrase tetap dikirim ke backend/Gemini.
