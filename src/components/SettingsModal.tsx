import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { TUNINGS } from "../lib/pitch";

export default function SettingsModal() {
  const { isSettingsOpen, closeSettings, a4, setA4, tolerance, setTolerance, tuningId, setTuningId } = useSettings();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSettings();
    };
    if (isSettingsOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSettingsOpen, closeSettings]);

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <motion.div
          className="fixed inset-0 z-60 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeSettings}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-t-2xl border border-[#333] bg-pedal-chassis p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-2xl sm:pb-6"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-brushed-metal pointer-events-none absolute inset-0 opacity-30" />

            <div className="relative z-10">
              <header className="mb-6 flex items-center justify-between">
                <h2 className="font-headline text-xl font-bold uppercase tracking-widest text-primary">Configurações</h2>
                <button
                  onClick={closeSettings}
                  className="cursor-pointer rounded-full p-1 text-on-surface-variant transition-colors hover:text-primary"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              {/* Afinação */}
              <section className="mb-6">
                <h3 className="mb-2 font-label text-[11px] tracking-widest text-on-surface-variant">AFINAÇÃO</h3>
                <div className="flex flex-col gap-2">
                  {TUNINGS.map((t) => {
                    const active = t.id === tuningId;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTuningId(t.id)}
                        className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 text-left font-share-tech text-sm transition-colors ${
                          active
                            ? "border-primary/60 bg-primary/10 text-primary"
                            : "border-[#2a2a2a] bg-[#0a0a0a] text-on-surface hover:border-[#444]"
                        }`}
                      >
                        {t.name}
                        {active && <Check className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* A4 */}
              <section className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-label text-[11px] tracking-widest text-on-surface-variant">FREQUÊNCIA DE REFERÊNCIA (A4)</h3>
                  <span className="font-share-tech text-secondary">{a4} Hz</span>
                </div>
                <input type="range" min={430} max={450} value={a4} onChange={(e) => setA4(Number(e.target.value))} />
              </section>

              {/* Tolerância */}
              <section className="mb-2">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-label text-[11px] tracking-widest text-on-surface-variant">TOLERÂNCIA (AFINADO)</h3>
                  <span className="font-share-tech text-secondary">±{tolerance} cents</span>
                </div>
                <input type="range" min={1} max={15} value={tolerance} onChange={(e) => setTolerance(Number(e.target.value))} />
              </section>

              <footer className="mt-6 flex justify-center gap-4 border-t border-[#222] pt-4 font-label text-[10px] tracking-widest text-tertiary">
                <Link to="/termos" onClick={closeSettings} className="transition-colors hover:text-secondary">
                  TERMOS
                </Link>
                <Link to="/privacidade" onClick={closeSettings} className="transition-colors hover:text-secondary">
                  PRIVACIDADE
                </Link>
                <Link to="/manual" onClick={closeSettings} className="transition-colors hover:text-secondary">
                  MANUAL
                </Link>
              </footer>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
