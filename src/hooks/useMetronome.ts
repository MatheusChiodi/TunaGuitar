import { useCallback, useEffect, useRef, useState } from "react";
import { audio, type ClickType } from "../lib/audio";

export const TIME_SIGNATURES = [
  { id: "2/4", beats: 2 },
  { id: "3/4", beats: 3 },
  { id: "4/4", beats: 4 },
  { id: "5/4", beats: 5 },
  { id: "6/8", beats: 6 },
  { id: "7/8", beats: 7 },
];

export const SUBDIVISIONS = [
  { id: 1, name: "Semínima" },
  { id: 2, name: "Colcheia" },
  { id: 3, name: "Tercina" },
  { id: 4, name: "Semicolcheia" },
];

export interface Training {
  enabled: boolean;
  inc: number;
  every: number;
}

export function tempoName(bpm: number): string {
  if (bpm <= 60) return "Largo";
  if (bpm <= 80) return "Andante";
  if (bpm <= 100) return "Moderato";
  if (bpm <= 120) return "Allegretto";
  if (bpm <= 160) return "Allegro";
  return "Presto";
}

const LOOKAHEAD = 25; // ms
const SCHEDULE_AHEAD = 0.12; // s

export function useMetronome() {
  const [bpm, setBpm] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSig, setTimeSig] = useState("4/4");
  const [subdivision, setSubdivision] = useState(1);
  const [clickType, setClickType] = useState<ClickType>("wood");
  const [volume, setVolume] = useState(0.8);
  const [accentFirst, setAccentFirst] = useState(true);
  const [training, setTraining] = useState<Training>({ enabled: false, inc: 2, every: 4 });

  const [visBeat, setVisBeat] = useState(0);
  const [visSub, setVisSub] = useState(0);
  const [side, setSide] = useState(false);

  const beats = TIME_SIGNATURES.find((t) => t.id === timeSig)?.beats ?? 4;

  // refs sempre atualizadas para o scheduler (evita closures obsoletas)
  const cfg = useRef({ bpm, beats, subdivision, clickType, volume, accentFirst, training });
  cfg.current = { bpm, beats, subdivision, clickType, volume, accentFirst, training };

  const nextTime = useRef(0);
  const beatRef = useRef(0);
  const subRef = useRef(0);
  const measureRef = useRef(0);
  const queue = useRef<{ time: number; beat: number; sub: number }[]>([]);
  const timer = useRef<number | undefined>(undefined);
  const raf = useRef<number | undefined>(undefined);

  const stop = useCallback(() => {
    if (timer.current !== undefined) clearInterval(timer.current);
    if (raf.current !== undefined) cancelAnimationFrame(raf.current);
    timer.current = undefined;
    raf.current = undefined;
    queue.current = [];
    setIsPlaying(false);
    setVisBeat(0);
    setVisSub(0);
  }, []);

  const start = useCallback(() => {
    const ctx = audio.ensure();
    nextTime.current = ctx.currentTime + 0.1;
    beatRef.current = 0;
    subRef.current = 0;
    measureRef.current = 0;
    queue.current = [];

    const scheduler = () => {
      const now = audio.currentTime;
      const c = cfg.current;
      while (nextTime.current < now + SCHEDULE_AHEAD) {
        const accent = c.accentFirst && beatRef.current === 0 && subRef.current === 0;
        const soft = subRef.current !== 0;
        audio.click(nextTime.current, { type: c.clickType, accent, volume: c.volume * (soft ? 0.55 : 1) });
        queue.current.push({ time: nextTime.current, beat: beatRef.current, sub: subRef.current });

        const secondsPerBeat = 60 / c.bpm;
        nextTime.current += secondsPerBeat / c.subdivision;
        subRef.current++;
        if (subRef.current >= c.subdivision) {
          subRef.current = 0;
          beatRef.current++;
          if (beatRef.current >= c.beats) {
            beatRef.current = 0;
            measureRef.current++;
            if (c.training.enabled && measureRef.current % c.training.every === 0) {
              setBpm((b) => Math.min(300, b + c.training.inc));
            }
          }
        }
      }
    };

    const draw = () => {
      const t = audio.currentTime;
      while (queue.current.length && queue.current[0].time <= t) {
        const ev = queue.current.shift();
        if (!ev) break;
        setVisBeat(ev.beat);
        setVisSub(ev.sub);
        if (ev.sub === 0) setSide((s) => !s);
      }
      raf.current = requestAnimationFrame(draw);
    };

    timer.current = window.setInterval(scheduler, LOOKAHEAD);
    raf.current = requestAnimationFrame(draw);
    setIsPlaying(true);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) stop();
    else start();
  }, [isPlaying, start, stop]);

  useEffect(() => () => stop(), [stop]);

  // Tap tempo: janela deslizante de 8 com rejeição de outliers (>20% da mediana). QOL-07.
  const taps = useRef<number[]>([]);
  const tap = useCallback(() => {
    const now = performance.now();
    const arr = taps.current;
    if (arr.length && now - arr[arr.length - 1] > 2200) arr.length = 0;
    arr.push(now);
    if (arr.length > 8) arr.shift();
    if (arr.length < 2) return;
    const intervals = arr.slice(1).map((t, i) => t - arr[i]);
    const sorted = [...intervals].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const clean = intervals.filter((iv) => Math.abs(iv - median) / median <= 0.2);
    if (!clean.length) return;
    const avg = clean.reduce((a, b) => a + b, 0) / clean.length;
    setBpm(Math.max(20, Math.min(300, Math.round(60000 / avg))));
  }, []);

  return {
    bpm,
    setBpm,
    isPlaying,
    toggle,
    timeSig,
    setTimeSig,
    beats,
    subdivision,
    setSubdivision,
    clickType,
    setClickType,
    volume,
    setVolume,
    accentFirst,
    setAccentFirst,
    training,
    setTraining,
    tap,
    visBeat,
    visSub,
    side,
  };
}
