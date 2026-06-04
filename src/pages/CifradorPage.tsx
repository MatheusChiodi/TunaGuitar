import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Printer, Save, Search, Trash2, Volume2, X } from "lucide-react";
import ChordDiagram from "../components/ChordDiagram";
import { getChordBySymbol, voicingMidis } from "../lib/chords";
import { isChordToken, parseChord, transposeChord } from "../lib/theory";
import { audio } from "../lib/audio";
import { load, save } from "../lib/storage";
import { useGamify } from "../context/GamifyContext";

interface Cifra {
  id: string;
  title: string;
  artist: string;
  key: string;
  bpm: number;
  text: string;
  date: string;
}

type ViewMode = "original" | "transposta" | "ambas";

const SAMPLE = `[Intro] C  G  Am  F

C              G
Imagine all the people
Am                 F
Living for today`;

function ChordToken({ raw, semis, mode, onClick }: { raw: string; semis: number; mode: ViewMode; onClick: (s: string) => void }) {
  const transposed = transposeChord(raw, semis);
  const label = mode === "original" ? raw : mode === "transposta" ? transposed : `${transposed}${semis ? `(${raw})` : ""}`;
  return (
    <button onClick={() => onClick(mode === "original" ? raw : transposed)} className="cursor-pointer font-bold text-accent hover:underline">
      {label}
    </button>
  );
}

export default function CifradorPage() {
  const { track } = useGamify();
  const [text, setText] = useState<string>(() => {
    const draft = load<string>("tg.cifraDraft", "");
    if (draft) {
      save("tg.cifraDraft", "");
      return draft;
    }
    return SAMPLE;
  });
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [songKey, setSongKey] = useState("C");
  const [bpm, setBpm] = useState(100);
  const [semis, setSemis] = useState(0);
  const [mode, setMode] = useState<ViewMode>("transposta");
  const [popup, setPopup] = useState<string | null>(null);
  const [cifras, setCifras] = useState<Cifra[]>(() => load("tg.cifras", []));
  const [query, setQuery] = useState("");

  const chordCount = useMemo(() => text.split(/\s+/).filter((t) => isChordToken(t)).length, [text]);
  const measures = chordCount || 1;
  const durationSec = Math.round((measures * 4 * 60) / bpm);

  const persist = (next: Cifra[]) => {
    setCifras(next);
    save("tg.cifras", next);
  };

  const saveCifra = () => {
    const c: Cifra = {
      id: `${Date.now()}`,
      title: title.trim() || "Sem título",
      artist: artist.trim(),
      key: songKey,
      bpm,
      text,
      date: new Date().toLocaleDateString("pt-BR"),
    };
    persist([c, ...cifras]);
  };

  const formatText = () =>
    setText((t) => t.split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").replace(/\n{3,}/g, "\n\n"));

  const openChord = (symbol: string) => {
    setPopup(symbol);
    track("chordLearn");
  };

  const popupChord = popup ? parseChord(popup) : null;
  const popupEntry = popup ? getChordBySymbol(popup) : undefined;

  const filtered = cifras.filter((c) => `${c.title} ${c.artist}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="w-full max-w-5xl px-4 py-6 md:py-10">
      <h1 className="mb-1 font-headline text-3xl font-bold text-primary md:text-4xl">Cifrador</h1>
      <p className="mb-6 font-share-tech text-sm text-secondary">Editor de cifras com transposição e diagramas</p>

      {/* Metadados */}
      <div className="no-print mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" className="rounded-lg border border-[#2a2a2a] bg-surface-lowest px-3 py-2 font-share-tech text-sm text-on-surface outline-none focus:border-accent" />
        <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artista" className="rounded-lg border border-[#2a2a2a] bg-surface-lowest px-3 py-2 font-share-tech text-sm text-on-surface outline-none focus:border-accent" />
        <input value={songKey} onChange={(e) => setSongKey(e.target.value)} placeholder="Tom" className="rounded-lg border border-[#2a2a2a] bg-surface-lowest px-3 py-2 font-share-tech text-sm text-on-surface outline-none focus:border-accent" />
        <input type="number" value={bpm} onChange={(e) => setBpm(Number(e.target.value) || 100)} placeholder="BPM" className="rounded-lg border border-[#2a2a2a] bg-surface-lowest px-3 py-2 font-share-tech text-sm text-on-surface outline-none focus:border-accent" />
      </div>

      {/* Controles */}
      <div className="no-print mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-[#2a2a2a] px-3 py-1.5">
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Transpor</span>
          <button onClick={() => setSemis((s) => Math.max(-6, s - 1))} className="cursor-pointer px-2 text-on-surface-variant hover:text-accent">−</button>
          <span className="w-8 text-center font-share-tech text-accent">{semis > 0 ? `+${semis}` : semis}</span>
          <button onClick={() => setSemis((s) => Math.min(6, s + 1))} className="cursor-pointer px-2 text-on-surface-variant hover:text-accent">+</button>
        </div>
        <div className="flex rounded-lg border border-[#2a2a2a] p-1">
          {(["original", "transposta", "ambas"] as ViewMode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`cursor-pointer rounded px-2.5 py-1 font-label text-[10px] uppercase tracking-widest ${mode === m ? "bg-accent/15 text-accent" : "text-on-surface-variant"}`}>
              {m}
            </button>
          ))}
        </div>
        <button onClick={formatText} className="cursor-pointer rounded-lg border border-[#333] px-3 py-2 font-label text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary">Formatar</button>
        <button onClick={saveCifra} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 font-label text-[10px] uppercase tracking-widest text-accent">
          <Save className="h-4 w-4" /> Salvar
        </button>
        <button onClick={() => window.print()} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#333] px-3 py-2 font-label text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary">
          <Printer className="h-4 w-4" /> PDF
        </button>
      </div>

      {semis > 0 && (
        <div className="no-print mb-4 rounded-lg border border-secondary/30 bg-secondary/5 px-4 py-2 font-share-tech text-sm text-secondary">
          Dica: use capo na casa {semis} e toque a cifra original.
        </div>
      )}

      {/* Split view */}
      <div className="grid gap-4 lg:grid-cols-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Cole ou digite a cifra aqui…"
          className="no-print min-h-[360px] w-full resize-y rounded-xl border border-[#2a2a2a] bg-surface-lowest p-4 font-share-tech text-sm leading-6 text-on-surface outline-none focus:border-accent"
          spellCheck={false}
        />
        <div className="rounded-xl border border-[#2a2a2a] bg-surface-lowest p-4">
          <div className="mb-2 font-share-tech text-xs text-tertiary">
            ≈ {measures} compassos · {Math.floor(durationSec / 60)}:{String(durationSec % 60).padStart(2, "0")}
          </div>
          <pre className="whitespace-pre-wrap break-words font-share-tech text-sm leading-6 text-on-surface">
            {text.split("\n").map((line, li) => (
              <div key={li}>
                {line.split(/(\s+)/).map((tok, ti) =>
                  isChordToken(tok) && parseChord(tok) ? <ChordToken key={ti} raw={tok} semis={semis} mode={mode} onClick={openChord} /> : <span key={ti}>{tok}</span>,
                )}
              </div>
            ))}
          </pre>
        </div>
      </div>

      {/* Minhas cifras */}
      <div className="no-print mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-headline text-xl text-on-surface">Minhas Cifras</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar…" className="rounded-lg border border-[#2a2a2a] bg-surface-lowest py-1.5 pl-8 pr-3 font-share-tech text-sm text-on-surface outline-none focus:border-accent" />
          </div>
        </div>
        {filtered.length === 0 ? (
          <p className="font-share-tech text-sm text-on-surface-variant">Nenhuma cifra salva.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((c) => (
              <div key={c.id} className="rounded-xl border border-[#2a2a2a] bg-surface-lowest p-3">
                <button onClick={() => { setText(c.text); setTitle(c.title); setArtist(c.artist); setSongKey(c.key); setBpm(c.bpm); setSemis(0); }} className="cursor-pointer text-left">
                  <p className="font-headline text-sm text-on-surface">{c.title}</p>
                  <p className="font-share-tech text-xs text-on-surface-variant">{c.artist || "—"}</p>
                  <p className="mt-1 font-share-tech text-[10px] text-tertiary">{c.key} · {c.bpm} BPM · {c.date}</p>
                </button>
                <button onClick={() => persist(cifras.filter((x) => x.id !== c.id))} className="mt-2 flex cursor-pointer items-center gap-1 font-label text-[10px] uppercase tracking-widest text-error/70 hover:text-error">
                  <Trash2 className="h-3 w-3" /> Excluir
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popup do acorde */}
      <AnimatePresence>
        {popup && (
          <motion.div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPopup(null)}>
            <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-64 rounded-2xl border border-[#333] bg-pedal-chassis p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-orbitron text-2xl text-accent">{popup}</span>
                <button onClick={() => setPopup(null)} className="cursor-pointer text-on-surface-variant hover:text-primary"><X className="h-5 w-5" /></button>
              </div>
              {popupEntry ? <ChordDiagram voicing={popupEntry.voicings[0]} /> : <p className="py-8 text-center font-share-tech text-sm text-on-surface-variant">Sem diagrama disponível</p>}
              <button
                onClick={() => {
                  if (popupEntry) audio.playNotes(voicingMidis(popupEntry.voicings[0].frets), { arpeggio: true });
                  else if (popupChord) audio.synthChord(popupChord.intervals.map((i) => 48 + popupChord.root + i));
                }}
                className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 py-2 font-label text-[10px] uppercase tracking-widest text-accent"
              >
                <Volume2 className="h-4 w-4" /> Ouvir acorde
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
