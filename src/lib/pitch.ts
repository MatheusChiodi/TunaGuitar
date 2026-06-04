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

/** RMS (energia) do buffer — usado como gate de volume contra silêncio/ruído. */
export function rms(buf: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
  return Math.sqrt(sum / buf.length);
}

/** Mediana — robusta a outliers, ao contrário da média. */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export interface PitchResult {
  frequency: number;
  /** Confiança da detecção (0..1). Quanto mais perto de 1, mais limpa a nota. */
  clarity: number;
}

export interface DetectOptions {
  minFrequency?: number;
  maxFrequency?: number;
  /** Limiar absoluto do YIN (0.10–0.15 conforme o paper). */
  threshold?: number;
}

// Acima deste salto, a integração da diferença trunca para conter o custo.
const MAX_WINDOW = 4096;

/**
 * Detecção de pitch via YIN — diferença média cumulativa normalizada (CMND)
 * com janela Hann e interpolação parabólica.
 *
 * Por que YIN e não autocorrelação pura: a CMND penaliza lags curtos, então o
 * PRIMEIRO vale abaixo do limiar é o período FUNDAMENTAL. Isso elimina o erro
 * de oitava (detectar 220/440 Hz no lugar de 110 Hz) que faz a agulha pular.
 * A interpolação parabólica refina o período para precisão sub-amostra (~±1 cent).
 */
export function detectPitch(buf: Float32Array, sampleRate: number, opts: DetectOptions = {}): PitchResult | null {
  const SIZE = buf.length;
  const minFrequency = opts.minFrequency ?? 60;
  const maxFrequency = opts.maxFrequency ?? 1200;
  const THRESHOLD = opts.threshold ?? 0.15;

  const minLag = Math.max(2, Math.floor(sampleRate / maxFrequency));
  const maxLag = Math.min(SIZE - 1, Math.floor(sampleRate / minFrequency));
  if (maxLag <= minLag) return null;

  // Janela Hann: reduz vazamento espectral antes da função de diferença.
  const w = new Float32Array(SIZE);
  for (let i = 0; i < SIZE; i++) {
    w[i] = buf[i] * 0.5 * (1 - Math.cos((2 * Math.PI * i) / (SIZE - 1)));
  }

  // Janela de integração constante para todos os lags (normalização YIN correta).
  const window = Math.min(SIZE - maxLag, MAX_WINDOW);

  // Diferença quadrática d(lag) + CMND in-place. cmnd[lag] < THRESHOLD ⇒ período.
  const cmnd = new Float32Array(maxLag + 1);
  cmnd[0] = 1;
  let runningSum = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < window; i++) {
      const delta = w[i] - w[i + lag];
      sum += delta * delta;
    }
    runningSum += sum;
    cmnd[lag] = runningSum === 0 ? 1 : (sum * (lag - minLag + 1)) / runningSum;
  }

  // Primeiro vale abaixo do limiar absoluto = fundamental (não harmônico).
  let tau = -1;
  for (let lag = minLag; lag <= maxLag; lag++) {
    if (cmnd[lag] < THRESHOLD) {
      // Desce até o fundo deste vale local.
      while (lag + 1 <= maxLag && cmnd[lag + 1] < cmnd[lag]) lag++;
      tau = lag;
      break;
    }
  }

  // Fallback: nenhum vale passou o limiar → mínimo global, se for confiável.
  if (tau === -1) {
    let min = Infinity;
    for (let lag = minLag; lag <= maxLag; lag++) {
      if (cmnd[lag] < min) {
        min = cmnd[lag];
        tau = lag;
      }
    }
    if (min > 0.2) return null; // confiança baixa demais — rejeita
  }

  // Interpolação parabólica em torno do vale → precisão sub-amostra.
  let betterTau = tau;
  if (tau > minLag && tau < maxLag) {
    const s0 = cmnd[tau - 1];
    const s1 = cmnd[tau];
    const s2 = cmnd[tau + 1];
    const denom = 2 * (2 * s1 - s2 - s0);
    if (denom !== 0) betterTau = tau + (s2 - s0) / denom;
  }

  const frequency = sampleRate / betterTau;
  if (frequency < minFrequency || frequency > maxFrequency) return null;

  return { frequency, clarity: 1 - cmnd[tau] };
}
