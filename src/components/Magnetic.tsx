import type { ReactNode } from "react";
import { useMagnetic } from "../hooks/useMagnetic";

/** Envoltório que aplica o efeito magnético sem disputar o transform com o framer-motion interno. */
export default function Magnetic({ children, strength, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useMagnetic<HTMLSpanElement>(strength);
  return (
    <span ref={ref} className={`inline-flex ${className ?? ""}`}>
      {children}
    </span>
  );
}
