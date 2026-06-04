import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Compass, Download, Mic, Upload } from "lucide-react";
import { useSettings, type Animations, type Density, type Experience, type GuitarType } from "../context/SettingsContext";
import { audio } from "../lib/audio";
import { t } from "../lib/i18n";
import type { Lang } from "../lib/i18n";
import { resetTour } from "../lib/tour";
import SplitHeading from "../components/SplitHeading";

const ACCENTS = [
  { name: "Vermelho", hex: "#ff5555" },
  { name: "Ciano", hex: "#00ffff" },
  { name: "Verde", hex: "#00ff88" },
  { name: "Âmbar", hex: "#ffb347" },
  { name: "Roxo", hex: "#bb86fc" },
  { name: "Branco", hex: "#f0f0f0" },
  { name: "Rosa", hex: "#ff69b4" },
];
const A4S = [432, 440, 442, 444];
const SHORTCUTS = [
  { keys: "Espaço", desc: "Play/pause metrônomo" },
  { keys: "← / →", desc: "Música anterior / próxima (Performance)" },
  { keys: "F", desc: "Tela cheia (Performance)" },
  { keys: "T", desc: "Afinador overlay (Performance)" },
  { keys: "Esc", desc: "Sair do Modo Performance" },
];
const MODULES: { key: string; label: string }[] = [
  { key: "tg.cifras", label: "Cifras" },
  { key: "tg.practice", label: "Diário" },
  { key: "tg.gamify", label: "Conquistas/XP" },
  { key: "tg.ear", label: "Ear training" },
  { key: "tg.progressions", label: "Progressões" },
  { key: "tg.rhythmScores", label: "Ritmos" },
  { key: "tg.favChords", label: "Favoritos" },
  { key: "tg.perfNotes", label: "Notas de palco" },
];
const ALL_KEYS = [...MODULES.map((m) => m.key), "tg.config", "tg.cifraDraft", "tg.bpm", "tg.sidebar", "tg.lastRoute"];

const panel = "rounded-xl border border-[#2a2a2a] bg-surface-lowest p-5";
const label = "font-label text-[11px] uppercase tracking-widest text-on-surface-variant";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section data-reveal className={`${panel} mb-4`}>
      <h2 className="mb-4 font-headline text-lg text-accent">{title}</h2>
      {children}
    </section>
  );
}

export default function ConfigPage() {
  const s = useSettings();
  const navigate = useNavigate();
  const [testing, setTesting] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [confirm, setConfirm] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const raf = useRef<number | undefined>(undefined);

  const dataKb = (() => {
    let bytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("tg.")) bytes += (localStorage.getItem(k)?.length ?? 0) + k.length;
    }
    return (bytes / 1024).toFixed(1);
  })();

  const toggleMicTest = async () => {
    if (testing) {
      stream.current?.getTracks().forEach((tk) => tk.stop());
      if (raf.current) cancelAnimationFrame(raf.current);
      setTesting(false);
      setMicLevel(0);
      return;
    }
    try {
      const st = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = st;
      const ctx = audio.ensure();
      const src = ctx.createMediaStreamSource(st);
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      src.connect(an);
      const data = new Uint8Array(an.frequencyBinCount);
      setTesting(true);
      const tick = () => {
        an.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        setMicLevel(Math.min(1, Math.sqrt(sum / data.length) * 3));
        raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    } catch {
      setTesting(false);
    }
  };

  useEffect(() => () => {
    stream.current?.getTracks().forEach((tk) => tk.stop());
    if (raf.current) cancelAnimationFrame(raf.current);
  }, []);

  const exportAll = () => {
    const dump: Record<string, unknown> = {};
    ALL_KEYS.forEach((k) => {
      const v = localStorage.getItem(k);
      if (v) dump[k] = JSON.parse(v);
    });
    const a = document.createElement("a");
    a.download = "tunaguitar-backup.json";
    a.href = URL.createObjectURL(new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" }));
    a.click();
  };

  const importAll = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as Record<string, unknown>;
        Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
        location.reload();
      } catch {
        /* inválido */
      }
    };
    reader.readAsText(file);
  };

  const resetKey = (k: string) => {
    localStorage.removeItem(k);
    location.reload();
  };
  const resetAll = () => {
    ALL_KEYS.forEach((k) => localStorage.removeItem(k));
    location.reload();
  };

  const lang = s.lang;

  return (
    <div className="w-full max-w-3xl px-4 py-6 md:py-10">
      <SplitHeading text={t(lang, "config.title")} className="mb-6 font-headline text-3xl font-bold text-primary md:text-4xl" />

      {/* Perfil */}
      <Section title={t(lang, "config.profile")}>
        <label className={label}>Nome de exibição</label>
        <input value={s.profile.name} onChange={(e) => s.set("profile", { ...s.profile, name: e.target.value })} placeholder="Seu nome" className="mb-4 mt-1 w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 font-share-tech text-on-surface outline-none focus:border-accent" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Nível</label>
            <select value={s.profile.experience} onChange={(e) => s.set("profile", { ...s.profile, experience: e.target.value as Experience })} className="mt-1 w-full cursor-pointer rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 font-share-tech text-on-surface outline-none">
              <option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediário</option>
              <option value="avancado">Avançado</option>
              <option value="profissional">Profissional</option>
            </select>
          </div>
          <div>
            <label className={label}>Tipo de violão</label>
            <select value={s.profile.guitarType} onChange={(e) => s.set("profile", { ...s.profile, guitarType: e.target.value as GuitarType })} className="mt-1 w-full cursor-pointer rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 font-share-tech text-on-surface outline-none">
              <option value="classico">Clássico</option>
              <option value="folk">Folk</option>
              <option value="eletrico">Elétrico</option>
              <option value="7">7 cordas</option>
              <option value="12">12 cordas</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className={label}>Anos de prática: {s.profile.years}+</label>
          <input type="range" min={0} max={20} value={s.profile.years} onChange={(e) => s.set("profile", { ...s.profile, years: Number(e.target.value) })} className="mt-2" />
        </div>
      </Section>

      {/* Áudio */}
      <Section title={t(lang, "config.audio")}>
        <label className={`${label} mb-2 block`}>Frequência de referência (A4)</label>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {A4S.map((a) => (
            <button key={a} onClick={() => s.setA4(a)} className={`cursor-pointer rounded-lg border px-3 py-2 font-share-tech text-sm ${s.a4 === a ? "border-accent bg-accent/10 text-accent" : "border-[#2a2a2a] text-on-surface"}`}>{a} Hz</button>
          ))}
          <input type="number" value={s.a4} onChange={(e) => s.setA4(Number(e.target.value) || 440)} className="w-24 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 font-share-tech text-sm text-on-surface outline-none" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Latência do mic: {s.micLatency} ms</label>
            <input type="range" min={0} max={200} value={s.micLatency} onChange={(e) => s.set("micLatency", Number(e.target.value))} className="mt-2" />
          </div>
          <div>
            <label className={label}>Sensibilidade: {Math.round(s.sensitivity * 100)}%</label>
            <input type="range" min={0} max={1} step={0.01} value={s.sensitivity} onChange={(e) => s.set("sensitivity", Number(e.target.value))} className="mt-2" />
          </div>
        </div>
        <div className="mt-4">
          <label className={label}>Volume global: {Math.round(s.masterVolume * 100)}%</label>
          <input type="range" min={0} max={1} step={0.01} value={s.masterVolume} onChange={(e) => s.set("masterVolume", Number(e.target.value))} className="mt-2" />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={toggleMicTest} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 font-label text-[11px] uppercase tracking-widest ${testing ? "border-accent text-accent" : "border-[#333] text-on-surface-variant"}`}>
            <Mic className="h-4 w-4" /> {testing ? "Parar teste" : "Testar mic"}
          </button>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#1a1a1a]">
            <div className="h-full rounded-full bg-linear-to-r from-tuned via-secondary to-error transition-[width] duration-75" style={{ width: `${micLevel * 100}%` }} />
          </div>
        </div>
      </Section>

      {/* Aparência */}
      <Section title={t(lang, "config.appearance")}>
        <label className={`${label} mb-2 block`}>Cor de destaque</label>
        <div className="mb-4 flex flex-wrap gap-2">
          {ACCENTS.map((a) => (
            <button key={a.hex} onClick={() => s.set("accent", a.hex)} title={a.name} className={`h-9 w-9 cursor-pointer rounded-full border-2 ${s.accent === a.hex ? "border-white" : "border-transparent"}`} style={{ backgroundColor: a.hex }} />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={`${label} mb-2 block`}>Densidade</label>
            <div className="flex rounded-lg border border-[#2a2a2a] p-1">
              {(["compact", "normal", "spacious"] as Density[]).map((d) => (
                <button key={d} onClick={() => s.set("density", d)} className={`flex-1 cursor-pointer rounded px-2 py-1.5 font-label text-[10px] uppercase ${s.density === d ? "bg-accent/15 text-accent" : "text-on-surface-variant"}`}>{d === "compact" ? "Compacta" : d === "normal" ? "Normal" : "Espaçosa"}</button>
              ))}
            </div>
          </div>
          <div>
            <label className={`${label} mb-2 block`}>Animações</label>
            <div className="flex rounded-lg border border-[#2a2a2a] p-1">
              {(["all", "reduced", "off"] as Animations[]).map((a) => (
                <button key={a} onClick={() => s.set("animations", a)} className={`flex-1 cursor-pointer rounded px-2 py-1.5 font-label text-[10px] uppercase ${s.animations === a ? "bg-accent/15 text-accent" : "text-on-surface-variant"}`}>{a === "all" ? "Todas" : a === "reduced" ? "Reduz." : "Off"}</button>
              ))}
            </div>
          </div>
          <div>
            <label className={`${label} mb-2 block`}>Idioma</label>
            <div className="flex rounded-lg border border-[#2a2a2a] p-1">
              {(["ptBR", "en"] as Lang[]).map((l) => (
                <button key={l} onClick={() => s.set("lang", l)} className={`flex-1 cursor-pointer rounded px-2 py-1.5 font-label text-[10px] uppercase ${s.lang === l ? "bg-accent/15 text-accent" : "text-on-surface-variant"}`}>{l === "ptBR" ? "PT-BR" : "EN"}</button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Dados */}
      <Section title={t(lang, "config.data")}>
        <p className="mb-4 font-share-tech text-sm text-on-surface-variant">Uso de armazenamento: <span className="text-secondary">{dataKb} KB</span></p>
        <div className="mb-4 flex flex-wrap gap-2">
          <button onClick={exportAll} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#333] px-3 py-2 font-label text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary"><Download className="h-4 w-4" /> Backup JSON</button>
          <button onClick={() => fileRef.current?.click()} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#333] px-3 py-2 font-label text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary"><Upload className="h-4 w-4" /> Restaurar</button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importAll(e.target.files[0])} />
        </div>
        <label className={`${label} mb-2 block`}>Limpar por módulo</label>
        <div className="mb-4 flex flex-wrap gap-2">
          {MODULES.map((m) => (
            <button key={m.key} onClick={() => resetKey(m.key)} className="cursor-pointer rounded-lg border border-[#2a2a2a] px-3 py-1.5 font-share-tech text-xs text-on-surface-variant hover:border-error hover:text-error">{m.label}</button>
          ))}
        </div>
        <button onClick={() => setConfirm(1)} className="flex cursor-pointer items-center gap-2 rounded-lg border border-error/50 bg-error/5 px-3 py-2 font-label text-[11px] uppercase tracking-widest text-error">
          <AlertTriangle className="h-4 w-4" /> Apagar tudo
        </button>
      </Section>

      {/* Atalhos */}
      <Section title={t(lang, "config.shortcuts")}>
        <button onClick={() => s.set("shortcutsEnabled", !s.shortcutsEnabled)} className="mb-4 flex w-full cursor-pointer items-center justify-between">
          <span className={label}>Atalhos globais</span>
          <span className={`relative h-6 w-11 rounded-full border border-[#222] ${s.shortcutsEnabled ? "bg-tuned" : "bg-[#0a0a0a]"}`}>
            <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-[left]" style={{ left: s.shortcutsEnabled ? 22 : 2 }} />
          </span>
        </button>
        <div className="flex flex-col gap-1.5">
          {SHORTCUTS.map((k) => (
            <div key={k.keys} className="flex items-center justify-between font-share-tech text-sm">
              <span className="text-on-surface-variant">{k.desc}</span>
              <kbd className="rounded border border-[#333] bg-[#0a0a0a] px-2 py-0.5 text-xs text-accent">{k.keys}</kbd>
            </div>
          ))}
        </div>
      </Section>

      {/* Sobre */}
      <Section title={t(lang, "config.about")}>
        <p className="font-share-tech text-sm text-on-surface-variant">TunaGuitar v2.0 · build 2026-06-04</p>
        <p className="mt-2 font-share-tech text-xs text-tertiary">Web Audio API · Canvas · MediaRecorder · Fullscreen API · SVG · localStorage · React + Vite + Tailwind.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => { resetTour(); navigate("/"); }} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 font-label text-[10px] uppercase tracking-widest text-accent">
            <Compass className="h-4 w-4" /> Refazer tour de boas-vindas
          </button>
          <button onClick={() => window.open("https://github.com", "_blank")} className="cursor-pointer rounded-lg border border-[#333] px-3 py-2 font-label text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary">Verificar atualizações</button>
        </div>
        <p className="mt-3 font-share-tech text-[11px] text-tertiary">Feito para guitarristas · uso pessoal/educacional.</p>
      </Section>

      {/* Modal reset total */}
      {confirm > 0 && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-error/40 bg-pedal-chassis p-6 text-center">
            <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-error" />
            <p className="font-headline text-lg text-on-surface">{confirm === 1 ? "Apagar todos os dados?" : "Tem certeza absoluta?"}</p>
            <p className="mt-1 font-share-tech text-sm text-on-surface-variant">{confirm === 1 ? "Isso remove cifras, diário, conquistas e configurações." : "Esta ação é irreversível."}</p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setConfirm(0)} className="flex-1 cursor-pointer rounded-lg border border-[#333] py-2 font-label text-xs uppercase tracking-widest text-on-surface-variant">Cancelar</button>
              <button onClick={() => (confirm === 1 ? setConfirm(2) : resetAll())} className="flex-1 cursor-pointer rounded-lg bg-error py-2 font-label text-xs uppercase tracking-widest text-[#1a0000]">{confirm === 1 ? "Continuar" : "Apagar tudo"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
