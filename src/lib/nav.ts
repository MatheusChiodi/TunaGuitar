import type { LucideIcon } from "lucide-react";
import { ArrowRightLeft, AudioLines, CalendarDays, Ear, GraduationCap, Guitar, Music2, Timer } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const NAV: NavItem[] = [
  { to: "/", label: "Afinador", icon: AudioLines, end: true },
  { to: "/metronomo", label: "Metrônomo", icon: Timer },
  { to: "/acordes", label: "Acordes", icon: Music2 },
  { to: "/ouvido", label: "Ouvido", icon: Ear },
  { to: "/escalas", label: "Escalas", icon: Guitar },
  { to: "/capotraste", label: "Capotraste", icon: ArrowRightLeft },
  { to: "/diario", label: "Diário", icon: CalendarDays },
  { to: "/teoria", label: "Teoria", icon: GraduationCap },
];
