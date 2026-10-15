import type { RewriteIntensity, WritingStyle } from "@rephrase-studio/core";
import type { UiLanguage } from "../types";
const styles: Array<[WritingStyle, string]> = [["academic","Akademik"],["lab-report","Laporan praktikum"],["technical-report","Laporan teknis"],["formal","Formal"],["professional","Profesional"],["casual","Santai"],["general","Umum"]];
const intensity: Array<[RewriteIntensity, string, string]> = [["light","Ringan","Susunan diperbaiki, struktur dipertahankan."],["medium","Sedang","Struktur dan pilihan kata dapat berubah."],["high","Tinggi","Susunan ulang lebih jauh dengan validasi ketat."]];
interface Props { language: UiLanguage; style: WritingStyle; intensity: RewriteIntensity; setLanguage(v: UiLanguage): void; setStyle(v: WritingStyle): void; setIntensity(v: RewriteIntensity): void; }
export function SettingsPanel(p: Props) {
  return <section className="settings-panel" aria-labelledby="settings-title"><div className="panel-heading"><div><span className="step">01</span><h2 id="settings-title">Atur hasil</h2></div><p>Pilih cara teks ditulis ulang.</p></div>
    <label className="field-label" htmlFor="language">Bahasa</label><select id="language" value={p.language} onChange={e => p.setLanguage(e.target.value as UiLanguage)}><option value="auto">Deteksi otomatis</option><option value="id">Bahasa Indonesia</option><option value="en">English</option></select>
    <label className="field-label" htmlFor="style">Gaya penulisan</label><select id="style" value={p.style} onChange={e => p.setStyle(e.target.value as WritingStyle)}>{styles.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select>
    <fieldset><legend>Intensitas</legend><div className="intensity-list">{intensity.map(([v,l,d]) => <label className={p.intensity === v ? "intensity active" : "intensity"} key={v}><input type="radio" name="intensity" value={v} checked={p.intensity === v} onChange={() => p.setIntensity(v)}/><span><b>{l}</b><small>{d}</small></span></label>)}</div></fieldset>
    <div className="integrity-note"><b>Makna tetap utama</b><span>Angka, sitasi, kutipan, URL, dan istilah yang Anda tandai akan dilindungi.</span></div>
  </section>;
}
