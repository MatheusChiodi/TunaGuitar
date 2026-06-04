import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Maximize, Minus, Pause, Play, Plus, Timer, X } from "lucide-react";
import { audio } from "../lib/audio";
import { usePitchDetection } from "../hooks/usePitchDetection";
import { centsOff, midiFromFrequency, noteFromMidi } from "../lib/pitch";
import { isChordToken } from "../lib/theory";
import { load, save } from "../lib/storage";
import { useGamify } from "../context/GamifyContext";

interface Cifra {
  id: string;
  title: string;
  artist: string;
  key: string;
  bpm: number;
  text: string;
}

function TunerOverlay({ onClose }: { onClose: () => void }) {
  const { frequency, isListening, start, stop } = usePitchDetection();
  useEffect(() => {
    void start();
    return () => stop();
  }, [start, stop]);
  const midi = frequency ? midiFromFrequency(frequency, 440) : null;
  const info = midi ? noteFromMidi(midi) : null;
  const cents = frequency && midi ? centsOff(frequency, midi, 440) : 0;
  return (
    <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-black/95" onClick={onClose}>
      <div className="font-orbitron text-[140px] leading-none text-accent">{info ? info.note : "–"}</div>
      <div className="font-share-tech text-3xl text-on-surface-variant">{frequency ? `${frequency.toFixed(1)} Hz · ${cents > 0 ? "+" : ""}${cents.toFixed(0)}c` : isListening ? "ouvindo…" : ""}</div>
      <span className="mt-8 font-label text-xs uppercase tracking-widest text-tertiary">toque para fechar</span>
    </div>
  );
}

export default function PerformancePage() {
  const navigate = useNavigate();
  const { track } = useGamify();
  const cifras = load<Cifra[]>("tg.cifras", []);
  const [idx, setIdx] = useState(0);
  const [metroOn, setMetroOn] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(30);
  const [showTuner, setShowTuner] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [perfNotes, setPerfNotes] = useState<Record<string, string>>(() => load("tg.perfNotes", {}));
  const [setMinutes, setSetMinutes] = useState(45);
  const [remaining, setRemaining] = useState(45 * 60);
  const [timerOn, setTimerOn] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const song = cifras[idx];

  useEffect(() => {
    track("performance");
  }, [track]);

  const next = () => setIdx((i) => Math.min(cifras.length - 1, i + 1));
  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen().catch(() => {});
  };
  const exit = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    navigate("/");
  };

  // Atalhos de teclado.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); setMetroOn((m) => !m); }
      else if (e.code === "ArrowRight") next();
      else if (e.code === "ArrowLeft") prev();
      else if (e.key === "f" || e.key === "F") toggleFullscreen();
      else if (e.key === "t" || e.key === "T") setShowTuner((s) => !s);
      else if (e.code === "Escape") exit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cifras.length]);

  // Metrônomo.
  useEffect(() => {
    if (!metroOn || !song) return;
    const period = (60 / song.bpm) * 1000;
    const id = window.setInterval(() => {
      audio.click(audio.currentTime + 0.01, { type: "electronic", volume: 0.5 });
      setPulse((p) => !p);
    }, period);
    return () => clearInterval(id);
  }, [metroOn, song]);

  // Auto-scroll (prompter).
  useEffect(() => {
    if (!scrolling) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      if (scrollRef.current) scrollRef.current.scrollTop += scrollSpeed * dt;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scrolling, scrollSpeed]);

  // Timer do set.
  useEffect(() => {
    if (!timerOn) return;
    const id = window.setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [timerOn]);

  const saveNote = (v: string) => {
    if (!song) return;
    const next = { ...perfNotes, [song.id]: v };
    setPerfNotes(next);
    save("tg.perfNotes", next);
  };

  if (!song) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-black p-6 text-center">
        <p className="font-headline text-2xl text-on-surface">Nenhuma cifra salva.</p>
        <p className="font-share-tech text-sm text-on-surface-variant">Crie e salve cifras no Cifrador para montar o setlist.</p>
        <button onClick={() => navigate("/cifrador")} className="cursor-pointer rounded-lg border border-accent bg-accent/10 px-4 py-2 font-label text-xs uppercase tracking-widest text-accent">Ir ao Cifrador</button>
        <button onClick={() => navigate("/")} className="cursor-pointer font-label text-xs uppercase tracking-widest text-on-surface-variant">Sair</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black text-on-surface">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <span className="font-orbitron text-2xl text-accent">{idx + 1} / {cifras.length}</span>
        <div className="flex items-center gap-3">
          {timerOn && <span className="font-share-tech text-xl text-secondary">{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}</span>}
          <button onClick={toggleFullscreen} className="cursor-pointer text-on-surface-variant hover:text-primary"><Maximize className="h-6 w-6" /></button>
          <button onClick={exit} className="cursor-pointer text-on-surface-variant hover:text-error"><X className="h-7 w-7" /></button>
        </div>
      </div>

      {/* Header da música */}
      <div className="flex items-start justify-between px-6">
        <div>
          <h1 className="font-headline text-5xl font-bold leading-none text-on-surface md:text-7xl">{song.title}</h1>
          <p className="mt-2 font-share-tech text-xl text-on-surface-variant">{song.artist}</p>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <div className="font-label text-[10px] uppercase tracking-widest text-tertiary">Tom</div>
            <div className="font-orbitron text-3xl text-accent">{song.key}</div>
          </div>
          <div>
            <div className="font-label text-[10px] uppercase tracking-widest text-tertiary">BPM</div>
            <div className="flex items-center gap-1 font-orbitron text-3xl text-secondary">
              {song.bpm}
              <span className={`h-2.5 w-2.5 rounded-full transition-colors ${metroOn && pulse ? "bg-accent" : "bg-[#333]"}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Cifra com prompter */}
      <div ref={scrollRef} className="mt-4 flex-1 overflow-y-auto px-6 pb-32">
        <pre className="whitespace-pre-wrap break-words font-share-tech text-xl leading-9 text-on-surface md:text-2xl">
          {song.text.split("\n").map((line, li) => (
            <div key={li}>
              {line.split(/(\s+)/).map((tok, ti) => (isChordToken(tok) ? <span key={ti} className="font-bold text-accent">{tok}</span> : <span key={ti}>{tok}</span>))}
            </div>
          ))}
        </pre>
      </div>

      {/* Controles flutuantes */}
      <div className="absolute bottom-0 left-0 flex w-full items-center justify-between gap-2 border-t border-[#222] bg-black/80 px-6 py-3 backdrop-blur">
        <button onClick={prev} disabled={idx === 0} className="cursor-pointer text-on-surface-variant disabled:opacity-30"><ChevronLeft className="h-8 w-8" /></button>

        <div className="flex items-center gap-2">
          <button onClick={() => setMetroOn((m) => !m)} className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border ${metroOn ? "border-accent text-accent" : "border-[#333] text-on-surface-variant"}`}>
            {metroOn ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
          </button>
          <button onClick={() => setScrolling((s) => !s)} className={`flex h-11 cursor-pointer items-center gap-1 rounded-full border px-3 font-label text-[10px] uppercase ${scrolling ? "border-accent text-accent" : "border-[#333] text-on-surface-variant"}`}>
            Prompter
          </button>
          <button onClick={() => setScrollSpeed((s) => Math.max(10, s - 10))} className="cursor-pointer text-on-surface-variant"><Minus className="h-4 w-4" /></button>
          <span className="font-share-tech text-xs text-tertiary">{scrollSpeed}px/s</span>
          <button onClick={() => setScrollSpeed((s) => Math.min(120, s + 10))} className="cursor-pointer text-on-surface-variant"><Plus className="h-4 w-4" /></button>
          <button onClick={() => setShowTuner(true)} className="flex h-11 cursor-pointer items-center rounded-full border border-[#333] px-3 font-label text-[10px] uppercase text-on-surface-variant">Afinador</button>
          <button onClick={() => setNotesOpen((n) => !n)} className="flex h-11 cursor-pointer items-center rounded-full border border-[#333] px-3 font-label text-[10px] uppercase text-on-surface-variant">Notas</button>
          <button onClick={() => { setRemaining(setMinutes * 60); setTimerOn((t) => !t); }} className={`flex h-11 cursor-pointer items-center gap-1 rounded-full border px-3 ${timerOn ? "border-accent text-accent" : "border-[#333] text-on-surface-variant"}`}>
            <Timer className="h-4 w-4" />
          </button>
          <input type="number" value={setMinutes} onChange={(e) => setSetMinutes(Number(e.target.value) || 45)} className="w-14 rounded border border-[#333] bg-transparent px-2 py-1 text-center font-share-tech text-xs text-on-surface outline-none" />
        </div>

        <button onClick={next} disabled={idx === cifras.length - 1} className="cursor-pointer text-on-surface-variant disabled:opacity-30"><ChevronRight className="h-8 w-8" /></button>
      </div>

      {/* Notas da música */}
      {notesOpen && (
        <div className="absolute bottom-20 left-1/2 w-[90%] max-w-md -translate-x-1/2 rounded-xl border border-[#333] bg-surface-lowest p-4">
          <textarea value={perfNotes[song.id] ?? ""} onChange={(e) => saveNote(e.target.value)} placeholder="Notas de arranjo, lembretes…" rows={3} className="w-full resize-none rounded-lg border border-[#222] bg-[#0a0a0a] p-2 font-body text-sm text-on-surface outline-none focus:border-accent" />
        </div>
      )}

      {showTuner && <TunerOverlay onClose={() => setShowTuner(false)} />}
    </div>
  );
}
