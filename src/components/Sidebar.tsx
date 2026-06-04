import { useState } from "react";
import { NavLink } from "react-router-dom";
import { AudioLines, PanelLeftClose, PanelLeftOpen, Settings } from "lucide-react";
import { NAV } from "../lib/nav";
import { useSettings } from "../context/SettingsContext";
import { t } from "../lib/i18n";
import { load, save } from "../lib/storage";

export default function Sidebar() {
  const { openSettings, lang } = useSettings();
  const [collapsed, setCollapsed] = useState<boolean>(() => load("tg.sidebar", false));

  const toggle = () =>
    setCollapsed((c) => {
      save("tg.sidebar", !c);
      return !c;
    });

  return (
    <aside
      className={`no-print sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-outline-variant bg-surface-lowest transition-[width] duration-200 md:flex ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b border-outline-variant px-3">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <AudioLines className="h-5 w-5 shrink-0 text-accent" />
            <span className="truncate font-headline text-base font-bold uppercase tracking-tighter text-primary">TunaGuitar</span>
          </div>
        )}
        <button onClick={toggle} className="cursor-pointer rounded p-1.5 text-on-surface-variant transition-colors hover:text-primary" aria-label="Recolher menu">
          {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={t(lang, item.key)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 font-label text-xs tracking-wide transition-colors ${
                isActive
                  ? "border-l-2 border-accent bg-accent/10 text-accent"
                  : "border-l-2 border-transparent text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
              }`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate uppercase">{t(lang, item.key)}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-outline-variant p-2">
        <button
          onClick={openSettings}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 font-label text-xs uppercase tracking-wide text-on-surface-variant transition-colors hover:bg-white/5 hover:text-on-surface"
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && "Configurações"}
        </button>
      </div>
    </aside>
  );
}
