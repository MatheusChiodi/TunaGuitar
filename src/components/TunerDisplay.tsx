import { AnimatePresence, motion } from "framer-motion";
import type { TuneStatus } from "../lib/pitch";

interface Props {
  note: string;
  octave: number;
  freq: number;
  cents: number;
  status: TuneStatus;
  active: boolean;
}

const TICKS = Array.from({ length: 11 }, (_, i) => -50 + i * 10);

function tickCoords(cent: number) {
  const angle = cent * 0.9; // -45..45 graus, 0 = topo
  const rad = (angle - 90) * (Math.PI / 180);
  const cx = 150;
  const cy = 150;
  const radius = 120;
  const inner = cent % 25 === 0 ? radius - 16 : radius - 8;
  return {
    x1: cx + inner * Math.cos(rad),
    y1: cy + inner * Math.sin(rad),
    x2: cx + radius * Math.cos(rad),
    y2: cy + radius * Math.sin(rad),
  };
}

export default function TunerDisplay({ note, octave, freq, cents, status, active }: Props) {
  const angle = Math.max(-50, Math.min(50, cents)) * 0.9;
  const noteColor =
    status === "tuned" ? "text-tuned" : status === "idle" ? "text-on-surface-variant" : "text-primary";

  return (
    <div className="relative flex h-56 w-full flex-col items-center justify-end overflow-hidden rounded-b-lg rounded-t-[150px] border-4 border-[#222] bg-dial-bg pb-8 shadow-[inset_0_4px_15px_rgba(0,0,0,0.9),inset_0_0_20px_rgba(0,0,0,0.5)] sm:h-64">
      <div className="analog-dial pointer-events-none absolute inset-0 opacity-20" />

      {/* Escala graduada */}
      <div className="absolute top-10 flex w-full justify-center">
        <svg width="300" height="150" viewBox="0 0 300 150" className="opacity-60">
          <path d="M 20 150 A 130 130 0 0 1 280 150" fill="none" stroke="#555" strokeWidth="2" />
          {TICKS.map((c) => {
            const { x1, y1, x2, y2 } = tickCoords(c);
            return (
              <line
                key={c}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={c === 0 ? "#ff5555" : "#888"}
                strokeWidth={c === 0 ? 3 : 1.5}
              />
            );
          })}
        </svg>
      </div>

      {/* Leitura central */}
      <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={active ? note + octave : "idle"}
            initial={{ opacity: 0, scale: 0.7, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -8 }}
            transition={{ duration: 0.18 }}
            className={`font-orbitron text-7xl leading-none drop-shadow-[0_0_15px_rgba(255,179,174,0.45)] sm:text-[84px] ${noteColor}`}
          >
            {active ? note : "–"}
            {active && <span className="align-top text-2xl text-on-surface-variant">{octave}</span>}
          </motion.div>
        </AnimatePresence>
        <div className="mt-1 font-share-tech text-2xl text-on-surface-variant">
          {active ? `${freq.toFixed(1)} Hz` : "0.0 Hz"}
        </div>
        {active && (
          <div className="font-share-tech text-sm text-secondary/80">
            {cents > 0 ? "+" : ""}
            {cents.toFixed(0)} cents
          </div>
        )}
      </div>

      {/* Ponteiro */}
      <motion.div
        className="absolute bottom-[-10px] left-1/2 z-20 h-[150px] w-1.5 origin-bottom -translate-x-1/2 rounded-t-full bg-needle-amber shadow-[0_0_12px_rgba(255,179,71,0.9)]"
        animate={{ rotate: angle }}
        transition={{ type: "spring", stiffness: 120, damping: 16, mass: 0.5 }}
      />

      {/* Pivô */}
      <div className="absolute bottom-[-20px] left-1/2 z-30 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-2 border-black bg-linear-to-b from-[#444] to-[#111] shadow-lg">
        <div className="h-4 w-4 rounded-full bg-[#222] shadow-inner" />
      </div>
    </div>
  );
}
