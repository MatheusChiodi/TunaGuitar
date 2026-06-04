import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Minus, Play, Plus, Square } from "lucide-react";
import { SUBDIVISIONS, TIME_SIGNATURES, tempoName, useMetronome } from "../hooks/useMetronome";
import type { ClickType } from "../lib/audio";
import { useGamify } from "../context/GamifyContext";
import SplitHeading from "../components/SplitHeading";
import Tip from "../components/Tip";
import Magnetic from "../components/Magnetic";

const CLICKS: { id: ClickType; name: string }[] = [
  { id: "wood", name: "Madeira" },
  { id: "electronic", name: "Eletrônico" },
  { id: "metallic", name: "Metálico" },
];

const panel = "rounded-xl border border-[#2a2a2a] bg-surface-lowest p-4";
const label = "font-label text-[11px] uppercase tracking-widest text-on-surface-variant";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-lg border px-3 py-2 font-share-tech text-sm transition-colors ${
        active ? "border-accent bg-accent/10 text-accent" : "border-[#2a2a2a] bg-[#0a0a0a] text-on-surface hover:border-[#444]"
      }`}
    >
      {children}
    </button>
  );
}

export default function MetronomePage() {
  const m = useMetronome();
  const { track } = useGamify();
  const [editing, setEditing] = useState(false);
  const secondsPerBeat = 60 / m.bpm;

  useEffect(() => {
    if (m.isPlaying && m.bpm > 180) track("fastBpm");
  }, [m.isPlaying, m.bpm, track]);

  return (
    <div className="w-full max-w-2xl px-4 py-6 md:py-10">
      <SplitHeading text="Metrônomo" className="mb-1 font-headline text-3xl font-bold text-primary md:text-4xl" />
      <p className="mb-6 font-share-tech text-sm text-secondary">{tempoName(m.bpm)} · {m.timeSig}</p>

      {/* Visual */}
      <div className={`${panel} flex flex-col items-center gap-6 py-8`}>
        {/* Pêndulo */}
        <div className="relative h-28 w-40">
          <div className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#444]" />
          <motion.div
            className="absolute bottom-1.5 left-1/2 h-24 w-1 origin-bottom -translate-x-1/2 rounded-full bg-needle-amber"
            animate={{ rotate: m.isPlaying ? (m.side ? 26 : -26) : 0 }}
            transition={{ duration: m.isPlaying ? secondsPerBeat : 0.3, ease: "easeInOut" }}
          >
            <div className="absolute left-1/2 top-3 h-4 w-4 -translate-x-1/2 rounded-full bg-needle-amber shadow-[0_0_8px_rgba(255,179,71,0.8)]" />
          </motion.div>
        </div>

        {/* BPM */}
        <div className="flex items-center gap-4">
          <button onClick={() => m.setBpm(Math.max(20, m.bpm - 1))} className="cursor-pointer rounded-full border border-[#333] p-2 text-on-surface-variant hover:text-primary">
            <Minus className="h-5 w-5" />
          </button>
          {editing ? (
            <input
              type="number"
              autoFocus
              defaultValue={m.bpm}
              min={20}
              max={300}
              onBlur={(e) => {
                m.setBpm(Math.max(20, Math.min(300, Number(e.target.value) || m.bpm)));
                setEditing(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              className="w-40 bg-transparent text-center font-orbitron text-6xl text-accent outline-none"
            />
          ) : (
            <Tip content="Duplo clique para editar">
              <span
                onDoubleClick={() => setEditing(true)}
                className="cursor-text select-none font-orbitron text-7xl leading-none text-accent"
              >
                {m.bpm}
              </span>
            </Tip>
          )}
          <button onClick={() => m.setBpm(Math.min(300, m.bpm + 1))} className="cursor-pointer rounded-full border border-[#333] p-2 text-on-surface-variant hover:text-primary">
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <span className={label}>BPM</span>

        {/* Beats + subdivisões */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-2">
            {Array.from({ length: m.beats }, (_, i) => {
              const active = m.isPlaying && i === m.visBeat;
              const accent = i === 0;
              return (
                <motion.div
                  key={i}
                  animate={{ scale: active ? 1.35 : 1 }}
                  transition={{ type: "spring", stiffness: 600, damping: 20 }}
                  className={`h-4 w-4 rounded-full border ${
                    active
                      ? accent
                        ? "border-accent bg-accent shadow-[0_0_14px_#ff5555]"
                        : "border-secondary bg-secondary shadow-[0_0_12px_rgba(255,185,90,0.8)]"
                      : "border-[#333] bg-[#1a1a1a]"
                  }`}
                />
              );
            })}
          </div>
          {m.subdivision > 1 && (
            <div className="flex gap-1.5">
              {Array.from({ length: m.subdivision }, (_, i) => (
                <div key={i} className={`h-2 w-2 rounded-full ${m.isPlaying && i === m.visSub ? "bg-accent" : "bg-[#2a2a2a]"}`} />
              ))}
            </div>
          )}
        </div>

        {/* Play/Stop */}
        <Magnetic strength={0.2}>
          <motion.button
            onClick={m.toggle}
            whileTap={{ scale: 0.92 }}
            className={`flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-4 transition-colors ${
              m.isPlaying ? "border-accent bg-accent/20 text-accent" : "border-[#333] bg-[radial-gradient(circle,#333,#1a1a1a)] text-on-surface"
            }`}
          >
            {m.isPlaying ? <Square className="h-7 w-7 fill-current" /> : <Play className="ml-1 h-8 w-8 fill-current" />}
          </motion.button>
        </Magnetic>
      </div>

      {/* Controles */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className={panel}>
          <div className="mb-2 flex items-center justify-between">
            <span className={label}>Tempo</span>
            <Tip content="Toque 4 vezes no ritmo para calcular o BPM">
              <button onClick={m.tap} className="cursor-pointer rounded-lg border border-accent/50 bg-accent/10 px-3 py-1 font-label text-xs uppercase tracking-widest text-accent">
                Tap
              </button>
            </Tip>
          </div>
          <input type="range" min={20} max={300} value={m.bpm} onChange={(e) => m.setBpm(Number(e.target.value))} />
        </div>

        <div className={panel}>
          <span className={label}>Volume</span>
          <input type="range" min={0} max={1} step={0.01} value={m.volume} onChange={(e) => m.setVolume(Number(e.target.value))} className="mt-3" />
        </div>

        <div className={panel}>
          <span className={`${label} mb-2 block`}>Compasso</span>
          <div className="flex flex-wrap gap-2">
            {TIME_SIGNATURES.map((t) => (
              <Chip key={t.id} active={m.timeSig === t.id} onClick={() => m.setTimeSig(t.id)}>
                {t.id}
              </Chip>
            ))}
          </div>
        </div>

        <div className={panel}>
          <span className={`${label} mb-2 block`}>Subdivisão</span>
          <div className="flex flex-wrap gap-2">
            {SUBDIVISIONS.map((s) => (
              <Chip key={s.id} active={m.subdivision === s.id} onClick={() => m.setSubdivision(s.id)}>
                {s.name}
              </Chip>
            ))}
          </div>
        </div>

        <div className={panel}>
          <span className={`${label} mb-2 block`}>Som do click</span>
          <div className="flex flex-wrap gap-2">
            {CLICKS.map((c) => (
              <Chip key={c.id} active={m.clickType === c.id} onClick={() => m.setClickType(c.id)}>
                {c.name}
              </Chip>
            ))}
          </div>
        </div>

        <div className={panel}>
          <button
            onClick={() => m.setAccentFirst(!m.accentFirst)}
            className="flex w-full cursor-pointer items-center justify-between"
          >
            <span className={label}>Acento no 1º tempo</span>
            <span className={`relative h-6 w-11 rounded-full border border-[#222] transition-colors ${m.accentFirst ? "bg-accent" : "bg-[#0a0a0a]"}`}>
              <motion.span layout className="absolute top-0.5 h-5 w-5 rounded-full bg-white" animate={{ x: m.accentFirst ? 22 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 32 }} />
            </span>
          </button>
        </div>
      </div>

      {/* Modo treino */}
      <div className={`${panel} mt-4`}>
        <button
          onClick={() => m.setTraining({ ...m.training, enabled: !m.training.enabled })}
          className="flex w-full cursor-pointer items-center justify-between"
        >
          <div>
            <span className={label}>Modo treino</span>
            <p className="mt-0.5 font-share-tech text-xs text-tertiary">Acelera o BPM automaticamente</p>
          </div>
          <span className={`relative h-6 w-11 rounded-full border border-[#222] transition-colors ${m.training.enabled ? "bg-tuned" : "bg-[#0a0a0a]"}`}>
            <motion.span layout className="absolute top-0.5 h-5 w-5 rounded-full bg-white" animate={{ x: m.training.enabled ? 22 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 32 }} />
          </span>
        </button>
        {m.training.enabled && (
          <div className="mt-4 flex flex-wrap items-center gap-3 font-share-tech text-sm text-on-surface">
            <span>+</span>
            <input
              type="number"
              min={1}
              max={20}
              value={m.training.inc}
              onChange={(e) => m.setTraining({ ...m.training, inc: Math.max(1, Number(e.target.value) || 1) })}
              className="w-16 rounded border border-[#333] bg-[#0a0a0a] px-2 py-1 text-center outline-none"
            />
            <span>BPM a cada</span>
            <input
              type="number"
              min={1}
              max={32}
              value={m.training.every}
              onChange={(e) => m.setTraining({ ...m.training, every: Math.max(1, Number(e.target.value) || 1) })}
              className="w-16 rounded border border-[#333] bg-[#0a0a0a] px-2 py-1 text-center outline-none"
            />
            <span>compassos</span>
          </div>
        )}
      </div>
    </div>
  );
}
