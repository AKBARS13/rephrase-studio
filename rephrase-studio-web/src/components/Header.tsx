import { Menu } from "lucide-react";
export function Header({ online, onMenu }: { online: boolean; onMenu: () => void }) {
  return <header className="app-header"><button className="icon-button mobile-only" onClick={onMenu} aria-label="Buka navigasi"><Menu size={21}/></button><div><h1>Writing workspace</h1><p>Perbaiki susunan kalimat tanpa mengubah fakta.</p></div><div className={`service-status ${online ? "online" : "offline"}`}><span aria-hidden="true"/>{online ? "Layanan siap" : "Koneksi terputus"}</div></header>;
}
