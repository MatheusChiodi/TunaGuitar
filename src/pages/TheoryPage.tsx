import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ChevronDown, Music2, Network, Play, Table2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { audio } from "../lib/audio";
import { BR_NAMES, INTERVALS, NOTE_NAMES, OPEN_STRINGS, pcName } from "../lib/theory";

function Accordion({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-[#2a2a2a] bg-surface-lowest">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left">
        <Icon className="h-5 w-5 shrink-0 text-accent" />
        <span className="flex-1 font-headline text-base text-on-surface">{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown className="h-5 w-5 text-on-surface-variant" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="c" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="border-t border-[#222] p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Q: Record<string, { suffix: string; intervals: number[] }> = {
  maj: { suffix: "", intervals: [0, 4, 7] },
  min: { suffix: "m", intervals: [0, 3, 7] },
  maj7: { suffix: "maj7", intervals: [0, 4, 7, 11] },
  min7: { suffix: "m7", intervals: [0, 3, 7, 10] },
  dom7: { suffix: "7", intervals: [0, 4, 7, 10] },
};

const PROGRESSIONS = [
  { name: "I–IV–V–I", desc: "A base do rock, pop e blues.", chords: [{ s: 0, q: "maj" }, { s: 5, q: "maj" }, { s: 7, q: "maj" }, { s: 0, q: "maj" }] },
  { name: "I–V–vi–IV", desc: "A progressão “dos 4 acordes” de incontáveis hits.", chords: [{ s: 0, q: "maj" }, { s: 7, q: "maj" }, { s: 9, q: "min" }, { s: 5, q: "maj" }] },
  { name: "ii–V–I", desc: "O coração do jazz.", chords: [{ s: 2, q: "min7" }, { s: 7, q: "dom7" }, { s: 0, q: "maj7" }] },
  { name: "12-bar Blues", desc: "Os três acordes dominantes do blues.", chords: [{ s: 0, q: "dom7" }, { s: 5, q: "dom7" }, { s: 7, q: "dom7" }] },
];

const KEYS = [0, 7, 2]; // C, G, D

const FORMULAS = [
  { name: "Maior", formula: "1 – 3 – 5", intervals: [0, 4, 7] },
  { name: "Menor", formula: "1 – ♭3 – 5", intervals: [0, 3, 7] },
  { name: "Diminuto", formula: "1 – ♭3 – ♭5", intervals: [0, 3, 6] },
  { name: "Aumentado", formula: "1 – 3 – ♯5", intervals: [0, 4, 8] },
  { name: "7ª Dominante", formula: "1 – 3 – 5 – ♭7", intervals: [0, 4, 7, 10] },
  { name: "Maior com 7ª", formula: "1 – 3 – 5 – 7", intervals: [0, 4, 7, 11] },
];

export default function TheoryPage() {
  const [sel, setSel] = useState<{ s: number; f: number } | null>(null);
  const [chordRoot, setChordRoot] = useState(0);

  const playProg = (chords: { s: number; q: string }[]) => {
    chords.forEach((c, i) =>
      setTimeout(() => audio.playNotes(Q[c.q].intervals.map((iv) => 48 + c.s + iv), { arpeggio: false, duration: 1.1 }), i * 850),
    );
  };

  const selNote = sel ? pcName((OPEN_STRINGS[sel.s] + sel.f) % 12) : null;

  return (
    <div className="w-full max-w-3xl px-4 py-6 md:py-10">
      <h1 className="mb-1 font-headline text-3xl font-bold text-primary md:text-4xl">Teoria Musical</h1>
      <p className="mb-6 font-share-tech text-sm text-secondary">Fundamentos aplicados ao violão</p>

      <div className="flex flex-col gap-3">
        {/* 1. Notas e o braço */}
        <Accordion icon={Music2} title="Notas e o Braço do Violão">
          {selNote && (
            <p className="mb-3 text-center font-orbitron text-3xl text-accent">
              {selNote} <span className="font-share-tech text-sm text-on-surface-variant">({BR_NAMES[selNote[0]]}{selNote.length > 1 ? "♯" : ""})</span>
            </p>
          )}
          <p className="mb-3 font-share-tech text-xs text-tertiary">Clique em qualquer casa para ouvir e ver a nota.</p>
          <div className="overflow-x-auto">
            <table className="border-collapse font-share-tech text-xs">
              <tbody>
                {[5, 4, 3, 2, 1, 0].map((s) => (
                  <tr key={s}>
                    <td className="px-2 py-1 text-on-surface-variant">{pcName(OPEN_STRINGS[s] % 12)}</td>
                    {Array.from({ length: 13 }, (_, f) => {
                      const note = pcName((OPEN_STRINGS[s] + f) % 12);
                      const active = sel?.s === s && sel?.f === f;
                      return (
                        <td key={f} className="p-0.5">
                          <button
                            onClick={() => { setSel({ s, f }); audio.playMidi(OPEN_STRINGS[s] + f, 0.8); }}
                            className={`h-7 w-9 cursor-pointer rounded border text-center transition-colors ${active ? "border-accent bg-accent/20 text-accent" : "border-[#222] text-on-surface hover:border-[#444]"}`}
                          >
                            {note}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <td />
                  {Array.from({ length: 13 }, (_, f) => (
                    <td key={f} className="text-center text-[10px] text-tertiary">{f}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Accordion>

        {/* 2. Intervalos */}
        <Accordion icon={Network} title="Intervalos">
          <table className="w-full border-collapse font-share-tech text-sm">
            <thead>
              <tr className="text-left text-on-surface-variant">
                <th className="pb-2">Nome</th>
                <th className="pb-2">Semitons</th>
                <th className="pb-2">Símbolo</th>
                <th className="pb-2">Exemplo</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {INTERVALS.map((iv) => (
                <tr key={iv.semitones} className="border-t border-[#1f1f1f]">
                  <td className="py-1.5 text-on-surface">{iv.name}</td>
                  <td className="py-1.5 text-secondary">{iv.semitones}</td>
                  <td className="py-1.5 text-on-surface-variant">{iv.symbol}</td>
                  <td className="py-1.5 text-tertiary">{iv.example}</td>
                  <td className="py-1.5 text-right">
                    <button onClick={() => audio.playSequence([60, 60 + iv.semitones], { gap: 0.45, duration: 0.5 })} className="cursor-pointer p-1 text-accent">
                      <Play className="h-3.5 w-3.5 fill-current" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Accordion>

        {/* 3. Construção de acordes */}
        <Accordion icon={BookOpen} title="Construção de Acordes">
          <div className="mb-4 flex items-center gap-2 font-share-tech text-sm">
            <span className="text-on-surface-variant">Tônica:</span>
            <select value={chordRoot} onChange={(e) => setChordRoot(Number(e.target.value))} className="cursor-pointer rounded border border-[#2a2a2a] bg-[#0a0a0a] px-2 py-1 text-on-surface outline-none">
              {NOTE_NAMES.map((n, i) => (
                <option key={n} value={i}>{n}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            {FORMULAS.map((fm) => (
              <div key={fm.name} className="flex items-center justify-between rounded-lg border border-[#222] bg-[#0a0a0a] px-4 py-2.5 font-share-tech text-sm">
                <div>
                  <span className="text-on-surface">{fm.name}</span>
                  <span className="ml-3 text-tertiary">{fm.formula}</span>
                </div>
                <span className="text-accent">{fm.intervals.map((i) => pcName((chordRoot + i) % 12)).join(" ")}</span>
              </div>
            ))}
          </div>
        </Accordion>

        {/* 4. Progressões */}
        <Accordion icon={Network} title="Progressões Populares">
          <div className="flex flex-col gap-4">
            {PROGRESSIONS.map((p) => (
              <div key={p.name} className="rounded-lg border border-[#222] bg-[#0a0a0a] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-headline text-on-surface">{p.name}</span>
                  <button onClick={() => playProg(p.chords)} className="flex cursor-pointer items-center gap-1 font-label text-[10px] uppercase tracking-widest text-accent">
                    <Play className="h-3.5 w-3.5 fill-current" /> Ouvir (C)
                  </button>
                </div>
                <p className="mb-3 font-body text-xs text-tertiary">{p.desc}</p>
                <div className="flex flex-col gap-1.5 font-share-tech text-sm">
                  {KEYS.map((k) => (
                    <div key={k} className="flex gap-2">
                      <span className="w-8 text-on-surface-variant">{pcName(k)}:</span>
                      {p.chords.map((c, i) => (
                        <span key={i} className="text-on-surface">{pcName((k + c.s) % 12)}{Q[c.q].suffix}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Accordion>

        {/* 5. Cifra BR */}
        <Accordion icon={Table2} title="Cifra Brasileira vs. Internacional">
          <div className="grid grid-cols-2 gap-2 font-share-tech text-sm sm:grid-cols-4">
            {Object.entries(BR_NAMES).map(([intl, br]) => (
              <div key={intl} className="flex items-center justify-center gap-2 rounded-lg border border-[#222] bg-[#0a0a0a] py-2.5">
                <span className="text-secondary">{br}</span>
                <span className="text-on-surface-variant">=</span>
                <span className="text-accent">{intl}</span>
              </div>
            ))}
          </div>
        </Accordion>
      </div>
    </div>
  );
}
