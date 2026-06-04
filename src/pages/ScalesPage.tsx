import { useMemo, useState } from "react";
import { Printer, Volume2 } from "lucide-react";
import Fretboard, { type FretDisplay } from "../components/Fretboard";
import { NOTE_NAMES, SCALES, scalePitchClasses } from "../lib/theory";
import { audio } from "../lib/audio";

const POS_OFFSETS = [0, 2, 4, 7, 9];

const USAGE: Record<string, string> = {
  major: "Base do pop, country e MPB. Ex.: “Let It Be”, “Imagine”.",
  naturalMinor: "Rock e baladas melancólicas. Ex.: “Stairway to Heaven”.",
  harmonicMinor: "Sonoridade clássica/flamenca e neoclássico (Yngwie Malmsteen).",
  melodicMinor: "Jazz e improvisação sofisticada.",
  pentatonicMajor: "Country, pop e solos alegres.",
  pentatonicMinor: "A escala do rock e blues. Ex.: solos do Hendrix, Slash.",
  blues: "Blues e rock — a “blue note” (♭5) dá o tempero.",
  dorian: "Funk, jazz e rock modal. Ex.: “So What” (Miles Davis).",
  phrygian: "Metal e música espanhola/flamenca.",
  lydian: "Trilhas e jazz — som “sonhador”. Ex.: temas do John Williams.",
  mixolydian: "Blues-rock e dominantes. Ex.: “Sweet Home Alabama”.",
  locrian: "Raríssima, usada em metal e jazz sobre acordes meio-diminutos.",
  chromatic: "Todas as 12 notas — passagens e tensão.",
};

export default function ScalesPage() {
  const [tonic, setTonic] = useState(0);
  const [scaleId, setScaleId] = useState("major");
  const [display, setDisplay] = useState<FretDisplay>("notes");
  const [pos, setPos] = useState(-1);

  const scale = SCALES.find((s) => s.id === scaleId) ?? SCALES[0];
  const pcs = useMemo(() => scalePitchClasses(tonic, scale), [tonic, scale]);

  const secondary = useMemo(() => {
    const third = scale.intervals.find((i) => i === 3 || i === 4);
    const seventh = scale.intervals.find((i) => i === 10 || i === 11);
    return [third, seventh].filter((x) => x !== undefined).map((i) => (tonic + (i as number)) % 12);
  }, [tonic, scale]);

  const positions = useMemo(() => {
    const rootFret = ((tonic - 4) % 12 + 12) % 12;
    return POS_OFFSETS.map((o) => {
      let s = rootFret + o;
      if (s > 11) s -= 12;
      return [s, s + 4] as [number, number];
    });
  }, [tonic]);

  const listen = () => {
    const root = 48 + tonic;
    const asc = scale.intervals.map((i) => root + i);
    const seq = [...asc, root + 12, ...[...scale.intervals].reverse().map((i) => root + i)];
    audio.playSequence(seq, { gap: 0.24, duration: 0.36 });
  };

  return (
    <div className="w-full max-w-5xl px-4 py-6 md:py-10">
      <h1 className="mb-1 font-headline text-3xl font-bold text-primary md:text-4xl">Escalas</h1>
      <p className="mb-6 font-share-tech text-sm text-secondary">
        {NOTE_NAMES[tonic]} {scale.name}
      </p>

      {/* Controles */}
      <div className="no-print mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block font-label text-[11px] uppercase tracking-widest text-on-surface-variant">Tônica</label>
          <select
            value={tonic}
            onChange={(e) => setTonic(Number(e.target.value))}
            className="w-full cursor-pointer rounded-lg border border-[#2a2a2a] bg-surface-lowest px-3 py-2.5 font-share-tech text-on-surface outline-none focus:border-accent"
          >
            {NOTE_NAMES.map((n, i) => (
              <option key={n} value={i}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block font-label text-[11px] uppercase tracking-widest text-on-surface-variant">Escala</label>
          <select
            value={scaleId}
            onChange={(e) => setScaleId(e.target.value)}
            className="w-full cursor-pointer rounded-lg border border-[#2a2a2a] bg-surface-lowest px-3 py-2.5 font-share-tech text-on-surface outline-none focus:border-accent"
          >
            {SCALES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Toggles + ações */}
      <div className="no-print mb-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-[#2a2a2a] p-1">
          {(["notes", "degrees"] as FretDisplay[]).map((d) => (
            <button
              key={d}
              onClick={() => setDisplay(d)}
              className={`cursor-pointer rounded px-3 py-1.5 font-label text-[11px] uppercase tracking-widest transition-colors ${
                display === d ? "bg-accent/15 text-accent" : "text-on-surface-variant"
              }`}
            >
              {d === "notes" ? "Notas" : "Graus"}
            </button>
          ))}
        </div>
        <button onClick={listen} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 font-label text-[11px] uppercase tracking-widest text-accent">
          <Volume2 className="h-4 w-4" /> Ouvir
        </button>
        <button onClick={() => window.print()} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#333] px-3 py-2 font-label text-[11px] uppercase tracking-widest text-on-surface-variant hover:text-primary">
          <Printer className="h-4 w-4" /> PDF
        </button>
      </div>

      {/* Posições */}
      <div className="no-print mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setPos(-1)}
          className={`cursor-pointer rounded-full border px-3 py-1 font-label text-[11px] uppercase tracking-widest ${pos === -1 ? "border-accent text-accent" : "border-[#2a2a2a] text-on-surface-variant"}`}
        >
          Todas
        </button>
        {positions.map((_, i) => (
          <button
            key={i}
            onClick={() => setPos(i)}
            className={`cursor-pointer rounded-full border px-3 py-1 font-label text-[11px] uppercase tracking-widest ${pos === i ? "border-accent text-accent" : "border-[#2a2a2a] text-on-surface-variant"}`}
          >
            Pos {i + 1}
          </button>
        ))}
      </div>

      {/* Braço */}
      <div className="overflow-x-auto rounded-xl border border-[#2a2a2a] bg-surface-lowest p-4">
        <Fretboard pcs={pcs} tonic={tonic} display={display} secondary={secondary} window={pos === -1 ? null : positions[pos]} />
      </div>

      {/* Info */}
      <div className="no-print mt-6 rounded-xl border border-accent/30 bg-accent/5 p-4">
        <span className="font-label text-[11px] uppercase tracking-widest text-accent">Onde é usada</span>
        <p className="mt-1 font-body text-sm text-on-surface-variant">{USAGE[scaleId]}</p>
      </div>
    </div>
  );
}
