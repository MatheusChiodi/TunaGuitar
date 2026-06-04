import { motion } from "framer-motion";
import { frequencyFromMidi, type GuitarString } from "../lib/pitch";
import Tip from "./Tip";

interface Props {
  strings: GuitarString[];
  selected: number;
  onSelect: (i: number) => void;
  a4?: number;
}

export default function StringSelector({ strings, selected, onSelect, a4 = 440 }: Props) {
  return (
    <div data-tour="strings" role="radiogroup" aria-label="Selecionar corda do violão" className="mt-8 grid w-full grid-cols-6 gap-2">
      {strings.map((s, i) => {
        const isActive = i === selected;
        const hz = frequencyFromMidi(s.midi, a4).toFixed(2);
        return (
          <Tip key={s.label} content={`${s.note}${s.octave} — ${hz} Hz`}>
            <motion.button
              onClick={() => onSelect(i)}
              role="radio"
              aria-checked={isActive}
              aria-label={`Corda ${s.note}${s.octave}, ${hz} hertz`}
              whileTap={{ scale: 0.92 }}
              className={`relative flex aspect-square w-full cursor-pointer items-center justify-center rounded-full border-2 bg-linear-to-b from-[#333] to-[#1a1a1a] font-label text-sm transition-colors ${
                isActive
                  ? "border-[#ff5555] text-[#ff5555] shadow-[inset_0_0_10px_rgba(255,85,85,0.5),0_0_15px_rgba(255,85,85,0.8)]"
                  : "border-[#111] text-on-surface hover:border-[#555]"
              }`}
            >
              <span aria-hidden="true">{s.label}</span>
            </motion.button>
          </Tip>
        );
      })}
    </div>
  );
}
