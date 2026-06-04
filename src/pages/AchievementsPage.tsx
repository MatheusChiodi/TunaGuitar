import { useEffect } from "react";
import { BookOpen, Download, Ear, Flame, Guitar, Lock, Mic, Music2, Share2, Trophy, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { useGamify } from "../context/GamifyContext";
import { useSettings } from "../context/SettingsContext";
import { ACHIEVEMENTS, levelFromXp, MISSIONS } from "../lib/gamification";
import { load } from "../lib/storage";

const ICONS: Record<string, LucideIcon> = { guitar: Guitar, flame: Flame, zap: Zap, ear: Ear, book: BookOpen, music: Music2, mic: Mic, trophy: Trophy };

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function last7(): string[] {
  const out: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  }
  return out;
}
function practiceStreak(): number {
  const sessions = load<{ sessions: { date: string }[] }>("tg.practice", { sessions: [] }).sessions;
  const dates = new Set(sessions.map((s) => s.date));
  const cur = new Date();
  const key = () => `${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`;
  if (!dates.has(key())) cur.setDate(cur.getDate() - 1);
  let n = 0;
  while (dates.has(key())) {
    n++;
    cur.setDate(cur.getDate() - 1);
  }
  return n;
}

export default function AchievementsPage() {
  const { state, refresh } = useGamify();
  const { profile } = useSettings();
  const [copied, setCopied] = useState(false);

  useEffect(() => refresh(), [refresh]);

  const lvl = levelFromXp(state.xp);
  const streak = practiceStreak();
  const days = last7();
  const maxXp = Math.max(50, ...days.map((d) => state.xpHistory[d] ?? 0));
  const name = profile.name || "Guitarrista";

  const exportCard = () => {
    const cv = document.createElement("canvas");
    cv.width = 600;
    cv.height = 315;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, 600, 315);
    ctx.fillStyle = "#ff5555";
    ctx.fillRect(0, 0, 600, 6);

    // avatar geométrico a partir do hash do nome
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    ctx.save();
    ctx.translate(80, 110);
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = `hsl(${(h + i * 40) % 360},70%,55%)`;
      ctx.beginPath();
      ctx.arc(0, 0, 44 - i * 6, (i / 6) * Math.PI * 2, (i / 6) * Math.PI * 2 + Math.PI);
      ctx.fill();
    }
    ctx.restore();

    ctx.fillStyle = "#e5e2e1";
    ctx.font = "bold 30px Orbitron, sans-serif";
    ctx.fillText(name, 150, 80);
    ctx.fillStyle = "#ff5555";
    ctx.font = "20px 'Share Tech Mono', monospace";
    ctx.fillText(`Nível ${lvl.level} · ${lvl.title}`, 150, 112);
    ctx.fillStyle = "#aa8986";
    ctx.font = "16px 'Share Tech Mono', monospace";
    ctx.fillText(`${state.xp} XP · ${state.unlocked.length}/${ACHIEVEMENTS.length} conquistas · 🔥 ${streak}d`, 150, 142);

    ctx.fillStyle = "#ffb95a";
    ctx.font = "14px 'Share Tech Mono', monospace";
    ctx.fillText("🎸 TunaGuitar", 150, 285);

    const a = document.createElement("a");
    a.download = "tunaguitar-perfil.png";
    a.href = cv.toDataURL("image/png");
    a.click();
  };

  const copyText = async () => {
    const text = `🎸 ${name} — Nível ${lvl.level} (${lvl.title})\n⭐ ${state.xp} XP · 🏆 ${state.unlocked.length}/${ACHIEVEMENTS.length} conquistas · 🔥 ${streak} dias\nTunaGuitar`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* indisponível */
    }
  };

  return (
    <div className="w-full max-w-3xl px-4 py-6 md:py-10">
      <h1 className="mb-1 font-headline text-3xl font-bold text-primary md:text-4xl">Conquistas</h1>
      <p className="mb-6 font-share-tech text-sm text-secondary">Missões, badges e progresso</p>

      {/* Ranking */}
      <div className="mb-6 rounded-xl border border-accent/30 bg-accent/5 p-5">
        <div className="mb-2 flex items-end justify-between">
          <div>
            <span className="font-orbitron text-3xl text-accent">Nível {lvl.level}</span>
            <span className="ml-2 font-share-tech text-sm text-secondary">{lvl.title}</span>
          </div>
          <span className="font-share-tech text-sm text-on-surface-variant">{state.xp} XP</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#1a1a1a]">
          <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${lvl.frac * 100}%` }} />
        </div>
        {/* XP 7 dias */}
        <div className="mt-4 flex items-end gap-1.5">
          {days.map((d) => (
            <div key={d} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-16 w-full items-end rounded bg-[#1a1a1a]">
                <div className="w-full rounded bg-secondary/70" style={{ height: `${((state.xpHistory[d] ?? 0) / maxXp) * 100}%` }} />
              </div>
              <span className="font-share-tech text-[8px] text-tertiary">{d.slice(8)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Missões diárias */}
      <h2 className="mb-3 font-headline text-xl text-on-surface">Missões diárias</h2>
      <div className="mb-6 flex flex-col gap-2">
        {MISSIONS.map((m) => {
          const count = Math.min(state.daily.counts[m.event] ?? 0, m.target);
          const done = state.daily.awarded.includes(m.id);
          return (
            <div key={m.id} className="rounded-lg border border-[#2a2a2a] bg-surface-lowest p-3">
              <div className="mb-1.5 flex items-center justify-between font-share-tech text-sm">
                <span className={done ? "text-tuned" : "text-on-surface"}>{m.label}</span>
                <span className="text-secondary">+{m.xp} XP</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#1a1a1a]">
                <div className={`h-full rounded-full ${done ? "bg-tuned" : "bg-accent"}`} style={{ width: `${(count / m.target) * 100}%` }} />
              </div>
              <span className="mt-1 block font-share-tech text-[10px] text-tertiary">{count}/{m.target}</span>
            </div>
          );
        })}
      </div>

      {/* Badges */}
      <h2 className="mb-3 font-headline text-xl text-on-surface">Conquistas</h2>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACHIEVEMENTS.map((a) => {
          const Icon = ICONS[a.icon] ?? Trophy;
          const unlocked = state.unlocked.includes(a.id);
          return (
            <div key={a.id} className={`relative flex flex-col items-center rounded-xl border p-4 text-center ${unlocked ? "border-accent/40 bg-accent/5" : "border-[#222] bg-surface-lowest"}`}>
              <Icon className={`mb-2 h-8 w-8 ${unlocked ? "text-accent" : "text-[#444]"}`} />
              <span className={`font-headline text-xs ${unlocked ? "text-on-surface" : "text-on-surface-variant"}`}>{a.name}</span>
              <span className="mt-1 font-share-tech text-[9px] text-tertiary">{a.desc}</span>
              {!unlocked && <Lock className="absolute right-2 top-2 h-3.5 w-3.5 text-[#444]" />}
            </div>
          );
        })}
      </div>

      {/* Card de perfil */}
      <div className="flex flex-wrap gap-2">
        <button onClick={exportCard} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 font-label text-[11px] uppercase tracking-widest text-accent">
          <Download className="h-4 w-4" /> Card de perfil (PNG)
        </button>
        <button onClick={copyText} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#333] px-3 py-2 font-label text-[11px] uppercase tracking-widest text-on-surface-variant hover:text-primary">
          <Share2 className="h-4 w-4" /> {copied ? "Copiado!" : "Copiar texto"}
        </button>
      </div>
    </div>
  );
}
