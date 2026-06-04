// Teoria musical compartilhada por todos os módulos.

export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/** Cifra brasileira ↔ internacional. */
export const BR_NAMES: Record<string, string> = {
  C: "Dó",
  D: "Ré",
  E: "Mi",
  F: "Fá",
  G: "Sol",
  A: "Lá",
  B: "Si",
};

/** Cordas soltas do violão (afinação padrão), graves → agudos, em MIDI. */
export const OPEN_STRINGS = [40, 45, 50, 55, 59, 64];

export const A4 = 440;

export function midiToFreq(midi: number, a4 = A4): number {
  return a4 * Math.pow(2, (midi - 69) / 12);
}

export function pcName(pc: number): string {
  return NOTE_NAMES[((pc % 12) + 12) % 12];
}

export function midiName(midi: number): string {
  return `${pcName(midi)}${Math.floor(midi / 12) - 1}`;
}

export interface ScaleDef {
  id: string;
  name: string;
  intervals: number[];
}

export const SCALES: ScaleDef[] = [
  { id: "major", name: "Maior (Jônio)", intervals: [0, 2, 4, 5, 7, 9, 11] },
  { id: "naturalMinor", name: "Menor Natural (Eólio)", intervals: [0, 2, 3, 5, 7, 8, 10] },
  { id: "harmonicMinor", name: "Menor Harmônica", intervals: [0, 2, 3, 5, 7, 8, 11] },
  { id: "melodicMinor", name: "Menor Melódica", intervals: [0, 2, 3, 5, 7, 9, 11] },
  { id: "pentatonicMajor", name: "Pentatônica Maior", intervals: [0, 2, 4, 7, 9] },
  { id: "pentatonicMinor", name: "Pentatônica Menor", intervals: [0, 3, 5, 7, 10] },
  { id: "blues", name: "Blues", intervals: [0, 3, 5, 6, 7, 10] },
  { id: "dorian", name: "Dórico", intervals: [0, 2, 3, 5, 7, 9, 10] },
  { id: "phrygian", name: "Frígio", intervals: [0, 1, 3, 5, 7, 8, 10] },
  { id: "lydian", name: "Lídio", intervals: [0, 2, 4, 6, 7, 9, 11] },
  { id: "mixolydian", name: "Mixolídio", intervals: [0, 2, 4, 5, 7, 9, 10] },
  { id: "locrian", name: "Lócrio", intervals: [0, 1, 3, 5, 6, 8, 10] },
  { id: "chromatic", name: "Cromática", intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
];

/** Rótulo do grau a partir do intervalo em semitons. */
export const DEGREE_LABELS: Record<number, string> = {
  0: "I",
  1: "♭II",
  2: "II",
  3: "♭III",
  4: "III",
  5: "IV",
  6: "♭V",
  7: "V",
  8: "♭VI",
  9: "VI",
  10: "♭VII",
  11: "VII",
};

export interface IntervalDef {
  semitones: number;
  name: string;
  symbol: string;
  example: string;
}

export const INTERVALS: IntervalDef[] = [
  { semitones: 0, name: "Uníssono", symbol: "J1", example: "mesma nota" },
  { semitones: 1, name: "2ª menor", symbol: "m2", example: "Tubarão (tema)" },
  { semitones: 2, name: "2ª maior", symbol: "M2", example: "Parabéns a Você" },
  { semitones: 3, name: "3ª menor", symbol: "m3", example: "Smoke on the Water" },
  { semitones: 4, name: "3ª maior", symbol: "M3", example: "Oh When the Saints" },
  { semitones: 5, name: "4ª justa", symbol: "J4", example: "Marcha Nupcial" },
  { semitones: 6, name: "Trítono", symbol: "TT", example: "The Simpsons" },
  { semitones: 7, name: "5ª justa", symbol: "J5", example: "Star Wars (tema)" },
  { semitones: 8, name: "6ª menor", symbol: "m6", example: "Love Story" },
  { semitones: 9, name: "6ª maior", symbol: "M6", example: "My Bonnie" },
  { semitones: 10, name: "7ª menor", symbol: "m7", example: "Star Trek (tema)" },
  { semitones: 11, name: "7ª maior", symbol: "M7", example: "Take On Me" },
  { semitones: 12, name: "8ª justa", symbol: "J8", example: "Somewhere Over the Rainbow" },
];

export interface ChordQuality {
  id: string;
  name: string;
  suffix: string;
  intervals: number[];
}

export const CHORD_QUALITIES: ChordQuality[] = [
  { id: "major", name: "Maior", suffix: "", intervals: [0, 4, 7] },
  { id: "minor", name: "Menor", suffix: "m", intervals: [0, 3, 7] },
  { id: "dim", name: "Diminuto", suffix: "dim", intervals: [0, 3, 6] },
  { id: "aug", name: "Aumentado", suffix: "aug", intervals: [0, 4, 8] },
  { id: "dom7", name: "7ª Dominante", suffix: "7", intervals: [0, 4, 7, 10] },
  { id: "min7", name: "Menor com 7ª", suffix: "m7", intervals: [0, 3, 7, 10] },
  { id: "maj7", name: "7ª Maior", suffix: "maj7", intervals: [0, 4, 7, 11] },
];

/** Notas (pitch classes) de uma escala a partir da tônica. */
export function scalePitchClasses(tonic: number, scale: ScaleDef): number[] {
  return scale.intervals.map((i) => (tonic + i) % 12);
}

/** Transpõe um nome de acorde (cifra) em N semitons. */
export function transposeChord(symbol: string, semitones: number): string {
  const match = symbol.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return symbol;
  const [, root, rest] = match;
  const pc = (noteToPc(root) + semitones + 1200) % 12;
  // Preserva baixo invertido (slash chord)
  const restTransposed = rest.replace(/\/([A-G][#b]?)/, (_, b: string) => `/${pcName((noteToPc(b) + semitones + 1200) % 12)}`);
  return pcName(pc) + restTransposed;
}

/** Converte nome de nota (com # ou b) em pitch class. */
export function noteToPc(s: string): number {
  const m = s.match(/^([A-Ga-g])([#b]?)/);
  if (!m) return 0;
  const base: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let pc = base[m[1].toUpperCase()] ?? 0;
  if (m[2] === "#") pc += 1;
  else if (m[2] === "b") pc -= 1;
  return ((pc % 12) + 12) % 12;
}

export interface ParsedChord {
  symbol: string;
  root: number;
  intervals: number[];
  bass: number | null;
  quality: "maj" | "min" | "dim" | "aug" | "dom";
}

const QUALITY_TABLE: { re: RegExp; intervals: number[]; quality: ParsedChord["quality"] }[] = [
  { re: /^maj7|^M7/, intervals: [0, 4, 7, 11], quality: "maj" },
  { re: /^maj9/, intervals: [0, 4, 7, 11, 14], quality: "maj" },
  { re: /^maj/, intervals: [0, 4, 7], quality: "maj" },
  { re: /^m7b5|^ø/, intervals: [0, 3, 6, 10], quality: "dim" },
  { re: /^m7|^min7|^-7/, intervals: [0, 3, 7, 10], quality: "min" },
  { re: /^m9|^min9/, intervals: [0, 3, 7, 10, 14], quality: "min" },
  { re: /^m6|^min6/, intervals: [0, 3, 7, 9], quality: "min" },
  { re: /^dim7|^°7|^o7/, intervals: [0, 3, 6, 9], quality: "dim" },
  { re: /^dim|^°|^o/, intervals: [0, 3, 6], quality: "dim" },
  { re: /^aug|^\+/, intervals: [0, 4, 8], quality: "aug" },
  { re: /^sus2/, intervals: [0, 2, 7], quality: "maj" },
  { re: /^sus4|^sus/, intervals: [0, 5, 7], quality: "maj" },
  { re: /^add9/, intervals: [0, 4, 7, 14], quality: "maj" },
  { re: /^9/, intervals: [0, 4, 7, 10, 14], quality: "dom" },
  { re: /^7/, intervals: [0, 4, 7, 10], quality: "dom" },
  { re: /^6/, intervals: [0, 4, 7, 9], quality: "maj" },
  { re: /^m|^min|^-/, intervals: [0, 3, 7], quality: "min" },
];

/** Faz o parse de uma cifra (ex.: "Am7", "G/B", "C#dim") em estrutura harmônica. */
export function parseChord(symbol: string): ParsedChord | null {
  const m = symbol.trim().match(/^([A-G][#b]?)(.*)$/);
  if (!m) return null;
  const root = noteToPc(m[1]);
  let rest = m[2];
  let bass: number | null = null;
  const slash = rest.match(/\/([A-G][#b]?)\s*$/);
  if (slash && slash.index !== undefined) {
    bass = noteToPc(slash[1]);
    rest = rest.slice(0, slash.index);
  }
  let intervals = [0, 4, 7];
  let quality: ParsedChord["quality"] = "maj";
  for (const q of QUALITY_TABLE) {
    if (q.re.test(rest)) {
      intervals = q.intervals;
      quality = q.quality;
      break;
    }
  }
  return { symbol: symbol.trim(), root, intervals, bass, quality };
}

/** Detecta tokens de acorde em um texto livre. */
export function isChordToken(token: string): boolean {
  return /^[A-G][#b]?(m|maj|min|dim|aug|sus|add|°|ø|o|\+|-|\d|M|b5)*(\/[A-G][#b]?)?$/.test(token) && /[A-G]/.test(token[0]);
}
