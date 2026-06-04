import type { Voicing } from "../lib/chords";

interface Props {
  voicing: Voicing;
  showFingers?: boolean;
}

const W = 130;
const H = 168;
const PAD_L = 18;
const PAD_R = 18;
const TOP = 34;
const BOTTOM = 14;
const FRETS = 5;
const STRINGS = 6;
const ACCENT = "#FF5555";

export default function ChordDiagram({ voicing, showFingers = true }: Props) {
  const { frets, fingers, baseFret, barre } = voicing;
  const gridW = W - PAD_L - PAD_R;
  const gridH = H - TOP - BOTTOM;
  const colGap = gridW / (STRINGS - 1);
  const rowGap = gridH / FRETS;
  const x = (s: number) => PAD_L + s * colGap;
  const stringX = Array.from({ length: STRINGS }, (_, i) => x(i));

  const barreEnds = barre
    ? frets.reduce<[number, number]>(
        (acc, f, i) => (f === barre ? [Math.min(acc[0], i), Math.max(acc[1], i)] : acc),
        [STRINGS, -1],
      )
    : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
      {/* casa de referência */}
      {baseFret > 1 && (
        <text x={PAD_L - 6} y={TOP + rowGap * 0.7} fontSize="11" fill="#e3bebb" textAnchor="end" fontFamily="Share Tech Mono, monospace">
          {baseFret}ª
        </text>
      )}

      {/* nut */}
      {baseFret === 1 && <rect x={PAD_L - 1} y={TOP - 4} width={gridW + 2} height={5} fill="#9a8784" rx="1" />}

      {/* casas */}
      {Array.from({ length: FRETS + 1 }, (_, r) => (
        <line key={`f${r}`} x1={PAD_L} y1={TOP + r * rowGap} x2={W - PAD_R} y2={TOP + r * rowGap} stroke="#444" strokeWidth="1" />
      ))}

      {/* cordas */}
      {stringX.map((sx, i) => (
        <line key={`s${i}`} x1={sx} y1={TOP} x2={sx} y2={H - BOTTOM} stroke="#666" strokeWidth="1" />
      ))}

      {/* marcadores X / O */}
      {frets.map((f, i) => {
        if (f > 0) return null;
        return f === -1 ? (
          <text key={`m${i}`} x={stringX[i]} y={TOP - 10} fontSize="12" fill="#8a6c6a" textAnchor="middle">
            ✕
          </text>
        ) : (
          <circle key={`m${i}`} cx={stringX[i]} cy={TOP - 13} r="4.5" fill="none" stroke="#e3bebb" strokeWidth="1.5" />
        );
      })}

      {/* pestana */}
      {barre && barreEnds && barreEnds[1] >= 0 && (
        <rect
          x={stringX[barreEnds[0]] - 6}
          y={TOP + 0.5 * rowGap - 7}
          width={stringX[barreEnds[1]] - stringX[barreEnds[0]] + 12}
          height="14"
          rx="7"
          fill={ACCENT}
          opacity="0.9"
        />
      )}

      {/* dedos */}
      {frets.map((f, i) => {
        if (f <= 0) return null;
        if (barre && f === barre) return null; // sob a pestana
        const rel = f - baseFret + 1;
        if (rel < 1 || rel > FRETS) return null;
        const cy = TOP + (rel - 0.5) * rowGap;
        return (
          <g key={`d${i}`}>
            <circle cx={stringX[i]} cy={cy} r={colGap * 0.32} fill={ACCENT} />
            {showFingers && fingers[i] > 0 && (
              <text x={stringX[i]} y={cy + 3.5} fontSize="9" fill="#1a0000" textAnchor="middle" fontWeight="700">
                {fingers[i]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
