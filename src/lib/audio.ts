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
  private noise: AudioBuffer | null = null;
  private masterVolume = 0.9;
  private lifecycleInstalled = false;

  ensure(): AudioContext {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.masterVolume;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  get currentTime(): number {
    return this.ensure().currentTime;
  }

  get destination(): GainNode {
    this.ensure();
    return this.master as GainNode;
  }

  setMasterVolume(v: number): void {
    this.masterVolume = v;
    if (this.master) this.master.gain.value = v;
  }

  /** Suspende/retoma apenas se o contexto já existir (não cria antes de gesto do usuário). */
  suspend(): void {
    if (this.ctx && this.ctx.state === "running") void this.ctx.suspend();
  }
  resume(): void {
    if (this.ctx && this.ctx.state === "suspended") void this.ctx.resume();
  }

  /** Suspende em aba oculta (economia de bateria) e retoma em gesto/foco (iOS). BP-06. */
  installLifecycle(): void {
    if (this.lifecycleInstalled || typeof document === "undefined") return;
    this.lifecycleInstalled = true;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.suspend();
      else this.resume();
    });
    const resume = () => this.resume();
    (["pointerdown", "keydown", "touchstart"] as const).forEach((ev) =>
      document.addEventListener(ev, resume, { passive: true }),
    );
  }

  private getNoise(): AudioBuffer {
    const ctx = this.ensure();
    if (!this.noise) {
      this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    return this.noise;
  }

  /** Acorde sintetizado com envelope ADSR suave (A10 D100 S0.7 R300). */
  synthChord(midis: number[], when?: number, duration = 1.6): void {
    const ctx = this.ensure();
    const t = when ?? ctx.currentTime + 0.03;
    const peak = 0.22 / Math.max(1, Math.sqrt(midis.length));
    midis.forEach((m) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = midiToFreq(m);
      osc.connect(g);
      g.connect(this.master as GainNode);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.01); // attack
      g.gain.linearRampToValueAtTime(peak * 0.7, t + 0.11); // decay → sustain
      g.gain.setValueAtTime(peak * 0.7, t + Math.max(0.12, duration - 0.3));
      g.gain.exponentialRampToValueAtTime(0.0001, t + duration); // release
      osc.start(t);
      osc.stop(t + duration + 0.05);
    });
  }

  /** Palhetada percussiva via ruído filtrado. */
  strum(when: number, type: "down" | "up" | "chuck", volume = 1): void {
    const ctx = this.ensure();
    const src = ctx.createBufferSource();
    src.buffer = this.getNoise();
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    const g = ctx.createGain();
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master as GainNode);

    const cfg =
      type === "down"
        ? { freq: 420, q: 0.8, dur: 0.17, gain: 0.5 }
        : type === "up"
          ? { freq: 1300, q: 1.1, dur: 0.12, gain: 0.4 }
          : { freq: 800, q: 1.4, dur: 0.05, gain: 0.45 };
    filter.frequency.value = cfg.freq;
    filter.Q.value = cfg.q;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(cfg.gain * volume, when + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, when + cfg.dur);
    src.start(when);
    src.stop(when + cfg.dur + 0.02);
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
