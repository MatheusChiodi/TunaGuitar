import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Save, Send, Square, Volume2 } from "lucide-react";
import ChordDiagram from "../components/ChordDiagram";
import { getChordBySymbol, voicingMidis } from "../lib/chords";
import { analyze, classify, detectKey, keyName, parseProgression, suggestNext } from "../lib/harmony";
import { NOTE_NAMES } from "../lib/theory";
import { audio } from "../lib/audio";
import { load, save } from "../lib/storage";

export default function ProgressionPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState("Am - F - C - G");
  const [keySel, setKeySel] = useState<"auto" | number>("auto");
  const [bpm] = useState(100);
  const [current, setCurrent] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const chords = useMemo(() => parseProgression(input), [input]);
  const key = keySel === "auto" ? detectKey(chords) : keySel;
  const analyzed = useMemo(() => analyze(chords, key), [chords, key]);
  const pattern = useMemo(() => classify(chords, key), [chords, key]);
  const suggestions = useMemo(() => suggestNext(chords, key), [chords, key]);

  const midisOf = (intervals: number[], root: number) => intervals.map((i) => 48 + root + i);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = undefined;
    setPlaying(false);
    setCurrent(-1);
  };

  const play = () => {
    if (!chords.length) return;
    stop();
    const step = (60 / bpm) * 2 * 1000;
    let i = 0;
    setPlaying(true);
    setCurrent(0);
    audio.synthChord(midisOf(chords[0].intervals, chords[0].root));
    timer.current = window.setInterval(() => {
      i = (i + 1) % chords.length;
      setCurrent(i);
      audio.synthChord(midisOf(chords[i].intervals, chords[i].root));
    }, step);
  };

  useEffect(() => () => stop(), []);

  const saveProgression = () => {
    const list = load<{ id: string; name: string; key: string; text: string; date: string }[]>("tg.progressions", []);
    list.unshift({ id: `${Date.now()}`, name: input, key: keyName(key), text: input, date: new Date().toLocaleDateString("pt-BR") });
    save("tg.progressions", list);
  };

  const sendToCifrador = () => {
    save("tg.cifraDraft", `[Progressão em ${keyName(key)}]\n${chords.map((c) => c.symbol).join("  ")}\n\n`);
    navigate("/cifrador");
  };

  const W = 560;
  const H = 120;
  const px = (i: number) => (chords.length > 1 ? 30 + (i / (chords.length - 1)) * (W - 60) : W / 2);
  const py = (t: number) => 20 + (1 - t) * (H - 40);

  return (
    <div className="w-full max-w-3xl px-4 py-6 md:py-10">
      <h1 className="mb-1 font-headline text-3xl font-bold text-primary md:text-4xl">Detector de Progressão</h1>
      <p className="mb-6 font-share-tech text-sm text-secondary">Análise harmônica e sugestões de continuação</p>

      {/* Input */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex.: Am - F - C - G"
          className="min-w-[220px] flex-1 rounded-lg border border-[#2a2a2a] bg-surface-lowest px-4 py-2.5 font-share-tech text-on-surface outline-none focus:border-accent"
        />
        <select value={keySel} onChange={(e) => setKeySel(e.target.value === "auto" ? "auto" : Number(e.target.value))} className="cursor-pointer rounded-lg border border-[#2a2a2a] bg-surface-lowest px-3 py-2.5 font-share-tech text-on-surface outline-none">
          <option value="auto">Detectar tom</option>
          {NOTE_NAMES.map((n, i) => (
            <option key={n} value={i}>{n} maior</option>
          ))}
        </select>
      </div>

      {chords.length > 0 && (
        <>
          {/* Análise */}
          <div className="mb-4 rounded-xl border border-[#2a2a2a] bg-surface-lowest p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-share-tech text-sm text-on-surface-variant">Tom provável: <span className="text-accent">{keyName(key)}</span></span>
              <div className="flex items-center gap-2">
                <button onClick={playing ? stop : play} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 font-label text-[10px] uppercase tracking-widest text-accent">
                  {playing ? <Square className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />} {playing ? "Parar" : "Tocar"}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {analyzed.map((c, i) => (
                <div key={i} className={`rounded-lg border px-4 py-2 text-center transition-colors ${current === i ? "border-accent bg-accent/15" : "border-[#222] bg-[#0a0a0a]"}`}>
                  <div className="font-orbitron text-lg text-on-surface">{c.symbol}</div>
                  <div className="font-share-tech text-xs text-secondary">{c.degree}</div>
                </div>
              ))}
            </div>
            {pattern && (
              <p className="mt-3 font-share-tech text-sm text-secondary">
                <span className="text-accent">{pattern.name}</span> → {pattern.desc}
              </p>
            )}
          </div>

          {/* Tensão */}
          <div className="mb-6 rounded-xl border border-[#2a2a2a] bg-surface-lowest p-4">
            <span className="mb-2 block font-label text-[11px] uppercase tracking-widest text-on-surface-variant">Tensão harmônica</span>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
              <line x1="20" y1={py(0)} x2={W - 20} y2={py(0)} stroke="#222" />
              <polyline points={analyzed.map((c, i) => `${px(i)},${py(c.tension)}`).join(" ")} fill="none" stroke="#ff5555" strokeWidth="2" />
              {analyzed.map((c, i) => (
                <g key={i}>
                  <circle cx={px(i)} cy={py(c.tension)} r={current === i ? 7 : 5} fill={current === i ? "#ffb95a" : "#ff5555"} />
                  <text x={px(i)} y={H - 6} fontSize="11" fill="#aa8986" textAnchor="middle" fontFamily="Share Tech Mono, monospace">{c.degree}</text>
                </g>
              ))}
            </svg>
          </div>

          {/* Sugestões */}
          <h2 className="mb-3 font-headline text-xl text-on-surface">Continuações sugeridas</h2>
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {suggestions.map((s, i) => {
              const entry = getChordBySymbol(s.symbol);
              return (
                <div key={i} className="rounded-xl border border-[#2a2a2a] bg-surface-lowest p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-orbitron text-lg text-accent">{s.symbol}</span>
                    <button
                      onClick={() => (entry ? audio.playNotes(voicingMidis(entry.voicings[0].frets), { arpeggio: true }) : audio.synthChord(midisOf(s.intervals, s.root)))}
                      className="cursor-pointer text-accent"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                  {entry ? <ChordDiagram voicing={entry.voicings[0]} /> : <div className="h-20" />}
                  <span className="mt-1 block font-share-tech text-[10px] text-tertiary">{s.style}</span>
                </div>
              );
            })}
          </div>

          {/* Export */}
          <div className="flex flex-wrap gap-2">
            <button onClick={saveProgression} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#333] px-3 py-2 font-label text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary">
              <Save className="h-4 w-4" /> Salvar
            </button>
            <button onClick={sendToCifrador} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 font-label text-[10px] uppercase tracking-widest text-accent">
              <Send className="h-4 w-4" /> Enviar ao Cifrador
            </button>
          </div>
        </>
      )}
    </div>
  );
}
