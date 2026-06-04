import { motion } from "framer-motion";
import { Power } from "lucide-react";

type Mode = "auto" | "manual";

interface Props {
  a4: number;
  onA4Change: (v: number) => void;
  mode: Mode;
  onModeChange: (m: Mode) => void;
  listening: boolean;
  onToggle: () => void;
}

export default function Controls({ a4, onA4Change, mode, onModeChange, listening, onToggle }: Props) {
  return (
    <section className="relative z-10 flex flex-col gap-5 p-4 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:gap-6 sm:p-6 sm:pb-6">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#333] to-transparent" />

      <div className="flex items-end justify-between">
        {/* Referência A4 */}
        <div className="flex w-1/2 flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="a4" className="font-label text-[11px] tracking-widest text-on-surface-variant">
              A4 REF
            </label>
            <span className="font-share-tech text-secondary">{a4} Hz</span>
          </div>
          <input
            id="a4"
            type="range"
            min={430}
            max={450}
            value={a4}
            onChange={(e) => onA4Change(Number(e.target.value))}
          />
        </div>

        {/* Modo Auto/Manual */}
        <div className="flex flex-col items-end gap-2">
          <span className="font-label text-[11px] tracking-widest text-on-surface-variant">MODO</span>
          <button
            type="button"
            role="switch"
            aria-checked={mode === "auto"}
            onClick={() => onModeChange(mode === "auto" ? "manual" : "auto")}
            className="flex h-7 w-16 cursor-pointer items-center rounded-full border border-[#222] bg-[#0a0a0a] px-1 shadow-inner"
            aria-label="Alternar modo automático ou manual"
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
              className={`h-5 w-5 rounded-full shadow ${mode === "auto" ? "ml-auto bg-tuned" : "mr-auto bg-secondary"}`}
            />
          </button>
          <div className="flex gap-2 font-label text-[10px]">
            <span className={mode === "manual" ? "text-secondary" : "text-on-surface-variant"}>MAN</span>
            <span className={mode === "auto" ? "text-tuned" : "text-on-surface-variant"}>AUTO</span>
          </div>
        </div>
      </div>

      {/* Botão stomp */}
      <div className="mt-2 flex justify-center">
        <motion.button
          onClick={onToggle}
          whileTap={{ scale: 0.94, y: 4 }}
          className="group relative flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-full border-4 border-[#222] bg-[radial-gradient(circle,#333_0%,#1a1a1a_100%)] shadow-[0_8px_15px_rgba(0,0,0,0.6),inset_0_2px_5px_rgba(255,255,255,0.2)]"
        >
          <div className="pointer-events-none absolute inset-2 rounded-full border border-white/5" />
          <div className="pointer-events-none absolute inset-4 rounded-full border border-black/20" />
          <Power
            className={`h-8 w-8 transition-colors ${listening ? "text-led-red" : "text-on-surface/80 group-hover:text-on-surface"}`}
          />
          <span className="text-center font-label text-[11px] leading-tight tracking-wide text-on-surface/80">
            {listening ? (
              "PARAR"
            ) : (
              <>
                INICIAR
                <br />
                AFINAÇÃO
              </>
            )}
          </span>
        </motion.button>
      </div>
    </section>
  );
}
