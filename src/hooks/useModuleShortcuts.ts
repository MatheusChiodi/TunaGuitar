import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NAV } from "../lib/nav";

const isTyping = () => {
  const el = document.activeElement as HTMLElement | null;
  const tag = el?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || !!el?.isContentEditable;
};

/** Atalhos globais 1-9/0 para navegar entre módulos (gated por shortcutsEnabled). */
export function useModuleShortcuts(enabled: boolean) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping()) return;
      let idx = -1;
      if (e.key >= "1" && e.key <= "9") idx = Number(e.key) - 1;
      else if (e.key === "0") idx = 9;
      if (idx >= 0 && NAV[idx]) {
        e.preventDefault();
        navigate(NAV[idx].to);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, navigate]);
}
