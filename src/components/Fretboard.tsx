import { DEGREE_LABELS, OPEN_STRINGS, pcName } from "../lib/theory";

export type FretDisplay = "notes" | "degrees";

interface Props {
  pcs: number[]; // pitch classes da escala (qualquer ordem)
  tonic: number;
  display?: FretDisplay;
  frets?: number;
  window?: [number, number] | null; // realça posição ativa
  secondary?: number[]; // 3ª e 7ª
}

const ACCENT = "#FF5555";
const SECONDARY = "#ffb95a";
const DEFAULT = "#3a3939";
const STRINGS = 6;
const MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21];

export default function Fretboard({ pcs, tonic, display = "notes", frets = 15, window = null, secondary = [] }: Props) {
  const set = new Set(pcs);
  const sec = new Set(secondary);
  const pad = 28;
  const top = 18;
  const fretW = 46;
  const rowGap = 30;
  const width = pad + 24 + frets * fretW + 16;
  const height = top + STRINGS * rowGap + 20;
  const stringY = (s: number) => top + (STRINGS - 1 - s) * rowGap; // low E embaixo
  const fretX = (f: number) => pad + 24 + (f - 0.5) * fretW; // centro da casa
  const nutX = pad + 24;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[760px]" role="img">
      {/* inlays */}
      {MARKERS.filter((m) => m <= frets).map((m) => (
        <circle key={`mk${m}`} cx={fretX(m)} cy={height - 10} r={m % 12 === 0 ? 4 : 3} fill="#5a403e" />
      ))}

      {/* nut */}
      <rect x={nutX - 4} y={top - 4} width="4" height={(STRINGS - 1) * rowGap + 8} fill="#9a8784" />

      {/* casas */}
      {Array.from({ length: frets + 1 }, (_, f) => (
        <line key={`fl${f}`} x1={nutX + f * fretW} y1={top} x2={nutX + f * fretW} y2={top + (STRINGS - 1) * rowGap} stroke="#3a3a3a" strokeWidth="1" />
      ))}
      {Array.from({ length: frets }, (_, f) => (
        <text key={`fn${f}`} x={fretX(f + 1)} y={top - 6} fontSize="9" fill="#7a6663" textAnchor="middle" fontFamily="Share Tech Mono, monospace">
          {f + 1}
        </text>
      ))}

      {/* cordas */}
      {Array.from({ length: STRINGS }, (_, s) => (
        <line key={`st${s}`} x1={nutX} y1={stringY(s)} x2={nutX + frets * fretW} y2={stringY(s)} stroke="#555" strokeWidth={0.6 + (STRINGS - s) * 0.18} />
      ))}

      {/* notas */}
      {Array.from({ length: STRINGS }, (_, s) =>
        Array.from({ length: frets + 1 }, (_, f) => {
          const pc = (OPEN_STRINGS[s] + f) % 12;
          if (!set.has(pc)) return null;
          const isTonic = pc === tonic;
          const isSec = sec.has(pc);
          const cx = f === 0 ? nutX - 14 : fretX(f);
          const cy = stringY(s);
          const inWindow = !window || (f >= window[0] && f <= window[1]);
          const fill = isTonic ? ACCENT : isSec ? SECONDARY : DEFAULT;
          const semis = (pc - tonic + 12) % 12;
          const label = display === "degrees" ? DEGREE_LABELS[semis] : pcName(pc);
          return (
            <g key={`n${s}-${f}`} opacity={inWindow ? 1 : 0.18}>
              <title>{`${pcName(pc)} · grau ${DEGREE_LABELS[semis]} · casa ${f}`}</title>
              <circle cx={cx} cy={cy} r="11" fill={fill} stroke={isTonic ? "#fff" : "#0a0a0a"} strokeWidth={isTonic ? 1.5 : 1} />
              <text x={cx} y={cy + 3.5} fontSize="9" fill={isTonic || isSec ? "#1a0000" : "#e5e2e1"} textAnchor="middle" fontWeight="700">
                {label}
              </text>
            </g>
          );
        }),
      )}
    </svg>
  );
}
