# Rephrase Studio Core

Modul inti TypeScript untuk analisis, perlindungan elemen sensitif, parafrase, dan validasi teks Indonesia/Inggris.

## Status

Versi `0.1.0` adalah fondasi yang telah dibangun dan diuji. Mesin offline melakukan perbaikan konservatif. Penulisan ulang yang lebih luas (terutama intensitas tinggi) membutuhkan implementasi `TextGenerator`, tetapi tetap melewati protection layer dan validator yang sama.

Hasil uji terakhir: **8 lulus, 0 gagal** dengan `npm test` pada 15 Oktober 2026.

## Struktur

```text
src/
├─ api/generator.ts             # batas pemanggilan API + adapter fungsi
├─ engines/
│  ├─ base.ts                   # pipeline bersama
│  ├─ indonesian.ts             # IndonesianRewriteEngine
│  └─ english.ts                # EnglishRewriteEngine
├─ processing/
│  ├─ deterministic.ts          # fallback konservatif
│  ├─ language.ts               # deteksi bahasa
│  └─ protect.ts                # placeholder + restore
├─ rules/
│  ├─ common.ts
│  ├─ indonesian.ts             # aturan Anti AI Writer
│  └─ english.ts                # aturan Stop Slop
├─ validation/meaning.ts        # protected span, negasi, modality, lexical anchor
├─ index.ts                     # RephraseStudioCore router
└─ types.ts
```

## Menjalankan

```bash
npm install
npm test
```

Build saja:

```bash
npm run build
```

## Contoh penggunaan offline

```ts
import { RephraseStudioCore } from "./src/index.js";

const core = new RephraseStudioCore();
const result = await core.rewrite(
  "Selain itu, model CNN meningkatkan akurasi menjadi 92,5% (Siregar, 2024).",
  {
    language: "auto",
    style: "academic",
    intensity: "medium",
    technicalTerms: ["CNN"],
    properNames: ["Siregar"],
  },
);

console.log(result.text);
console.log(result.validation);
console.log(result.finalFindings);
console.log(result.warnings);
```

## Menghubungkan API model

```ts
import { HttpTextGenerator, RephraseStudioCore } from "./src/index.js";

const generator = new HttpTextGenerator(
  "https://internal.example/v1/rewrite",
  fetch,
  { authorization: `Bearer ${process.env.REWRITE_TOKEN}` },
);
const core = new RephraseStudioCore(generator);
```

Endpoint menerima `GenerationRequest` terstruktur. Instruksi Indonesia dan Inggris berasal dari engine terpisah; keduanya tidak dilebur menjadi satu prompt umum. Model wajib mengembalikan placeholder persis satu kali. Jika angka, sitasi, kutipan, istilah, negasi, atau modality bermasalah, validator memberi peringatan/error dan pipeline dapat meminta perbaikan maksimal dua kali.

## Gaya dan intensitas

Gaya: `academic`, `lab-report`, `technical-report`, `formal`, `professional`, `casual`, `general`.

Intensitas: `light`, `medium`, `high`. Nilai intensitas diteruskan sebagai constraint kepada generator. Intensitas tidak menonaktifkan proteksi atau validasi.

## Academic Integrity & Source Preservation

Fungsi `checkAcademicIntegrity(source, result, options)` menghasilkan laporan yang dapat ditelusuri dengan indeks karakter dan cuplikan kalimat. Pemeriksaan meliputi kutipan langsung, sitasi author–year/numerik, DOI, URL, angka, nama/istilah, atribusi, kualifikasi klaim, korelasi vs sebab-akibat, pernyataan faktual utama, serta urutan prosedur teknis.

Status laporan:

- `clear`: Tidak ditemukan masalah pada pemeriksaan otomatis.
- `review`: Perlu pemeriksaan pengguna.
- `changed`: Ditemukan perubahan yang perlu ditinjau.

Modul tidak memverifikasi bahwa sebuah referensi benar dan tidak menyatakan teks bebas plagiarisme.

## Batasan versi ini

- Validator kesamaan makna bersifat konservatif dan heuristik; belum memakai NLI atau penilaian manusia.
- Nama diri yang tidak diberikan melalui `properNames` belum dideteksi otomatis karena deteksi kapitalisasi sederhana sering salah.
- Istilah teknis harus diberikan melalui `technicalTerms` agar mendapat jaminan placeholder.
- Sitasi yang sangat tidak lazim, persamaan kompleks, tabel, DOCX, dan PDF belum tercakup.
- Mesin offline tidak melakukan penulisan ulang semantik luas. Ini disengaja agar tidak mengarang atau menggeser makna.
- Tidak ada klaim bebas plagiarisme atau lolos detektor AI.
