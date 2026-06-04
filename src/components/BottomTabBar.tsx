import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { NAV } from "../lib/nav";
import { useSettings } from "../context/SettingsContext";
import { t } from "../lib/i18n";

const itemClass =
  "relative flex shrink-0 basis-1/5 cursor-pointer flex-col items-center gap-1 py-2.5 font-label text-[9px] tracking-wide transition-colors";

/** Tab bar inferior estilo app nativo (scroll horizontal) — apenas mobile. */
export default function BottomTabBar() {
  const { lang } = useSettings();

  return (
    <nav className="no-print no-scrollbar fixed bottom-0 left-0 z-50 flex w-full items-stretch overflow-x-auto border-t border-outline-variant bg-linear-to-t from-surface-bright to-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.55)] md:hidden">
      {NAV.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `${itemClass} ${isActive ? "text-accent" : "text-on-surface-variant"}`}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="tab-indicator"
                  transition={{ type: "spring", stiffness: 500, damping: 34 }}
                  className="absolute top-0 h-0.5 w-8 rounded-full bg-accent shadow-[0_0_8px_rgba(255,85,85,0.9)]"
                />
              )}
              <tab.icon className="h-5 w-5" />
              {t(lang, tab.key)}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
