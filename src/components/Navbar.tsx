import { Link } from "react-router-dom";
import { AudioLines, Settings } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

/** Header de topo — apenas desktop. No mobile usamos a BottomTabBar. */
export default function Navbar() {
  const { openSettings } = useSettings();

  return (
    <nav className="fixed left-0 top-0 z-50 hidden h-16 w-full items-center justify-between border-b border-outline-variant bg-linear-to-b from-surface-bright to-surface px-10 shadow-md md:flex">
      <Link to="/" className="flex items-center gap-2">
        <AudioLines className="text-primary" />
        <span className="font-headline text-lg font-bold uppercase tracking-tighter text-primary">TunaGuitar</span>
      </Link>
      <button
        onClick={openSettings}
        className="cursor-pointer text-on-surface-variant transition-colors hover:text-primary"
        aria-label="Configurações"
      >
        <Settings className="h-5 w-5" />
      </button>
    </nav>
  );
}
