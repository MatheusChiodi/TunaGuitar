import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, Sparkles, Star, Volume2 } from "lucide-react";
import ChordDiagram from "../components/ChordDiagram";
import { CHORDS, CHORD_CATEGORIES, voicingMidis, type ChordEntry } from "../lib/chords";
import { audio } from "../lib/audio";
import { load, save } from "../lib/storage";

const TABS = ["Todos", ...CHORD_CATEGORIES, "Favoritos"];

function ChordCard({ entry, fav, onToggleFav }: { entry: ChordEntry; fav: boolean; onToggleFav: () => void }) {
  const [vi, setVi] = useState(0);
  const navigate = useNavigate();
  const v = entry.voicings[vi];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col rounded-xl border border-[#2a2a2a] bg-surface-lowest p-3"
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="font-orbitron text-xl text-on-surface">{entry.symbol}</span>
        <button onClick={onToggleFav} className="cursor-pointer p-1" aria-label="Favoritar">
          <Star className={`h-4 w-4 ${fav ? "fill-secondary text-secondary" : "text-on-surface-variant"}`} />
        </button>
      </div>

      <ChordDiagram voicing={v} />

      <div className="mt-1 flex items-center justify-between">
        <button
          disabled={entry.voicings.length < 2}
          onClick={() => setVi((i) => (i - 1 + entry.voicings.length) % entry.voicings.length)}
          className="cursor-pointer p-1 text-on-surface-variant disabled:opacity-20"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-center font-label text-[9px] uppercase tracking-wide text-tertiary">{v.name}</span>
        <button
          disabled={entry.voicings.length < 2}
          onClick={() => setVi((i) => (i + 1) % entry.voicings.length)}
          className="cursor-pointer p-1 text-on-surface-variant disabled:opacity-20"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex gap-2">
        <button
          onClick={() => audio.playNotes(voicingMidis(v.frets), { arpeggio: true })}
          className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg border border-accent/40 bg-accent/10 py-1.5 font-label text-[10px] uppercase tracking-widest text-accent"
        >
          <Volume2 className="h-3.5 w-3.5" /> Ouvir
        </button>
        <button
          onClick={() => navigate("/")}
          title="Abrir afinador"
          className="cursor-pointer rounded-lg border border-[#333] px-3 py-1.5 font-label text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary"
        >
          Afinar
        </button>
      </div>
    </motion.div>
  );
}

export default function ChordsPage() {
  const [tab, setTab] = useState("Todos");
  const [query, setQuery] = useState("");
  const [favs, setFavs] = useState<string[]>(() => load("tg.favChords", []));
  const [ofDay] = useState(() => CHORDS[Math.floor(Math.random() * CHORDS.length)]);

  const toggleFav = (id: string) =>
    setFavs((f) => {
      const next = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
      save("tg.favChords", next);
      return next;
    });

  const list = useMemo(() => {
    let l = CHORDS;
    if (tab === "Favoritos") l = CHORDS.filter((c) => favs.includes(c.id));
    else if (tab === "Barra") l = CHORDS.filter((c) => c.voicings.some((v) => v.barre));
    else if (tab !== "Todos") l = CHORDS.filter((c) => c.category === tab);
    const q = query.toLowerCase().replace(/\s/g, "");
    if (q) l = l.filter((c) => c.symbol.toLowerCase().includes(q));
    return l;
  }, [tab, query, favs]);

  return (
    <div className="w-full max-w-5xl px-4 py-6 md:py-10">
      <h1 className="mb-1 font-headline text-3xl font-bold text-primary md:text-4xl">Acordes</h1>
      <p className="mb-6 font-share-tech text-sm text-secondary">{CHORDS.length} variações</p>

      {/* Acorde do dia */}
      <div className="mb-6 flex items-center gap-4 rounded-xl border border-accent/40 bg-accent/5 p-4">
        <div className="w-24 shrink-0">
          <ChordDiagram voicing={ofDay.voicings[0]} />
        </div>
        <div>
          <span className="flex items-center gap-1 font-label text-[10px] uppercase tracking-widest text-accent">
            <Sparkles className="h-3.5 w-3.5" /> Acorde do dia
          </span>
          <p className="mt-1 font-orbitron text-2xl text-on-surface">{ofDay.symbol}</p>
          <button
            onClick={() => audio.playNotes(voicingMidis(ofDay.voicings[0].frets), { arpeggio: true })}
            className="mt-2 flex cursor-pointer items-center gap-1 font-label text-[10px] uppercase tracking-widest text-accent"
          >
            <Volume2 className="h-3.5 w-3.5" /> Ouvir
          </button>
        </div>
      </div>

      {/* Busca */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar acorde (ex: Am7, C#dim, Gsus4)…"
          className="w-full rounded-lg border border-[#2a2a2a] bg-surface-lowest py-2.5 pl-10 pr-4 font-share-tech text-sm text-on-surface outline-none focus:border-accent"
        />
      </div>

      {/* Tabs */}
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 cursor-pointer rounded-full border px-4 py-1.5 font-label text-[11px] uppercase tracking-widest transition-colors ${
              tab === t ? "border-accent bg-accent/10 text-accent" : "border-[#2a2a2a] text-on-surface-variant hover:border-[#444]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="py-12 text-center font-share-tech text-on-surface-variant">Nenhum acorde encontrado.</p>
      ) : (
        <motion.div layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((c) => (
            <ChordCard key={c.id} entry={c} fav={favs.includes(c.id)} onToggleFav={() => toggleFav(c.id)} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
