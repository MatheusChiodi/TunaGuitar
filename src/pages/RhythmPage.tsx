import { useEffect, useMemo, useRef, useState } from "react";
import { Lock, Play, Square, Target } from "lucide-react";
import { audio } from "../lib/audio";
import { load, save } from "../lib/storage";

type Stroke = "D" | "U" | "X" | "-";
type Difficulty = "Iniciante" | "Intermediário" | "Avançado";

interface Pattern {
  id: string;
  name: string;
  genre: string;
  difficulty: Difficulty;
  bpm: [number, number];
  meter: string;
  subdiv: number; // passos por tempo
  steps: Stroke[];
}

const PATTERNS: Pattern[] = [
  { id: "rock", name: "Rock Básico", genre: "Rock", difficulty: "Iniciante", bpm: [80, 140], meter: "4/4", subdiv: 2, steps: ["D", "-", "D", "-", "D", "-", "D", "-"] },
  { id: "balada", name: "Balada", genre: "Pop", difficulty: "Iniciante", bpm: [60, 90], meter: "4/4", subdiv: 2, steps: ["D", "-", "D", "U", "-", "U", "D", "U"] },
  { id: "pop", name: "Pop", genre: "Pop", difficulty: "Intermediário", bpm: [90, 130], meter: "4/4", subdiv: 2, steps: ["D", "D", "U", "-", "U", "D", "U", "-"] },
  { id: "forro", name: "Forró / Baião", genre: "Forró", difficulty: "Intermediário", bpm: [100, 140], meter: "4/4", subdiv: 2, steps: ["D", "X", "U", "D", "D", "X", "U", "D"] },
  { id: "samba", name: "Samba", genre: "Samba", difficulty: "Avançado", bpm: [90, 110], meter: "4/4", subdiv: 2, steps: ["D", "U", "X", "U", "D", "U", "X", "U"] },
  { id: "bossa", name: "Bossa Nova", genre: "Bossa", difficulty: "Avançado", bpm: [70, 100], meter: "4/4", subdiv: 2, steps: ["D", "-", "U", "X", "-", "U", "D", "-"] },
];

const STROKE_STYLE: Record<Stroke, { glyph: string; color: string }> = {
  D: { glyph: "↓", color: "text-secondary" },
  U: { glyph: "↑", color: "text-[#5aa9ff]" },
  X: { glyph: "✕", color: "text-on-surface-variant" },
  "-": { glyph: "·", color: "text-[#333]" },
};

const SPEEDS = [0.5, 0.75, 1];

export default function RhythmPage() {
  const [selected, setSelected] = useState(PATTERNS[0]);
  const [bpm, setBpm] = useState<number>(() => load("tg.bpm", 100));
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);
  const [training, setTraining] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>(() => load("tg.rhythmScores", {}));
  const [hits, setHits] = useState<{ g: number; y: number; r: number }>({ g: 0, y: 0, r: 0 });

  const timer = useRef<number | undefined>(undefined);
  const loopStart = useRef(0);
  const stepRef = useRef(0);

  const eff = bpm * speed;
  const stepMs = (60 / eff / selected.subdiv) * 1000;
  const loopDur = (selected.steps.length * stepMs) / 1000;

  const unlocked = useMemo(() => {
    const best = (d: Difficulty) => PATTERNS.filter((p) => p.difficulty === d).some((p) => (scores[p.id] ?? 0) >= 80);
    return { Iniciante: true, Intermediário: best("Iniciante"), Avançado: best("Intermediário") } as Record<Difficulty, boolean>;
  }, [scores]);

  const strumStep = (s: Stroke) => {
    if (s === "D") audio.strum(audio.currentTime, "down");
    else if (s === "U") audio.strum(audio.currentTime, "up");
    else if (s === "X") audio.strum(audio.currentTime, "chuck");
  };

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = undefined;
    setPlaying(false);
    setStepIdx(-1);
  };

  const play = () => {
    stop();
    setHits({ g: 0, y: 0, r: 0 });
    stepRef.current = 0;
    setStepIdx(0);
    loopStart.current = audio.currentTime;
    strumStep(selected.steps[0]);
    timer.current = window.setInterval(() => {
      stepRef.current = (stepRef.current + 1) % selected.steps.length;
      if (stepRef.current === 0) loopStart.current = audio.currentTime;
      setStepIdx(stepRef.current);
      strumStep(selected.steps[stepRef.current]);
    }, stepMs);
    setPlaying(true);
  };

  useEffect(() => () => stop(), []);
  useEffect(() => save("tg.bpm", bpm), [bpm]);

  // Treino de ritmo: avalia timing das batidas do usuário.
  const tap = () => {
    if (!training || !playing) return;
    const rel = (audio.currentTime - loopStart.current + loopDur) % loopDur;
    let bestDiff = Infinity;
    selected.steps.forEach((s, i) => {
      if (s === "-") return;
      const onset = (i * stepMs) / 1000;
      const diff = Math.min(Math.abs(rel - onset), Math.abs(rel - onset - loopDur), Math.abs(rel - onset + loopDur));
      if (diff < bestDiff) bestDiff = diff;
    });
    const ms = bestDiff * 1000;
    setHits((h) => {
      const next = ms <= 30 ? { ...h, g: h.g + 1 } : ms <= 80 ? { ...h, y: h.y + 1 } : { ...h, r: h.r + 1 };
      const total = next.g + next.y + next.r;
      const acc = Math.round(((next.g + next.y * 0.5) / total) * 100);
      const updated = { ...scores, [selected.id]: Math.max(scores[selected.id] ?? 0, acc) };
      setScores(updated);
      save("tg.rhythmScores", updated);
      return next;
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && training) {
        e.preventDefault();
        tap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const total = hits.g + hits.y + hits.r;
  const accuracy = total ? Math.round(((hits.g + hits.y * 0.5) / total) * 100) : 0;

  return (
    <div className="w-full max-w-3xl px-4 py-6 md:py-10">
      <h1 className="mb-1 font-headline text-3xl font-bold text-primary md:text-4xl">Ritmos & Strumming</h1>
      <p className="mb-6 font-share-tech text-sm text-secondary">Padrões de batida com som e treino</p>

      {/* Catálogo */}
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {PATTERNS.map((p) => {
          const locked = !unlocked[p.difficulty];
          return (
            <button
              key={p.id}
              disabled={locked}
              onClick={() => { setSelected(p); stop(); }}
              className={`relative cursor-pointer rounded-xl border p-3 text-left transition-colors ${
                selected.id === p.id ? "border-accent bg-accent/10" : "border-[#2a2a2a] bg-surface-lowest hover:border-[#444]"
              } ${locked ? "opacity-40" : ""}`}
            >
              <div className="font-headline text-sm text-on-surface">{p.name}</div>
              <div className="font-share-tech text-[10px] text-tertiary">{p.genre} · {p.difficulty}</div>
              {scores[p.id] != null && <div className="font-share-tech text-[10px] text-secondary">melhor {scores[p.id]}%</div>}
              {locked && <Lock className="absolute right-2 top-2 h-3.5 w-3.5 text-on-surface-variant" />}
            </button>
          );
        })}
      </div>

      {/* Notação */}
      <div className="mb-4 rounded-xl border border-[#2a2a2a] bg-surface-lowest p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-headline text-on-surface">{selected.name}</span>
          <span className="font-share-tech text-xs text-tertiary">{selected.meter} · {selected.bpm[0]}–{selected.bpm[1]} BPM</span>
        </div>
        <div className="flex gap-1">
          {selected.steps.map((s, i) => {
            const st = STROKE_STYLE[s];
            const beatStart = i % selected.subdiv === 0;
            return (
              <div key={i} className={`flex flex-1 flex-col items-center rounded-lg border py-3 ${beatStart ? "border-l-2 border-l-[#333]" : "border-transparent"} ${stepIdx === i ? "bg-accent/20" : ""}`}>
                <span className={`text-2xl ${st.color}`}>{st.glyph}</span>
                <span className="mt-1 font-share-tech text-[9px] text-tertiary">{beatStart ? i / selected.subdiv + 1 : "&"}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 font-share-tech text-[10px] text-tertiary">
          <span className="text-secondary">↓</span> down · <span className="text-[#5aa9ff]">↑</span> up · <span className="text-on-surface-variant">✕</span> abafado
        </p>
      </div>

      {/* Controles */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button onClick={playing ? stop : play} className={`flex h-12 cursor-pointer items-center gap-2 rounded-full border-2 px-5 font-label text-xs uppercase tracking-widest ${playing ? "border-accent bg-accent/20 text-accent" : "border-[#333] text-on-surface"}`}>
          {playing ? <Square className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />} {playing ? "Parar" : "Tocar"}
        </button>
        <div className="flex rounded-full border border-[#333] p-1">
          {SPEEDS.map((s) => (
            <button key={s} onClick={() => setSpeed(s)} className={`cursor-pointer rounded-full px-3 py-1.5 font-share-tech text-xs ${speed === s ? "bg-accent/15 text-accent" : "text-on-surface-variant"}`}>
              {s * 100}%
            </button>
          ))}
        </div>
        <button onClick={() => setTraining((t) => !t)} className={`flex h-12 cursor-pointer items-center gap-2 rounded-full border px-4 font-label text-[10px] uppercase tracking-widest ${training ? "border-accent text-accent" : "border-[#333] text-on-surface-variant"}`}>
          <Target className="h-4 w-4" /> Treino
        </button>
      </div>

      <div className="mb-2 flex items-center gap-3">
        <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant">BPM {bpm}</span>
        <input type="range" min={selected.bpm[0]} max={selected.bpm[1]} value={Math.min(Math.max(bpm, selected.bpm[0]), selected.bpm[1])} onChange={(e) => setBpm(Number(e.target.value))} className="flex-1" />
      </div>

      {/* Treino */}
      {training && (
        <div className="mt-4 rounded-xl border border-accent/30 bg-accent/5 p-4 text-center">
          <p className="mb-3 font-share-tech text-sm text-on-surface-variant">Toque no tempo (Espaço ou o botão) enquanto o padrão roda.</p>
          <button onMouseDown={tap} className="mx-auto mb-4 flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-4 border-accent bg-accent/15 font-label text-xs uppercase tracking-widest text-accent">
            Tap
          </button>
          <div className="flex justify-center gap-4 font-share-tech text-sm">
            <span className="text-tuned">● {hits.g}</span>
            <span className="text-secondary">● {hits.y}</span>
            <span className="text-error">● {hits.r}</span>
          </div>
          {total > 0 && <p className="mt-2 font-orbitron text-2xl text-accent">{accuracy}% {accuracy >= 80 ? "— Muito bom!" : ""}</p>}
        </div>
      )}
    </div>
  );
}
