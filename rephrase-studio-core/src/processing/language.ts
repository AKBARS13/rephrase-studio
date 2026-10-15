import type { Language } from "../types.js";

const ID_WORDS = new Set(["yang", "dan", "dengan", "untuk", "dari", "pada", "adalah", "dalam", "tidak", "hasil", "penelitian", "ini", "terhadap", "sebagai"]);
const EN_WORDS = new Set(["the", "and", "with", "for", "from", "is", "are", "in", "not", "this", "that", "results", "study", "as", "of"]);

export function detectLanguage(text: string): { language: Language; confidence: number } {
  const words = text.toLowerCase().match(/[a-zà-ÿ]+/g) ?? [];
  let id = 0;
  let en = 0;
  for (const word of words) {
    if (ID_WORDS.has(word)) id++;
    if (EN_WORDS.has(word)) en++;
    if (/^(meng|men|mem|ber|ter|di|ke|pe).{3,}$/.test(word)) id += 0.25;
    if (/\b(th|tion|ing|ly)$/.test(word)) en += 0.15;
  }
  if (id === en) return { language: "id", confidence: 0.5 };
  const total = id + en || 1;
  const margin = Math.abs(id - en) / total;
  return { language: id > en ? "id" : "en", confidence: Math.min(0.99, 0.55 + margin * 0.44) };
}
