import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { AlertTriangle, ArrowDown, ArrowUp, Check, Music } from "lucide-react";
import TunerDisplay from "../components/TunerDisplay";
import StringSelector from "../components/StringSelector";
import Controls from "../components/Controls";
import { usePitchDetection } from "../hooks/usePitchDetection";
import { centsOff, getTuning, midiFromFrequency, nearestStringIndex, noteFromMidi, type TuneStatus } from "../lib/pitch";
import { useSettings } from "../context/SettingsContext";
import { useGamify } from "../context/GamifyContext";

const pedalVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};
const block: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 240, damping: 22 } },
};

function StatusBar({ status, error }: { status: TuneStatus; error: string | null }) {
  if (error) {
    return (
      <div className="mt-4 flex w-full items-center justify-center gap-2 rounded border border-error/40 bg-[#2a0a0a] px-4 py-2 font-share-tech text-sm text-error">
        <AlertTriangle className="h-4 w-4" /> {error}
      </div>
    );
  }
  return (
    <div className="mt-4 flex w-full items-center justify-between rounded border border-[#222] bg-[#050505] px-4 py-2 font-share-tech text-base shadow-inner">
      <span className={`flex items-center gap-1 text-error transition-opacity ${status === "flat" ? "opacity-100" : "opacity-30"}`}>
        <ArrowUp className="h-4 w-4" /> APERTE
      </span>
      <span
        className={`flex items-center gap-1 font-bold text-tuned transition-all ${
          status === "tuned" ? "opacity-100 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]" : "opacity-30"
        }`}
      >
        <Check className="h-4 w-4" /> AFINADO
      </span>
      <span className={`flex items-center gap-1 text-error transition-opacity ${status === "sharp" ? "opacity-100" : "opacity-30"}`}>
        SOLTE <ArrowDown className="h-4 w-4" />
      </span>
    </div>
  );
}

export default function TunerPage() {
  const { a4, setA4, tolerance, tuningId } = useSettings();
  const { track } = useGamify();
  const { frequency, isListening, error, start, stop } = usePitchDetection();
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [selected, setSelected] = useState(0);

  const strings = getTuning(tuningId).strings;
  const active = isListening && frequency != null;

  const stringIndex = active && mode === "auto" ? nearestStringIndex(frequency, strings, a4) : selected;
  const targetMidi = mode === "auto" && active ? midiFromFrequency(frequency, a4) : strings[selected].midi;
  const targetNote = noteFromMidi(targetMidi);
  const cents = active ? centsOff(frequency, targetMidi, a4) : 0;
  const status: TuneStatus = !active
    ? "idle"
    : Math.abs(cents) <= tolerance
      ? "tuned"
      : cents < 0
        ? "flat"
        : "sharp";

  useEffect(() => {
    if (mode === "auto" && active) {
      const i = nearestStringIndex(frequency, strings, a4);
      setSelected((p) => (p === i ? p : i));
    }
  }, [mode, active, frequency, a4, strings]);

  const handleSelectString = (i: number) => {
    setMode("manual");
    setSelected(i);
  };

  return (
    <motion.div
      variants={pedalVariants}
      initial="hidden"
      animate="show"
      className="relative flex w-full flex-1 cursor-default touch-manipulation select-none flex-col overflow-hidden border-y border-x-0 border-[#333] bg-pedal-chassis shadow-2xl md:mb-8 md:mt-2 md:max-w-120 md:flex-none md:rounded-xl md:border-2"
    >
      <div className="bg-brushed-metal pointer-events-none absolute inset-0 opacity-30" />
      <div className="absolute left-0 top-0 h-1 w-full bg-white opacity-10" />
      <div className="absolute bottom-0 left-0 h-1 w-full bg-black opacity-60" />

      <motion.header variants={block} className="relative z-10 flex items-center justify-between p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#222] bg-linear-to-br from-[#444] to-[#111] shadow-inner">
            <Music className="h-4 w-4 text-on-surface" />
          </div>
          <h1 className="font-headline text-lg uppercase tracking-widest text-on-surface">Afinador Pro</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-label text-[11px] tracking-widest text-on-surface-variant">
            {isListening ? "MIC ATIVO" : "MIC OFF"}
          </span>
          <span className={`h-3 w-3 rounded-full border border-[#111] ${isListening ? "led-pulse bg-led-red" : "bg-[#3a0000]"}`} />
        </div>
      </motion.header>

      <motion.section variants={block} className="relative z-10 flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
        <TunerDisplay
          note={targetNote.note}
          octave={targetNote.octave}
          freq={frequency ?? 0}
          cents={cents}
          status={status}
          active={active}
        />
        <StatusBar status={status} error={error} />
        <StringSelector strings={strings} selected={stringIndex} onSelect={handleSelectString} />
      </motion.section>

      <motion.div variants={block}>
        <Controls
          a4={a4}
          onA4Change={setA4}
          mode={mode}
          onModeChange={setMode}
          listening={isListening}
          onToggle={() => {
            if (isListening) stop();
            else {
              void start();
              track("tune");
            }
          }}
        />
      </motion.div>
    </motion.div>
  );
}
