import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { AudioLines, BookOpen, Settings } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

const tabs = [
  { to: "/", label: "Afinador", icon: AudioLines, end: true },
  { to: "/manual", label: "Manual", icon: BookOpen, end: false },
];

const itemClass = "relative flex flex-1 cursor-pointer flex-col items-center gap-1 py-2.5 font-label text-[10px] tracking-wide transition-colors";

/** Tab bar inferior estilo app (Expo Router) — apenas mobile. */
export default function BottomTabBar() {
  const { openSettings } = useSettings();

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-stretch justify-around border-t border-outline-variant bg-linear-to-t from-surface-bright to-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.55)] md:hidden">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) => `${itemClass} ${isActive ? "text-primary" : "text-on-surface-variant"}`}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="tab-indicator"
                  transition={{ type: "spring", stiffness: 500, damping: 34 }}
                  className="absolute top-0 h-0.5 w-10 rounded-full bg-primary shadow-[0_0_8px_rgba(255,179,174,0.8)]"
                />
              )}
              <t.icon className="h-5 w-5" />
              {t.label}
            </>
          )}
        </NavLink>
      ))}
      <button onClick={openSettings} className={`${itemClass} text-on-surface-variant`}>
        <Settings className="h-5 w-5" />
        Config
      </button>
    </nav>
  );
}
