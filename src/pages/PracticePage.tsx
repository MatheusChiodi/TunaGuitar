import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Pause, Play, RotateCcw, Share2, Star, Upload } from "lucide-react";
import { load, save } from "../lib/storage";

interface Session {
  date: string;
  minutes: number;
  notes: string;
  tags: string[];
  bpmStart?: number;
  bpmEnd?: number;
  rating: number;
}

const TAGS = ["Acordes", "Escalas", "Repertório", "Técnica", "Improvisação"];
const EAR_LEVELS = [
  { name: "Iniciante", min: 0 },
  { name: "Músico", min: 200 },
  { name: "Ouvido Absoluto", min: 800 },
];

const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function earLevelName(): string {
  const xp = load<{ xp: number }>("tg.ear", { xp: 0 }).xp;
  let name = EAR_LEVELS[0].name;
  for (const l of EAR_LEVELS) if (xp >= l.min) name = l.name;
  return name;
}

export default function PracticePage() {
  const [sessions, setSessions] = useState<Session[]>(() => load<{ sessions: Session[] }>("tg.practice", { sessions: [] }).sessions);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [bpmStart, setBpmStart] = useState("");
  const [bpmEnd, setBpmEnd] = useState("");
  const [rating, setRating] = useState(0);
  const [copied, setCopied] = useState(false);

  const tick = useRef<number | undefined>(undefined);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (running) tick.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(tick.current);
  }, [running]);

  useEffect(() => save("tg.practice", { sessions }), [sessions]);

  const persist = (next: Session[]) => setSessions(next);

  const saveSession = () => {
    const minutes = Math.max(1, Math.round(seconds / 60));
    const s: Session = {
      date: dateKey(new Date()),
      minutes,
      notes: notes.trim(),
      tags,
      bpmStart: bpmStart ? Number(bpmStart) : undefined,
      bpmEnd: bpmEnd ? Number(bpmEnd) : undefined,
      rating,
    };
    persist([s, ...sessions]);
    setSeconds(0);
    setRunning(false);
    setNotes("");
    setTags([]);
    setBpmStart("");
    setBpmEnd("");
    setRating(0);
  };

  const minutesByDay = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach((s) => (map[s.date] = (map[s.date] || 0) + s.minutes));
    return map;
  }, [sessions]);

  const { streak, record, totalMinutes } = useMemo(() => {
    const dates = new Set(Object.keys(minutesByDay));
    const cur = new Date();
    if (!dates.has(dateKey(cur))) cur.setDate(cur.getDate() - 1);
    let st = 0;
    while (dates.has(dateKey(cur))) {
      st++;
      cur.setDate(cur.getDate() - 1);
    }
    const sorted = [...dates].sort();
    let rec = 0;
    let run = 0;
    let prev = 0;
    for (const k of sorted) {
      const t = new Date(k).getTime();
      run = prev && t - prev === 86400000 ? run + 1 : 1;
      rec = Math.max(rec, run);
      prev = t;
    }
    const total = Object.values(minutesByDay).reduce((a, b) => a + b, 0);
    return { streak: st, record: rec, totalMinutes: total };
  }, [minutesByDay]);

  const heatmap = useMemo(() => {
    const weeks = 18;
    const total = weeks * 7;
    const start = new Date();
    start.setDate(start.getDate() - (total - 1));
    const cells: { key: string; min: number }[] = [];
    for (let i = 0; i < total; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = dateKey(d);
      cells.push({ key, min: minutesByDay[key] || 0 });
    }
    const cols: { key: string; min: number }[][] = [];
    for (let i = 0; i < cells.length; i += 7) cols.push(cells.slice(i, i + 7));
    return cols;
  }, [minutesByDay]);

  const heatColor = (min: number) => {
    if (!min) return "#1a1a1a";
    if (min < 15) return "rgba(255,85,85,0.3)";
    if (min < 30) return "rgba(255,85,85,0.5)";
    if (min < 60) return "rgba(255,85,85,0.75)";
    return "#ff5555";
  };

  // Gráfico de linha (Canvas puro) — minutos/dia nos últimos 30 dias.
  useEffect(() => {
    const cv = chartRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const W = cv.width;
    const H = cv.height;
    ctx.clearRect(0, 0, W, H);

    const days: number[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(minutesByDay[dateKey(d)] || 0);
    }
    const max = Math.max(30, ...days);
    const pad = 24;
    const plotW = W - pad * 2;
    const plotH = H - pad * 2;
    const x = (i: number) => pad + (i / 29) * plotW;
    const y = (v: number) => pad + plotH - (v / max) * plotH;

    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, H - pad);
    ctx.lineTo(W - pad, H - pad);
    ctx.stroke();

    const grad = ctx.createLinearGradient(0, pad, 0, H - pad);
    grad.addColorStop(0, "rgba(255,85,85,0.35)");
    grad.addColorStop(1, "rgba(255,85,85,0)");
    ctx.beginPath();
    ctx.moveTo(x(0), H - pad);
    days.forEach((v, i) => ctx.lineTo(x(i), y(v)));
    ctx.lineTo(x(29), H - pad);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    days.forEach((v, i) => (i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v))));
    ctx.strokeStyle = "#ff5555";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [minutesByDay]);

  const totalHours = (totalMinutes / 60).toFixed(1);
  const monthName = new Date().toLocaleDateString("pt-BR", { month: "long" });

  const exportPng = () => {
    const cv = document.createElement("canvas");
    cv.width = 600;
    cv.height = 315;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, 600, 315);
    ctx.fillStyle = "#ff5555";
    ctx.fillRect(0, 0, 600, 6);
    ctx.fillStyle = "#e5e2e1";
    ctx.font = "bold 30px Orbitron, sans-serif";
    ctx.fillText("🎸 TunaGuitar", 36, 64);
    ctx.font = "16px 'Share Tech Mono', monospace";
    ctx.fillStyle = "#ffb95a";
    ctx.fillText(`Progresso · ${monthName}`, 36, 96);

    const stats: [string, string][] = [
      ["🔥 Sequência", `${streak} dias`],
      ["🏆 Recorde", `${record} dias`],
      ["⏱ Total", `${totalHours} h`],
      ["👂 Ouvido", earLevelName()],
    ];
    ctx.font = "20px 'Share Tech Mono', monospace";
    stats.forEach(([k, v], i) => {
      const cx = 36 + (i % 2) * 290;
      const cy = 150 + Math.floor(i / 2) * 70;
      ctx.fillStyle = "#aa8986";
      ctx.fillText(k, cx, cy);
      ctx.fillStyle = "#ff5555";
      ctx.font = "bold 28px Orbitron, sans-serif";
      ctx.fillText(v, cx, cy + 32);
      ctx.font = "20px 'Share Tech Mono', monospace";
    });

    const a = document.createElement("a");
    a.download = "tunaguitar-progresso.png";
    a.href = cv.toDataURL("image/png");
    a.click();
  };

  const copyText = async () => {
    const text = `🎸 ${streak} dias de prática no violão!\n⏱ ${totalHours}h totais | 🎯 ${earLevelName()} | 🔥 Streak: ${streak} dias\nTreinei com TunaGuitar`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* indisponível */
    }
  };

  const exportJson = () => {
    const a = document.createElement("a");
    a.download = "tunaguitar-diario.json";
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ sessions }, null, 2)], { type: "application/json" }));
    a.click();
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as { sessions: Session[] };
        if (Array.isArray(data.sessions)) persist(data.sessions);
      } catch {
        /* arquivo inválido */
      }
    };
    reader.readAsText(file);
  };

  const toggleTag = (t: string) => setTags((arr) => (arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]));

  return (
    <div className="w-full max-w-4xl px-4 py-6 md:py-10">
      <h1 className="mb-1 font-headline text-3xl font-bold text-primary md:text-4xl">Diário de Prática</h1>
      <p className="mb-6 font-share-tech text-sm text-secondary">Registre e acompanhe sua evolução</p>

      {/* Timer + log */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#2a2a2a] bg-surface-lowest p-6">
          <span className="font-orbitron text-6xl text-accent">{fmtTime(seconds)}</span>
          <div className="mt-4 flex gap-3">
            <button onClick={() => setRunning((r) => !r)} className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-accent bg-accent/15 text-accent">
              {running ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
            </button>
            <button onClick={() => { setRunning(false); setSeconds(0); }} className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-[#333] text-on-surface-variant hover:text-primary">
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[#2a2a2a] bg-surface-lowest p-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="O que você praticou hoje?"
            rows={2}
            className="w-full resize-none rounded-lg border border-[#222] bg-[#0a0a0a] p-2 font-body text-sm text-on-surface outline-none focus:border-accent"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {TAGS.map((t) => (
              <button key={t} onClick={() => toggleTag(t)} className={`cursor-pointer rounded-full border px-2.5 py-1 font-label text-[10px] uppercase tracking-wide ${tags.includes(t) ? "border-accent bg-accent/10 text-accent" : "border-[#2a2a2a] text-on-surface-variant"}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2 font-share-tech text-xs">
            <input value={bpmStart} onChange={(e) => setBpmStart(e.target.value)} placeholder="BPM ini" className="w-20 rounded border border-[#222] bg-[#0a0a0a] px-2 py-1 text-on-surface outline-none" />
            <span className="text-on-surface-variant">→</span>
            <input value={bpmEnd} onChange={(e) => setBpmEnd(e.target.value)} placeholder="BPM fim" className="w-20 rounded border border-[#222] bg-[#0a0a0a] px-2 py-1 text-on-surface outline-none" />
            <div className="ml-auto flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} className="cursor-pointer p-0.5">
                  <Star className={`h-4 w-4 ${n <= rating ? "fill-secondary text-secondary" : "text-[#444]"}`} />
                </button>
              ))}
            </div>
          </div>
          <button onClick={saveSession} className="mt-3 w-full cursor-pointer rounded-lg bg-accent py-2 font-label text-xs uppercase tracking-widest text-[#1a0000]">
            Salvar sessão
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          ["Sequência", `${streak}`],
          ["Recorde", `${record}`],
          ["Horas totais", totalHours],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-[#2a2a2a] bg-surface-lowest p-4 text-center">
            <div className="font-orbitron text-2xl text-accent">{v}</div>
            <div className="mt-1 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{k}</div>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="mb-6 overflow-x-auto rounded-xl border border-[#2a2a2a] bg-surface-lowest p-4">
        <span className="mb-3 block font-label text-[11px] uppercase tracking-widest text-on-surface-variant">Atividade (18 semanas)</span>
        <div className="flex gap-1">
          {heatmap.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-1">
              {col.map((cell) => (
                <div key={cell.key} title={`${cell.key}: ${cell.min} min`} className="h-3 w-3 rounded-sm" style={{ backgroundColor: heatColor(cell.min) }} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico */}
      <div className="mb-6 rounded-xl border border-[#2a2a2a] bg-surface-lowest p-4">
        <span className="mb-3 block font-label text-[11px] uppercase tracking-widest text-on-surface-variant">Minutos/dia (30 dias)</span>
        <canvas ref={chartRef} width={600} height={180} className="w-full" />
      </div>

      {/* Export/share */}
      <div className="flex flex-wrap gap-2">
        <button onClick={exportPng} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 font-label text-[11px] uppercase tracking-widest text-accent">
          <Download className="h-4 w-4" /> Card PNG
        </button>
        <button onClick={copyText} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#333] px-3 py-2 font-label text-[11px] uppercase tracking-widest text-on-surface-variant hover:text-primary">
          <Share2 className="h-4 w-4" /> {copied ? "Copiado!" : "Copiar texto"}
        </button>
        <button onClick={exportJson} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#333] px-3 py-2 font-label text-[11px] uppercase tracking-widest text-on-surface-variant hover:text-primary">
          <Download className="h-4 w-4" /> JSON
        </button>
        <button onClick={() => fileRef.current?.click()} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#333] px-3 py-2 font-label text-[11px] uppercase tracking-widest text-on-surface-variant hover:text-primary">
          <Upload className="h-4 w-4" /> Importar
        </button>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
      </div>

      {/* Histórico */}
      {sessions.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-headline text-xl text-on-surface">Sessões recentes</h2>
          <div className="flex flex-col gap-2">
            {sessions.slice(0, 8).map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-[#222] bg-surface-lowest px-4 py-2.5 font-share-tech text-sm">
                <div>
                  <span className="text-on-surface">{s.date}</span>
                  <span className="ml-3 text-secondary">{s.minutes} min</span>
                  {s.tags.length > 0 && <span className="ml-3 text-tertiary">{s.tags.join(", ")}</span>}
                </div>
                <span className="text-secondary">{"★".repeat(s.rating)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
