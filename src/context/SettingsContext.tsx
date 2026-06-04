import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { audio } from "../lib/audio";
import type { Lang } from "../lib/i18n";
import { load, save } from "../lib/storage";

export type Density = "compact" | "normal" | "spacious";
export type Animations = "all" | "reduced" | "off";
export type GuitarType = "classico" | "folk" | "eletrico" | "7" | "12";
export type Experience = "iniciante" | "intermediario" | "avancado" | "profissional";

export interface Profile {
  name: string;
  experience: Experience;
  guitarType: GuitarType;
  years: number;
}

export interface AppConfig {
  a4: number;
  tolerance: number;
  tuningId: string;
  accent: string;
  density: Density;
  animations: Animations;
  lang: Lang;
  masterVolume: number;
  micLatency: number;
  sensitivity: number;
  shortcutsEnabled: boolean;
  profile: Profile;
}

const DEFAULT: AppConfig = {
  a4: 440,
  tolerance: 5,
  tuningId: "standard",
  accent: "#ff5555",
  density: "normal",
  animations: "all",
  lang: "ptBR",
  masterVolume: 0.9,
  micLatency: 0,
  sensitivity: 0.5,
  shortcutsEnabled: true,
  profile: { name: "", experience: "iniciante", guitarType: "folk", years: 1 },
};

interface SettingsState extends AppConfig {
  set: <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => void;
  setA4: (v: number) => void;
  setTolerance: (v: number) => void;
  setTuningId: (v: string) => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

const SettingsContext = createContext<SettingsState | null>(null);

const DENSITY_FONT: Record<Density, string> = { compact: "14px", normal: "16px", spacious: "18px" };

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [cfg, setCfg] = useState<AppConfig>(() => ({ ...DEFAULT, ...load("tg.config", {}), profile: { ...DEFAULT.profile, ...load<Partial<AppConfig>>("tg.config", {}).profile } }));
  const [isSettingsOpen, setOpen] = useState(false);

  const set = <K extends keyof AppConfig>(key: K, value: AppConfig[K]) =>
    setCfg((c) => {
      const next = { ...c, [key]: value };
      save("tg.config", next);
      return next;
    });

  // Aplica tema/densidade/volume/animações globalmente.
  useEffect(() => {
    document.documentElement.style.setProperty("--color-accent", cfg.accent);
  }, [cfg.accent]);
  useEffect(() => {
    document.documentElement.style.fontSize = DENSITY_FONT[cfg.density];
  }, [cfg.density]);
  useEffect(() => {
    audio.setMasterVolume(cfg.masterVolume);
  }, [cfg.masterVolume]);
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-anim", cfg.animations !== "all");
  }, [cfg.animations]);

  return (
    <SettingsContext.Provider
      value={{
        ...cfg,
        set,
        setA4: (v) => set("a4", v),
        setTolerance: (v) => set("tolerance", v),
        setTuningId: (v) => set("tuningId", v),
        isSettingsOpen,
        openSettings: () => setOpen(true),
        closeSettings: () => setOpen(false),
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsState {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings deve ser usado dentro de SettingsProvider");
  return ctx;
}
