export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export type TuneStatus = "flat" | "tuned" | "sharp" | "idle";

export interface GuitarString {
  label: string;
  note: string;
  octave: number;
  midi: number;
}

/** Nota e oitava reais a partir do número MIDI. */
export function noteFromMidi(midi: number) {
  return {
    note: NOTE_NAMES[midi % 12],
    octave: Math.floor(midi / 12) - 1,
  };
}

function buildStrings(midis: number[]): GuitarString[] {
  return midis.map((midi) => {
    const { note, octave } = noteFromMidi(midi);
    return { midi, note, octave, label: `${note}${octave}` };
  });
}

export interface Tuning {
  id: string;
  name: string;
  strings: GuitarString[];
}

/** Afinações reais disponíveis (graves → agudos). */
export const TUNINGS: Tuning[] = [
  { id: "standard", name: "Padrão · E A D G B E", strings: buildStrings([40, 45, 50, 55, 59, 64]) },
  { id: "dropd", name: "Drop D · D A D G B E", strings: buildStrings([38, 45, 50, 55, 59, 64]) },
  { id: "eb", name: "Meio tom abaixo · Eb", strings: buildStrings([39, 44, 49, 54, 58, 63]) },
  { id: "dadgad", name: "DADGAD · D A D G A D", strings: buildStrings([38, 45, 50, 55, 57, 62]) },
];

export const STANDARD_TUNING = TUNINGS[0].strings;

export function getTuning(id: string): Tuning {
  return TUNINGS.find((t) => t.id === id) ?? TUNINGS[0];
}

export function frequencyFromMidi(midi: number, a4 = 440): number {
  return a4 * Math.pow(2, (midi - 69) / 12);
}

export function midiFromFrequency(freq: number, a4 = 440): number {
  return Math.round(12 * Math.log2(freq / a4) + 69);
}

/** Desvio em cents entre a frequência detectada e a nota MIDI alvo. */
export function centsOff(freq: number, midi: number, a4 = 440): number {
  return 1200 * Math.log2(freq / frequencyFromMidi(midi, a4));
}

/** Índice da corda mais próxima (menor desvio em cents). */
export function nearestStringIndex(freq: number, strings: GuitarString[], a4 = 440): number {
  let best = 0;
  let bestDiff = Infinity;
  strings.forEach((s, i) => {
    const diff = Math.abs(centsOff(freq, s.midi, a4));
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  });
  return best;
}

/**
 * Detecção de pitch por autocorrelação (algoritmo ACF2+).
 * Retorna a frequência fundamental em Hz, ou -1 quando não há sinal confiável.
 */
export function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  const SIZE = buf.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1; // silêncio / sinal fraco

  // Recorta a região central onde o sinal tem amplitude suficiente.
  let r1 = 0;
  let r2 = SIZE - 1;
  const threshold = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < threshold) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < threshold) {
      r2 = SIZE - i;
      break;
    }
  }

  const trimmed = buf.slice(r1, r2);
  const n = trimmed.length;
  if (n < 2) return -1;

  const c = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i; j++) c[i] += trimmed[j] * trimmed[j + i];
  }

  // Pula o decaimento inicial e acha o pico de autocorrelação.
  let d = 0;
  while (d < n - 1 && c[d] > c[d + 1]) d++;
  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < n; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }
  let T0 = maxpos;
  if (T0 <= 0) return -1;

  // Interpolação parabólica para refinar o período.
  const x1 = c[T0 - 1];
  const x2 = c[T0];
  const x3 = c[T0 + 1] ?? c[T0];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
}
