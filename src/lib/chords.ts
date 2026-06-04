import { OPEN_STRINGS, pcName } from "./theory";

export interface Voicing {
  name: string;
  frets: number[]; // low→high; -1 = abafada (X), 0 = solta (O)
  fingers: number[]; // 0 = sem dedo
  baseFret: number; // primeira casa exibida (1 = pestana/capotraste do braço)
  barre?: number;
}

export interface ChordEntry {
  id: string;
  symbol: string;
  category: string;
  voicings: Voicing[];
}

export function voicingMidis(frets: number[]): number[] {
  const out: number[] = [];
  frets.forEach((f, i) => {
    if (f >= 0) out.push(OPEN_STRINGS[i] + f);
  });
  return out;
}

type Shape = { off: (number | null)[]; fingers: number[] };

const E_SHAPES: Record<string, Shape> = {
  major: { off: [0, 2, 2, 1, 0, 0], fingers: [1, 3, 4, 2, 1, 1] },
  minor: { off: [0, 2, 2, 0, 0, 0], fingers: [1, 3, 4, 1, 1, 1] },
  dom7: { off: [0, 2, 0, 1, 0, 0], fingers: [1, 3, 1, 2, 1, 1] },
  min7: { off: [0, 2, 0, 0, 0, 0], fingers: [1, 3, 1, 1, 1, 1] },
  maj7: { off: [0, 2, 1, 1, 0, 0], fingers: [1, 4, 2, 3, 1, 1] },
};

const A_SHAPES: Record<string, Shape> = {
  major: { off: [null, 0, 2, 2, 2, 0], fingers: [0, 1, 3, 3, 3, 1] },
  minor: { off: [null, 0, 2, 2, 1, 0], fingers: [0, 1, 3, 4, 2, 1] },
  dom7: { off: [null, 0, 2, 0, 2, 0], fingers: [0, 1, 3, 1, 4, 1] },
  min7: { off: [null, 0, 2, 0, 1, 0], fingers: [0, 1, 3, 1, 2, 1] },
  maj7: { off: [null, 0, 2, 1, 2, 0], fingers: [0, 1, 3, 2, 4, 1] },
};

const SUFFIX: Record<string, string> = { major: "", minor: "m", dom7: "7", min7: "m7", maj7: "maj7" };
const CATEGORY: Record<string, string> = {
  major: "Maiores",
  minor: "Menores",
  dom7: "Sétimas",
  min7: "Sétimas",
  maj7: "Sétimas",
};

function barreVoicing(shape: Shape, f: number, name: string): Voicing {
  return {
    name,
    frets: shape.off.map((o) => (o === null ? -1 : f + o)),
    fingers: shape.fingers,
    baseFret: f,
    barre: f,
  };
}

// Acordes abertos clássicos (low→high). Sobrescrevem/encabeçam as pestanas.
const OPEN: Record<string, { frets: number[]; fingers: number[] }> = {
  C: { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  A: { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
  G: { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
  E: { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  D: { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
  Am: { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
  Em: { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  Dm: { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  C7: { frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
  A7: { frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0] },
  G7: { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
  E7: { frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
  D7: { frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
  B7: { frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },
  Am7: { frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0] },
  Em7: { frets: [0, 2, 0, 0, 0, 0], fingers: [0, 2, 0, 0, 0, 0] },
  Dm7: { frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1] },
  Cmaj7: { frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
  Amaj7: { frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 3, 1, 4, 0] },
  Dmaj7: { frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 2, 3] },
  Fmaj7: { frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0] },
  Gmaj7: { frets: [3, 2, 0, 0, 0, 2], fingers: [3, 1, 0, 0, 0, 2] },
};

function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

const entries: ChordEntry[] = [];

// Maiores, menores e sétimas (pestanas + abertos) para os 12 tons.
for (let pc = 0; pc < 12; pc++) {
  const root = pcName(pc);
  for (const q of ["major", "minor", "dom7", "min7", "maj7"] as const) {
    const symbol = root + SUFFIX[q];
    const voicings: Voicing[] = [];
    const open = OPEN[symbol];
    if (open) voicings.push({ name: "Posição aberta", frets: open.frets, fingers: open.fingers, baseFret: 1 });

    const fE = mod12(pc - 4);
    if (fE >= 1) voicings.push(barreVoicing(E_SHAPES[q], fE, "Pestana · 6ª corda"));
    const fA = mod12(pc - 9);
    if (fA >= 1) voicings.push(barreVoicing(A_SHAPES[q], fA, "Pestana · 5ª corda"));

    if (voicings.length) entries.push({ id: `${symbol}-${q}`, symbol, category: CATEGORY[q], voicings });
  }
}

// Suspensos (sus4 forma de E, sus2 forma de A) para os 12 tons.
for (let pc = 0; pc < 12; pc++) {
  const root = pcName(pc);
  const fE = mod12(pc - 4) || 12;
  const fA = mod12(pc - 9) || 12;
  entries.push({
    id: `${root}sus4`,
    symbol: `${root}sus4`,
    category: "Suspensos",
    voicings: [barreVoicing({ off: [0, 2, 2, 2, 0, 0], fingers: [1, 3, 4, 4, 1, 1] }, fE, "Forma de E")],
  });
  entries.push({
    id: `${root}sus2`,
    symbol: `${root}sus2`,
    category: "Suspensos",
    voicings: [barreVoicing({ off: [null, 0, 2, 2, 0, 0], fingers: [0, 1, 3, 4, 1, 1] }, fA, "Forma de A")],
  });
}

// Diminutos (dim7 móvel, raiz na 5ª corda) e Aumentados (aug móvel).
for (let pc = 0; pc < 12; pc++) {
  const root = pcName(pc);
  let fd = mod12(pc - 9);
  if (fd < 1) fd += 12;
  entries.push({
    id: `${root}dim7`,
    symbol: `${root}dim7`,
    category: "Diminutos",
    voicings: [
      {
        name: "Forma móvel",
        frets: [-1, fd, fd + 1, fd - 1, fd + 1, -1],
        fingers: [0, 2, 3, 1, 4, 0],
        baseFret: fd - 1,
      },
    ],
  });
  let fa = mod12(pc - 9);
  if (fa < 2) fa += 12;
  entries.push({
    id: `${root}aug`,
    symbol: `${root}aug`,
    category: "Aumentados",
    voicings: [
      {
        name: "Forma móvel",
        frets: [-1, fa, fa - 1, fa - 2, fa - 2, -1],
        fingers: [0, 4, 3, 1, 1, 0],
        baseFret: fa - 2,
      },
    ],
  });
}

// Exóticos (abertos selecionados).
const EXOTIC: { symbol: string; frets: number[]; fingers: number[] }[] = [
  { symbol: "Cadd9", frets: [-1, 3, 2, 0, 3, 0], fingers: [0, 2, 1, 0, 3, 0] },
  { symbol: "G6", frets: [3, 2, 0, 0, 0, 0], fingers: [3, 2, 0, 0, 0, 0] },
  { symbol: "A6", frets: [-1, 0, 2, 2, 2, 2], fingers: [0, 0, 1, 1, 1, 1] },
  { symbol: "Dadd9", frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 2, 0] },
  { symbol: "Em9", frets: [0, 2, 0, 0, 0, 2], fingers: [0, 2, 0, 0, 0, 3] },
];
EXOTIC.forEach((e) =>
  entries.push({ id: e.symbol, symbol: e.symbol, category: "Exóticos", voicings: [{ name: "Posição aberta", frets: e.frets, fingers: e.fingers, baseFret: 1 }] }),
);

export const CHORDS: ChordEntry[] = entries;

export const CHORD_CATEGORIES = ["Maiores", "Menores", "Sétimas", "Diminutos", "Aumentados", "Suspensos", "Barra", "Exóticos"];
