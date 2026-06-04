import { useState } from "react";
import { ArrowRight, Info } from "lucide-react";
import { NOTE_NAMES, pcName } from "../lib/theory";
import SplitHeading from "../components/SplitHeading";
import TiltCard from "../components/TiltCard";
import Tip from "../components/Tip";

interface Shape {
  label: string;
  root: number;
  q: string;
}

const SHAPES: Shape[] = [
  { label: "C", root: 0, q: "" },
  { label: "A", root: 9, q: "" },
  { label: "G", root: 7, q: "" },
  { label: "E", root: 4, q: "" },
  { label: "D", root: 2, q: "" },
  { label: "Am", root: 9, q: "m" },
  { label: "Em", root: 4, q: "m" },
  { label: "Dm", root: 2, q: "m" },
];

const EASY: Record<string, Set<number>> = {
  "": new Set([0, 9, 7, 4, 2]),
  m: new Set([9, 4, 2]),
};

const isEasy = (root: number, q: string) => EASY[q]?.has(root) ?? false;

export default function CapoPage() {
  const [origIdx, setOrigIdx] = useState(0);
  const [targetNote, setTargetNote] = useState(2);

  const [invNote, setInvNote] = useState(6);
  const [invQ, setInvQ] = useState("");

  const orig = SHAPES[origIdx];
  const capo = ((targetNote - orig.root) % 12 + 12) % 12;
  const sounding = pcName(targetNote) + orig.q;

  const invCombos = SHAPES.filter((s) => s.q === invQ)
    .map((s) => ({ shape: s, fret: ((invNote - s.root) % 12 + 12) % 12 }))
    .filter((c) => c.fret <= 9)
    .sort((a, b) => a.fret - b.fret);

  return (
    <div className="w-full max-w-4xl px-4 py-6 md:py-10">
      <SplitHeading text="Capotraste" className="mb-1 font-headline text-3xl font-bold text-primary md:text-4xl" />
      <p className="mb-6 font-share-tech text-sm text-secondary">Transponha tonalidades sem aprender acordes novos</p>

      {/* Calculadora direta */}
      <div className="mb-8 rounded-xl border border-[#2a2a2a] bg-surface-lowest p-5">
        <div className="grid items-end gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-label text-[11px] uppercase tracking-widest text-on-surface-variant">Formato que sei tocar</label>
            <select value={origIdx} onChange={(e) => setOrigIdx(Number(e.target.value))} className="w-full cursor-pointer rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2.5 font-share-tech text-on-surface outline-none focus:border-accent">
              {SHAPES.map((s, i) => (
                <option key={s.label} value={i}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-label text-[11px] uppercase tracking-widest text-on-surface-variant">Quero que soe em</label>
            <select value={targetNote} onChange={(e) => setTargetNote(Number(e.target.value))} className="w-full cursor-pointer rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2.5 font-share-tech text-on-surface outline-none focus:border-accent">
              {NOTE_NAMES.map((n, i) => (
                <option key={n} value={i}>
                  {n}
                  {orig.q}
                </option>
              ))}
            </select>
          </div>
        </div>

        <TiltCard
          options={{ max: 12, speed: 350, glare: true, "max-glare": 0.12, perspective: 600, scale: 1.03 }}
          className="relative mt-5 overflow-hidden rounded-lg border border-accent/40 bg-accent/5 p-4 text-center"
        >
          <Tip content="Toque os acordes abertos como se estivessem nesta posição do braço.">
            <Info className="absolute right-2 top-2 h-4 w-4 text-on-surface-variant" />
          </Tip>
          {capo === 0 ? (
            <p className="font-share-tech text-lg text-on-surface">
              Sem capotraste — toque <span className="text-accent">{orig.label}</span> normalmente.
            </p>
          ) : (
            <p className="font-share-tech text-lg text-on-surface">
              Capo na casa <span className="font-orbitron text-2xl text-accent">{capo}</span> e toque o formato de{" "}
              <span className="text-accent">{orig.label}</span>
              <span className="mx-2 inline-flex items-center text-on-surface-variant">
                <ArrowRight className="h-4 w-4" />
              </span>
              soa <span className="text-secondary">{sounding}</span>.
            </p>
          )}
        </TiltCard>
      </div>

      {/* Tabela de transposição */}
      <h2 className="mb-3 font-headline text-xl text-on-surface">Tabela de transposição</h2>
      <p className="mb-3 font-share-tech text-xs text-tertiary">Destaque = tonalidades difíceis de tocar abertas (o capo facilita).</p>
      <div data-reveal className="mb-8 overflow-x-auto rounded-xl border border-[#2a2a2a]">
        <table className="w-full border-collapse text-center font-share-tech text-sm">
          <thead>
            <tr className="bg-surface-lowest">
              <th className="border-b border-[#2a2a2a] px-3 py-2 text-on-surface-variant">Capo</th>
              {SHAPES.map((s) => (
                <th key={s.label} className="border-b border-[#2a2a2a] px-3 py-2 text-on-surface">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 7 }, (_, r) => {
              const f = r + 1;
              return (
                <tr key={f} className="odd:bg-[#0d0d0d]">
                  <td className="border-b border-[#1f1f1f] px-3 py-2 font-bold text-accent">{f}</td>
                  {SHAPES.map((s) => {
                    const root = (s.root + f) % 12;
                    const hard = !isEasy(root, s.q);
                    return (
                      <td key={s.label} className={`border-b border-[#1f1f1f] px-3 py-2 ${hard ? "bg-accent/10 font-bold text-accent" : "text-on-surface-variant"}`}>
                        {pcName(root)}
                        {s.q}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modo inverso */}
      <h2 className="mb-3 font-headline text-xl text-on-surface">Modo inverso</h2>
      <div data-reveal className="rounded-xl border border-[#2a2a2a] bg-surface-lowest p-5">
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block font-label text-[11px] uppercase tracking-widest text-on-surface-variant">Quero tocar em</label>
            <select value={invNote} onChange={(e) => setInvNote(Number(e.target.value))} className="cursor-pointer rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2.5 font-share-tech text-on-surface outline-none focus:border-accent">
              {NOTE_NAMES.map((n, i) => (
                <option key={n} value={i}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex rounded-lg border border-[#2a2a2a] p-1">
            {[
              { id: "", label: "Maior" },
              { id: "m", label: "Menor" },
            ].map((o) => (
              <button key={o.id} onClick={() => setInvQ(o.id)} className={`cursor-pointer rounded px-3 py-1.5 font-label text-[11px] uppercase tracking-widest ${invQ === o.id ? "bg-accent/15 text-accent" : "text-on-surface-variant"}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <p className="mb-3 font-share-tech text-sm text-on-surface-variant">
          Para tocar <span className="text-secondary">{pcName(invNote)}{invQ}</span> usando acordes abertos:
        </p>
        <div className="flex flex-col gap-2">
          {invCombos.map((c) => (
            <div key={c.shape.label} className="flex items-center justify-between rounded-lg border border-[#222] bg-[#0a0a0a] px-4 py-2.5 font-share-tech text-sm">
              <span className="text-on-surface">
                {c.fret === 0 ? "Sem capo" : `Capo na casa ${c.fret}`} · formato de {c.shape.label}
              </span>
              {!isEasy(c.shape.root, c.shape.q) && c.fret > 0 && <span className="font-label text-[10px] uppercase tracking-widest text-accent">prático</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
