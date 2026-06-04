import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Radar } from "react-chartjs-2";
import "../lib/chartTheme";
import { Check, Flame, Play, Share2, X } from "lucide-react";
import { audio } from "../lib/audio";
import { CHORD_QUALITIES, INTERVALS, NOTE_NAMES, pcName } from "../lib/theory";
import { load, save } from "../lib/storage";
import { useGamify } from "../context/GamifyContext";
import SplitHeading from "../components/SplitHeading";

type Mode = "note" | "interval" | "chord";

const MODES: { id: Mode; label: string }[] = [
  { id: "note", label: "Nota" },
  { id: "interval", label: "Intervalo" },
  { id: "chord", label: "Acorde" },
];

const INTERVAL_SET = INTERVALS.filter((i) => i.semitones >= 1);
const CHORD_SET = CHORD_QUALITIES.filter((q) => ["major", "minor", "dim", "aug", "dom7"].includes(q.id));

const CHORD_WHY: Record<string, string> = {
  major: "Maior (1-3-5): som alegre e resoluto.",
  minor: "Menor (1-♭3-5): som melancólico.",
  dim: "Diminuto (1-♭3-♭5): tenso, instável.",
  aug: "Aumentado (1-3-♯5): misterioso, suspenso.",
  dom7: "7ª dominante (1-3-5-♭7): pede resolução (bluesy).",
};

const LEVELS = [
  { name: "Iniciante", min: 0 },
  { name: "Músico", min: 200 },
  { name: "Ouvido Absoluto", min: 800 },
];

interface Question {
  mode: Mode;
  midis: number[];
  answer: string; // chave da resposta correta
}

interface Stored {
  xp: number;
  history: { mode: Mode; correct: boolean }[];
}

const rand = (n: number) => Math.floor(Math.random() * n);

function makeQuestion(mode: Mode): Question {
  if (mode === "note") {
    const pc = rand(12);
    return { mode, midis: [60 + pc], answer: String(pc) };
  }
  if (mode === "interval") {
    const root = 55 + rand(8);
    const iv = INTERVAL_SET[rand(INTERVAL_SET.length)];
    return { mode, midis: [root, root + iv.semitones], answer: String(iv.semitones) };
  }
  const root = 52 + rand(10);
  const q = CHORD_SET[rand(CHORD_SET.length)];
  return { mode, midis: q.intervals.map((i) => root + i), answer: q.id };
}

function playQuestion(q: Question) {
  if (q.mode === "note") audio.playMidi(q.midis[0], 1.4);
  else if (q.mode === "interval") audio.playSequence(q.midis, { gap: 0.6, duration: 0.55 });
  else audio.playNotes(q.midis, { arpeggio: false, duration: 1.6 });
}

function levelInfo(xp: number) {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].min) idx = i;
  const current = LEVELS[idx];
  const next = LEVELS[idx + 1];
  const frac = next ? (xp - current.min) / (next.min - current.min) : 1;
  return { name: current.name, frac: Math.min(1, frac), next };
}

export default function EarTrainingPage() {
  const [mode, setMode] = useState<Mode>("note");
  const [q, setQ] = useState<Question>(() => makeQuestion("note"));
  const [selected, setSelected] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [store, setStore] = useState<Stored>(() => load("tg.ear", { xp: 0, history: [] }));
  const [copied, setCopied] = useState(false);
  const { track, state: gamify } = useGamify();

  useEffect(() => {
    save("tg.ear", store);
  }, [store]);

  // Radar de habilidades — derivado do histórico + contadores de gamificação (sem novo schema).
  const radar = useMemo(() => {
    const acc = (m: Mode) => {
      const hs = store.history.filter((h) => h.mode === m);
      return hs.length ? Math.round((hs.filter((h) => h.correct).length / hs.length) * 100) : 0;
    };
    const c = gamify.counters;
    return [
      acc("note"),
      acc("interval"),
      acc("chord"),
      Math.min(100, (c.tune ?? 0) * 12),
      Math.min(100, (c.fastBpm ?? 0) * 25),
      (c.theoryComplete ?? 0) > 0 ? 100 : 0,
    ];
  }, [store.history, gamify.counters]);

  const revealed = selected !== null;
  const correct = revealed && selected === q.answer;
  const lvl = levelInfo(store.xp);

  const next = (newMode = mode) => {
    setSelected(null);
    setQ(makeQuestion(newMode));
  };

  const choose = (value: string) => {
    if (revealed) return;
    setSelected(value);
    const ok = value === q.answer;
    if (ok) {
      const ns = streak + 1;
      const gained = 10 + streak * 2;
      setStreak(ns);
      setBest((b) => Math.max(b, ns));
      track("earCorrect");
      if (ns >= 10) track("earStreak10");
      setStore((st) => ({ xp: st.xp + gained, history: [{ mode: q.mode, correct: true }, ...st.history].slice(0, 10) }));
    } else {
      setStreak(0);
      setStore((st) => ({ ...st, history: [{ mode: q.mode, correct: false }, ...st.history].slice(0, 10) }));
    }
  };

  const switchMode = (mNew: Mode) => {
    setMode(mNew);
    setStreak(0);
    next(mNew);
  };

  const share = async () => {
    const text = `🎸 Ear Training no TunaGuitar!\n🏅 Nível: ${lvl.name} (${store.xp} XP)\n🔥 Recorde de sequência: ${best}\nTreine seu ouvido também!`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponível */
    }
  };

  const accuracy = store.history.length
    ? Math.round((store.history.filter((h) => h.correct).length / store.history.length) * 100)
    : 0;

  const options =
    q.mode === "note"
      ? NOTE_NAMES.map((n, i) => ({ value: String(i), label: n }))
      : q.mode === "interval"
        ? INTERVAL_SET.map((iv) => ({ value: String(iv.semitones), label: iv.name }))
        : CHORD_SET.map((c) => ({ value: c.id, label: c.name }));

  const answerLabel = () => {
    if (q.mode === "note") return pcName(Number(q.answer));
    if (q.mode === "interval") return INTERVAL_SET.find((i) => String(i.semitones) === q.answer)?.name ?? "";
    return CHORD_SET.find((c) => c.id === q.answer)?.name ?? "";
  };

  return (
    <div className="w-full max-w-2xl px-4 py-6 md:py-10">
      <SplitHeading text="Treino de Ouvido" className="mb-1 font-headline text-3xl font-bold text-primary md:text-4xl" />
      <p className="mb-6 font-share-tech text-sm text-secondary">Reconheça notas, intervalos e acordes</p>

      {/* Progresso */}
      <div className="mb-6 rounded-xl border border-[#2a2a2a] bg-surface-lowest p-4">
        <div className="mb-2 flex items-center justify-between font-share-tech text-sm">
          <span className="text-accent">{lvl.name}</span>
          <span className="text-on-surface-variant">{store.xp} XP</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#1a1a1a]">
          <motion.div className="h-full rounded-full bg-accent" animate={{ width: `${lvl.frac * 100}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between font-share-tech text-xs text-tertiary">
          <span className="flex items-center gap-1 text-secondary">
            <Flame className="h-4 w-4" /> Sequência: {streak} (recorde {best})
          </span>
          <button onClick={share} className="flex cursor-pointer items-center gap-1 text-on-surface-variant hover:text-primary">
            <Share2 className="h-4 w-4" /> {copied ? "Copiado!" : "Compartilhar"}
          </button>
        </div>
      </div>

      {/* Modos */}
      <div className="mb-6 flex gap-2">
        {MODES.map((mDef) => (
          <button
            key={mDef.id}
            onClick={() => switchMode(mDef.id)}
            className={`flex-1 cursor-pointer rounded-lg border py-2 font-label text-xs uppercase tracking-widest transition-colors ${
              mode === mDef.id ? "border-accent bg-accent/10 text-accent" : "border-[#2a2a2a] text-on-surface-variant hover:border-[#444]"
            }`}
          >
            {mDef.label}
          </button>
        ))}
      </div>

      {/* Tocar */}
      <div className="mb-6 flex flex-col items-center gap-4 rounded-xl border border-[#2a2a2a] bg-surface-lowest py-8">
        <motion.button
          onClick={() => playQuestion(q)}
          whileTap={{ scale: 0.92 }}
          className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-4 border-accent bg-accent/15 text-accent"
        >
          <Play className="ml-1 h-8 w-8 fill-current" />
        </motion.button>
        <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant">Tocar de novo</span>
        {revealed && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <p className={`flex items-center justify-center gap-2 font-share-tech text-lg ${correct ? "text-tuned" : "text-error"}`}>
              {correct ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
              {correct ? "Correto!" : `Era ${answerLabel()}`}
            </p>
            {q.mode === "interval" && (
              <p className="mt-1 font-share-tech text-xs text-tertiary">
                {INTERVAL_SET.find((i) => String(i.semitones) === q.answer)?.example}
              </p>
            )}
            {q.mode === "chord" && <p className="mt-1 font-share-tech text-xs text-tertiary">{CHORD_WHY[q.answer]}</p>}
          </motion.div>
        )}
      </div>

      {/* Opções */}
      <div className={`grid gap-2 ${q.mode === "note" ? "grid-cols-4 sm:grid-cols-6" : "grid-cols-2 sm:grid-cols-3"}`}>
        {options.map((o) => {
          const isAnswer = o.value === q.answer;
          const isPicked = o.value === selected;
          const cls = !revealed
            ? "border-[#2a2a2a] bg-[#0a0a0a] text-on-surface hover:border-accent"
            : isAnswer
              ? "border-tuned bg-tuned/15 text-tuned"
              : isPicked
                ? "border-error bg-error/15 text-error"
                : "border-[#2a2a2a] bg-[#0a0a0a] text-on-surface-variant opacity-50";
          return (
            <button key={o.value} onClick={() => choose(o.value)} disabled={revealed} className={`cursor-pointer rounded-lg border py-3 font-share-tech text-sm transition-colors ${cls}`}>
              {o.label}
            </button>
          );
        })}
      </div>

      {revealed && (
        <button onClick={() => next()} className="mt-6 w-full cursor-pointer rounded-lg bg-accent py-3 font-label text-sm uppercase tracking-widest text-[#1a0000]">
          Próxima
        </button>
      )}

      {/* Histórico */}
      {store.history.length > 0 && (
        <div className="mt-8 rounded-xl border border-[#2a2a2a] bg-surface-lowest p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant">Últimos {store.history.length}</span>
            <span className="font-share-tech text-sm text-secondary">{accuracy}% de acerto</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {store.history.map((h, i) => (
              <span key={i} className={`h-3 w-3 rounded-sm ${h.correct ? "bg-tuned" : "bg-error"}`} title={h.mode} />
            ))}
          </div>
        </div>
      )}

      {/* Mapa de habilidades (Chart.js) */}
      <div data-reveal className="mt-8 rounded-xl border border-[#2a2a2a] bg-surface-lowest p-4">
        <span className="mb-3 block font-label text-[11px] uppercase tracking-widest text-on-surface-variant">Mapa de habilidades</span>
        <div className="mx-auto h-64 max-w-sm">
          <Radar
            data={{
              labels: ["Notas", "Intervalos", "Acordes", "Afinação", "Ritmo", "Teoria"],
              datasets: [
                {
                  data: radar,
                  backgroundColor: "rgba(255,85,85,0.1)",
                  borderColor: "#FF5555",
                  borderWidth: 2,
                  pointBackgroundColor: "#FF5555",
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  pointBorderColor: "transparent",
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                r: {
                  min: 0,
                  max: 100,
                  ticks: { display: false, stepSize: 25 },
                  grid: { color: "rgba(255,255,255,0.06)" },
                  angleLines: { color: "rgba(255,255,255,0.04)" },
                  pointLabels: { font: { family: "'Syne', sans-serif", size: 12, weight: 600 }, color: "#9490A0" },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
