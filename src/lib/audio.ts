import { midiToFreq } from "./theory";

export type ClickType = "wood" | "electronic" | "metallic";

interface ToneOpts {
  type?: OscillatorType;
  gain?: number;
  attack?: number;
}

/**
 * Motor de áudio único (Web Audio API). Zero dependências/arquivos externos.
 * Tudo é sintetizado com osciladores + envelopes de ganho.
 */
class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;

  ensure(): AudioContext {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  get currentTime(): number {
    return this.ensure().currentTime;
  }

  /** Toca um tom com envelope ADSR simplificado. */
  tone(freq: number, when: number, duration: number, opts: ToneOpts = {}): void {
    const ctx = this.ensure();
    const { type = "sine", gain = 0.3, attack = 0.005 } = opts;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    osc.connect(g);
    g.connect(this.master as GainNode);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(gain, when + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    osc.start(when);
    osc.stop(when + duration + 0.05);
  }

  /** Toca uma nota MIDI imediatamente. */
  playMidi(midi: number, duration = 1, type: OscillatorType = "triangle"): void {
    this.tone(midiToFreq(midi), this.currentTime + 0.02, duration, { type, gain: 0.28 });
  }

  /** Bloco ou arpejo de notas MIDI. */
  playNotes(midis: number[], opts: { arpeggio?: boolean; gap?: number; duration?: number; type?: OscillatorType } = {}): void {
    const { arpeggio = true, gap = 0.34, duration = 1.5, type = "triangle" } = opts;
    const start = this.currentTime + 0.06;
    midis.forEach((m, i) => this.tone(midiToFreq(m), start + (arpeggio ? i * gap : 0), duration, { type, gain: 0.24 }));
  }

  /** Sequência melódica (escalas). */
  playSequence(midis: number[], opts: { gap?: number; duration?: number; type?: OscillatorType } = {}): void {
    const { gap = 0.26, duration = 0.4, type = "triangle" } = opts;
    const start = this.currentTime + 0.06;
    midis.forEach((m, i) => this.tone(midiToFreq(m), start + i * gap, duration, { type, gain: 0.24 }));
  }

  /** Click do metrônomo agendado no tempo `when` do AudioContext. */
  click(when: number, opts: { type?: ClickType; accent?: boolean; volume?: number } = {}): void {
    const { type = "electronic", accent = false, volume = 1 } = opts;
    const v = volume * (accent ? 0.5 : 0.32);
    if (type === "electronic") {
      this.tone(accent ? 1500 : 1000, when, 0.05, { type: "square", gain: v, attack: 0.001 });
    } else if (type === "wood") {
      this.tone(accent ? 1100 : 760, when, 0.045, { type: "triangle", gain: v * 1.15, attack: 0.001 });
      this.tone(accent ? 2200 : 1500, when, 0.02, { type: "sine", gain: v * 0.5, attack: 0.001 });
    } else {
      const freqs = accent ? [3200, 4800, 5300] : [2400, 3600, 4100];
      freqs.forEach((f) => this.tone(f, when, 0.09, { type: "square", gain: v * 0.16, attack: 0.001 }));
    }
  }
}

export const audio = new AudioEngine();
