import { motion } from "framer-motion";
import type { GuitarString } from "../lib/pitch";

interface Props {
  strings: GuitarString[];
  selected: number;
  onSelect: (i: number) => void;
}

export default function StringSelector({ strings, selected, onSelect }: Props) {
  return (
    <div className="mt-8 grid w-full grid-cols-6 gap-2">
      {strings.map((s, i) => {
        const isActive = i === selected;
        return (
          <motion.button
            key={s.label}
            onClick={() => onSelect(i)}
            whileTap={{ scale: 0.92 }}
            className={`relative flex aspect-square w-full cursor-pointer items-center justify-center rounded-full border-2 bg-linear-to-b from-[#333] to-[#1a1a1a] font-label text-sm transition-colors ${
              isActive
                ? "border-[#ff5555] text-[#ff5555] shadow-[inset_0_0_10px_rgba(255,85,85,0.5),0_0_15px_rgba(255,85,85,0.8)]"
                : "border-[#111] text-on-surface hover:border-[#555]"
            }`}
          >
            {s.label}
          </motion.button>
        );
      })}
    </div>
  );
}
