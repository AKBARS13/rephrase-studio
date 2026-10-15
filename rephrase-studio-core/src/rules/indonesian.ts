import type { RuleFinding, WritingStyle } from "../types.js";
import { findRegex, rhythmFindings } from "./common.js";

const GENERIC_OPENERS = /(?:^|(?<=[.!?]\s))(?:Tentu|Pastinya|Baik|Selain itu|Lebih lanjut|Tambahan lagi|Menariknya|Perlu dicatat|Yang penting|Memang|Secara keseluruhan),?/gimu;
const CLICHES = /\b(?:pada intinya|dalam ranah|ketika berbicara soal|bukti nyata dari|di sinilah .+? berperan|pada akhirnya|intinya adalah|tanpa basa-basi lagi|singkatnya|menjembatani kesenjangan|ke depannya)\b/giu;
const WATCH_WORDS = /\b(?:mendalami|menyelami|tapestri|lanskap|krusial|rumit|kompleks|teliti|cermat|memperkuat|meraih|mengumpulkan|menegaskan|interaksi|multidimensi|bernuansa|memupuk|mendorong|memanfaatkan|memfasilitasi|mencakup|transformatif|merevolusi|mulus|komprehensif|sinergi|menavigasi|menampilkan|menyoroti|menekankan|meningkatkan|inovatif|mutakhir|tangguh)\b/giu;
const PASSIVE = /\bdi(?:lakukan|gunakan|temukan|peroleh|analisis|ukur|hitung|uji|kembangkan|terapkan|hasilkan|simpulkan)\b/giu;
const THREE_PART = /\bpertama\b[\s\S]{0,250}\bkedua\b[\s\S]{0,250}\bketiga\b/giu;

export const INDONESIAN_RULE_SUMMARY = [
  "Hindari pembuka generik, klise, dan kosakata AI berulang kecuali istilah itu diperlukan.",
  "Variasikan panjang dan struktur kalimat; hindari parataxis dan pola tiga yang dibuat-buat.",
  "Utamakan kalimat aktif jika pelaku diketahui, tetapi pertahankan pasif prosedural yang sah.",
  "Jaga fakta, negasi, modality, sebab-akibat, angka, kutipan, sitasi, dan istilah teknis.",
  "Jangan menambah detail, data, referensi, atau contoh yang tidak ada dalam sumber.",
];

export function analyzeIndonesian(text: string, style: WritingStyle): RuleFinding[] {
  const findings = [
    ...findRegex(text, "id.generic-opener", GENERIC_OPENERS, "Pembuka generik harus dihapus atau diganti dengan hubungan yang spesifik.", "error"),
    ...findRegex(text, "id.cliche", CLICHES, "Frasa klise harus dipadatkan atau dibuat lebih konkret.", "error"),
    ...findRegex(text, "id.watch-word", WATCH_WORDS, "Periksa apakah kata ini bersifat teknis atau hanya pengisi."),
    ...findRegex(text, "id.rule-of-three", THREE_PART, "Pola tiga bagian terdeteksi; pertahankan jika jumlah tiga bersifat faktual."),
    ...rhythmFindings(text, "id"),
  ];
  if (!["academic", "lab-report", "technical-report"].includes(style)) {
    findings.push(...findRegex(text, "id.passive", PASSIVE, "Kalimat pasif mungkin dapat menyebut pelaku secara langsung.", "info"));
  }
  return findings;
}
