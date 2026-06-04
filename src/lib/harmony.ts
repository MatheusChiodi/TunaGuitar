import { DEGREE_LABELS, parseChord, pcName, type ParsedChord } from "./theory";

const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
// Qualidade diatônica esperada de cada grau na tonalidade maior.
const DIATONIC_QUALITY: Record<number, ParsedChord["quality"]> = {
  0: "maj",
  2: "min",
  4: "min",
  5: "maj",
  7: "maj",
  9: "min",
  11: "dim",
};
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"];

export interface AnalyzedChord extends ParsedChord {
  degree: string;
  tension: number;
}

/** Faz parse de "Am - F - C - G" (separadores - , | espaço). */
export function parseProgression(input: string): ParsedChord[] {
  return input
    .split(/[\s,|]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map(parseChord)
    .filter((c): c is ParsedChord => c !== null);
}

/** Detecta a tonalidade maior mais provável de uma progressão. */
export function detectKey(chords: ParsedChord[]): number {
  let bestKey = 0;
  let bestScore = -Infinity;
  for (let key = 0; key < 12; key++) {
    const scaleSet = new Set(MAJOR_SCALE.map((i) => (key + i) % 12));
    let score = 0;
    chords.forEach((c, idx) => {
      const deg = (c.root - key + 12) % 12;
      if (scaleSet.has(deg)) score += 1;
      if (DIATONIC_QUALITY[deg] === c.quality) score += 0.5;
      if (deg === 0 && idx === 0) score += 0.6; // tônica no início
      if (deg === 0 && idx === chords.length - 1) score += 0.8; // resolução no fim
      if (deg === 7 && c.quality === "dom") score += 0.5; // V7 reforça
    });
    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }
  return bestKey;
}

export function keyName(key: number): string {
  return `${pcName(key)} maior`;
}

function romanFor(root: number, key: number, quality: ParsedChord["quality"]): string {
  const deg = (root - key + 12) % 12;
  const scaleIdx = MAJOR_SCALE.indexOf(deg);
  let base: string;
  if (scaleIdx >= 0) base = ROMAN[scaleIdx];
  else base = "♭" + ROMAN[MAJOR_SCALE.indexOf((deg + 1) % 12) >= 0 ? MAJOR_SCALE.indexOf((deg + 1) % 12) : 0] || DEGREE_LABELS[deg];
  let label = quality === "min" || quality === "dim" ? base.toLowerCase() : base;
  if (quality === "dim") label += "°";
  if (quality === "aug") label += "+";
  if (quality === "dom") label += "7";
  return label;
}

const TENSION: Record<number, number> = {
  0: 0.05, // I repouso
  2: 0.45, // ii
  4: 0.5, // iii
  5: 0.4, // IV
  7: 0.95, // V tensão máxima
  9: 0.3, // vi
  11: 0.85, // vii°
};

export function analyze(chords: ParsedChord[], key: number): AnalyzedChord[] {
  return chords.map((c) => {
    const deg = (c.root - key + 12) % 12;
    return { ...c, degree: romanFor(c.root, key, c.quality), tension: TENSION[deg] ?? 0.6 };
  });
}

interface PatternDef {
  seq: number[];
  name: string;
  desc: string;
}
const PATTERNS: PatternDef[] = [
  { seq: [0, 7, 9, 5], name: "I–V–vi–IV", desc: "Progressão pop — usada em 1000+ músicas." },
  { seq: [0, 5, 7, 0], name: "I–IV–V–I", desc: "Blues/Rock clássico." },
  { seq: [0, 5, 7], name: "I–IV–V", desc: "Blues/Rock clássico." },
  { seq: [9, 5, 0, 7], name: "vi–IV–I–V", desc: "Variação pop melancólica." },
  { seq: [0, 9, 5, 7], name: "I–vi–IV–V", desc: "Doo-wop dos anos 50." },
  { seq: [2, 7, 0], name: "ii–V–I", desc: "Cadência de Jazz." },
];

/** Classifica a progressão por padrão conhecido (em graus da tonalidade). */
export function classify(chords: ParsedChord[], key: number): { name: string; desc: string } | null {
  const degs = chords.map((c) => (c.root - key + 12) % 12);
  for (const p of PATTERNS) {
    if (degs.length >= p.seq.length && p.seq.every((d, i) => degs[i] === d)) {
      return { name: p.name, desc: p.desc };
    }
  }
  return null;
}

// Transições prováveis por grau (regras tonais simplificadas).
const NEXT: Record<number, { deg: number; quality: ParsedChord["quality"]; style: string }[]> = {
  0: [
    { deg: 5, quality: "maj", style: "Mais pop" },
    { deg: 9, quality: "min", style: "Mais melancólico" },
    { deg: 7, quality: "dom", style: "Mais bluesy" },
  ],
  2: [
    { deg: 7, quality: "dom", style: "Soa mais jazzístico" },
    { deg: 0, quality: "maj", style: "Resolução" },
    { deg: 5, quality: "maj", style: "Mais pop" },
  ],
  4: [
    { deg: 9, quality: "min", style: "Mais melancólico" },
    { deg: 5, quality: "maj", style: "Mais pop" },
    { deg: 2, quality: "min", style: "Soa mais jazzístico" },
  ],
  5: [
    { deg: 7, quality: "maj", style: "Mais pop" },
    { deg: 0, quality: "maj", style: "Resolução" },
    { deg: 2, quality: "min", style: "Soa mais jazzístico" },
  ],
  7: [
    { deg: 0, quality: "maj", style: "Resolução clássica" },
    { deg: 9, quality: "min", style: "Cadência de engano" },
    { deg: 5, quality: "maj", style: "Mais bluesy" },
  ],
  9: [
    { deg: 5, quality: "maj", style: "Mais pop" },
    { deg: 2, quality: "min", style: "Soa mais jazzístico" },
    { deg: 7, quality: "maj", style: "Voltando à tensão" },
  ],
  11: [
    { deg: 0, quality: "maj", style: "Resolução" },
    { deg: 4, quality: "min", style: "Mais melancólico" },
  ],
};

const SUFFIX: Record<ParsedChord["quality"], string> = { maj: "", min: "m", dim: "°", aug: "+", dom: "7" };
const INTERVALS: Record<ParsedChord["quality"], number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  dom: [0, 4, 7, 10],
};

export interface Suggestion {
  symbol: string;
  root: number;
  intervals: number[];
  style: string;
}

/** Sugere continuações dado o último acorde da progressão. */
export function suggestNext(chords: ParsedChord[], key: number): Suggestion[] {
  if (!chords.length) return [];
  const last = chords[chords.length - 1];
  const deg = (last.root - key + 12) % 12;
  const options = NEXT[deg] ?? NEXT[0];
  return options.map((o) => {
    const root = (key + o.deg) % 12;
    return { symbol: pcName(root) + SUFFIX[o.quality], root, intervals: INTERVALS[o.quality], style: o.style };
  });
}

export { INTERVALS as QUALITY_INTERVALS };
