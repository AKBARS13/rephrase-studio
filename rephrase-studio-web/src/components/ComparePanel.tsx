export function ComparePanel({ source, result }: { source: string; result: string }) {
 if (!source || !result) return null;
 return <section className="compare-panel"><div className="compare-title"><h2>Perbandingan</h2><span>Periksa hasil sebelum digunakan</span></div><div className="compare-grid"><article><h3>Asli</h3><p>{source}</p></article><article><h3>Hasil</h3><p>{result}</p></article></div></section>;
}
