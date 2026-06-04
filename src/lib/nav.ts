import type { LucideIcon } from "lucide-react";
import {
  ArrowRightLeft,
  AudioLines,
  CalendarDays,
  Drum,
  Ear,
  FileMusic,
  GitBranch,
  GraduationCap,
  Guitar,
  Music2,
  Repeat,
  SlidersHorizontal,
  Timer,
  Trophy,
  Tv,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  key: string;
  icon: LucideIcon;
  end?: boolean;
}

export const NAV: NavItem[] = [
  { to: "/", label: "Afinador", key: "nav.tuner", icon: AudioLines, end: true },
  { to: "/metronomo", label: "Metrônomo", key: "nav.metronome", icon: Timer },
  { to: "/acordes", label: "Acordes", key: "nav.chords", icon: Music2 },
  { to: "/cifrador", label: "Cifrador", key: "nav.cifras", icon: FileMusic },
  { to: "/progressoes", label: "Progressões", key: "nav.progression", icon: GitBranch },
  { to: "/ritmos", label: "Ritmos", key: "nav.rhythm", icon: Drum },
  { to: "/ouvido", label: "Ouvido", key: "nav.ear", icon: Ear },
  { to: "/escalas", label: "Escalas", key: "nav.scales", icon: Guitar },
  { to: "/capotraste", label: "Capotraste", key: "nav.capo", icon: ArrowRightLeft },
  { to: "/loop", label: "Loop", key: "nav.loop", icon: Repeat },
  { to: "/diario", label: "Diário", key: "nav.diary", icon: CalendarDays },
  { to: "/conquistas", label: "Conquistas", key: "nav.achievements", icon: Trophy },
  { to: "/teoria", label: "Teoria", key: "nav.theory", icon: GraduationCap },
  { to: "/performance", label: "Performance", key: "nav.performance", icon: Tv },
  { to: "/config", label: "Config", key: "nav.config", icon: SlidersHorizontal },
];
