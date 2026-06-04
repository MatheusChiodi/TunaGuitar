import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { NAV } from "../lib/nav";
import { useSettings } from "../context/SettingsContext";
import { t } from "../lib/i18n";
import { resetTour } from "../lib/tour";

interface Cmd {
  id: string;
  label: string;
  hint: string;
  run: () => void;
}

const isTyping = () => {
  const el = document.activeElement as HTMLElement | null;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(el?.tagName ?? "") || !!el?.isContentEditable;
};

/** Paleta de comandos (Cmd/Ctrl+K ou "/") — busca fuzzy de módulos e ações. (QOL-02) */
export default function CommandPalette() {
  const navigate = useNavigate();
  const { lang, setA4, openSettings } = useSettings();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "/" && !open && !isTyping()) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  const commands = useMemo<Cmd[]>(() => {
    const mods: Cmd[] = NAV.map((n) => ({ id: `nav:${n.to}`, label: t(lang, n.key), hint: "Módulo", run: () => navigate(n.to) }));
    const actions: Cmd[] = [
      { id: "a4-440", label: "Referência A4 = 440 Hz", hint: "Ação", run: () => setA4(440) },
      { id: "a4-432", label: "Referência A4 = 432 Hz", hint: "Ação", run: () => setA4(432) },
      { id: "settings", label: "Abrir configurações", hint: "Ação", run: () => openSettings() },
      { id: "tour", label: "Iniciar tour guiado", hint: "Ação", run: () => { resetTour(); navigate("/"); } },
    ];
    return [...mods, ...actions];
  }, [lang, navigate, setA4, openSettings]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return commands.slice(0, 8);
    return commands
      .map((c) => {
        const text = c.label.toLowerCase();
        let score = 0;
        if (text.includes(q)) score += 100;
        if (text.startsWith(q)) score += 50;
        score += [...q].filter((ch) => text.includes(ch)).length;
        return { c, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((r) => r.c);
  }, [query, commands]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  const choose = (c?: Cmd) => {
    if (!c) return;
    setOpen(false);
    c.run();
  };

  return (
    <div
      className="fixed inset-0 z-[130] flex items-start justify-center bg-black/70 p-4 pt-[15vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Paleta de comandos"
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#333] bg-pedal-chassis shadow-2xl">
        <div className="flex items-center gap-2 border-b border-[#222] px-4">
          <Search className="h-4 w-4 shrink-0 text-on-surface-variant" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(results.length - 1, a + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(0, a - 1));
              } else if (e.key === "Enter") {
                e.preventDefault();
                choose(results[active]);
              }
            }}
            placeholder="Buscar módulos e ações…"
            aria-label="Buscar comando"
            className="w-full bg-transparent py-3.5 font-body text-sm text-on-surface outline-none placeholder:text-tertiary"
          />
          <kbd className="shrink-0 rounded border border-[#333] bg-[#0a0a0a] px-1.5 py-0.5 font-label text-[10px] text-tertiary">ESC</kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center font-share-tech text-sm text-on-surface-variant">Nada encontrado.</li>
          ) : (
            results.map((c, i) => (
              <li key={c.id}>
                <button
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(c)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left font-body text-sm transition-colors ${
                    i === active ? "bg-accent/15 text-accent" : "text-on-surface hover:bg-white/5"
                  }`}
                >
                  <span>{c.label}</span>
                  <span className="font-label text-[10px] uppercase tracking-widest text-tertiary">{c.hint}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
