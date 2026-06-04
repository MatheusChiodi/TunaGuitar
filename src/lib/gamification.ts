import { load } from "./storage";

export interface GamifyState {
  xp: number;
  unlocked: string[];
  counters: Record<string, number>;
  daily: { date: string; counts: Record<string, number>; awarded: string[] };
  xpHistory: Record<string, number>;
}

const pad = (n: number) => String(n).padStart(2, "0");
export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const EMPTY_GAMIFY: GamifyState = {
  xp: 0,
  unlocked: [],
  counters: {},
  daily: { date: todayKey(), counts: {}, awarded: [] },
  xpHistory: {},
};

export interface Mission {
  id: string;
  event: string;
  target: number;
  xp: number;
  label: string;
}

export const MISSIONS: Mission[] = [
  { id: "tune", event: "tune", target: 1, xp: 50, label: "Afine o violão 1 vez hoje" },
  { id: "practice", event: "practiceMin", target: 20, xp: 100, label: "Pratique por 20 minutos" },
  { id: "ear", event: "earCorrect", target: 10, xp: 150, label: "Complete 10 exercícios de ouvido" },
  { id: "chords", event: "chordLearn", target: 3, xp: 80, label: "Aprenda 3 acordes novos" },
  { id: "diary", event: "diaryLog", target: 1, xp: 60, label: "Registre uma sessão no Diário" },
];

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

function cifrasCount(): number {
  return load<unknown[]>("tg.cifras", []).length;
}

export interface Achievement {
  id: string;
  icon: string;
  name: string;
  desc: string;
  check: (s: GamifyState) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "firstTune", icon: "guitar", name: "Primeira Afinação", desc: "Usou o afinador pela 1ª vez", check: (s) => (s.counters.tune ?? 0) >= 1 },
  { id: "onFire", icon: "flame", name: "Em Chamas", desc: "7 dias de streak no Diário", check: () => practiceStreak() >= 7 },
  { id: "speedster", icon: "zap", name: "Velocista", desc: "Metrônomo acima de 180 BPM", check: (s) => (s.counters.fastBpm ?? 0) >= 1 },
  { id: "goldenEar", icon: "ear", name: "Ouvido de Ouro", desc: "10 acertos seguidos no ear training", check: (s) => (s.counters.earStreak10 ?? 0) >= 1 },
  { id: "theorist", icon: "book", name: "Teórico", desc: "Leu todos os cards de Teoria", check: (s) => (s.counters.theoryComplete ?? 0) >= 1 },
  { id: "composer", icon: "music", name: "Compositor", desc: "Salvou 5 cifras", check: () => cifrasCount() >= 5 },
  { id: "showman", icon: "mic", name: "Showman", desc: "Usou o Modo Performance", check: (s) => (s.counters.performance ?? 0) >= 1 },
  { id: "master", icon: "trophy", name: "Mestre", desc: "Desbloqueou todas as outras conquistas", check: () => false },
];

const TITLES = [
  { min: 1, name: "Aprendiz" },
  { min: 11, name: "Músico" },
  { min: 21, name: "Guitarrista" },
  { min: 31, name: "Virtuoso" },
  { min: 41, name: "Lendário" },
];

const threshold = (level: number) => Math.round(100 * ((level - 1) * level) / 2);

export function levelFromXp(xp: number) {
  let level = 1;
  while (level < 50 && threshold(level + 1) <= xp) level++;
  const base = threshold(level);
  const next = level < 50 ? threshold(level + 1) : base;
  const need = next - base;
  const into = xp - base;
  const title = [...TITLES].reverse().find((t) => level >= t.min)?.name ?? "Aprendiz";
  return { level, title, into, need: need || 1, frac: need ? Math.min(1, into / need) : 1, atMax: level >= 50 };
}

/** Aplica um evento de forma pura, retornando o novo estado. */
export function applyEvent(prev: GamifyState, event: string, amount = 1): GamifyState {
  const today = todayKey();
  const s: GamifyState = {
    xp: prev.xp,
    unlocked: [...prev.unlocked],
    counters: { ...prev.counters },
    daily: prev.daily.date === today ? { ...prev.daily, counts: { ...prev.daily.counts }, awarded: [...prev.daily.awarded] } : { date: today, counts: {}, awarded: [] },
    xpHistory: { ...prev.xpHistory },
  };

  const addXp = (n: number) => {
    s.xp += n;
    s.xpHistory[today] = (s.xpHistory[today] ?? 0) + n;
  };

  if (amount !== 0 && event !== "noop") {
    s.counters[event] = (s.counters[event] ?? 0) + amount;
    s.daily.counts[event] = (s.daily.counts[event] ?? 0) + amount;
  }

  for (const m of MISSIONS) {
    if ((s.daily.counts[m.event] ?? 0) >= m.target && !s.daily.awarded.includes(m.id)) {
      s.daily.awarded.push(m.id);
      addXp(m.xp);
    }
  }

  for (const a of ACHIEVEMENTS) {
    if (a.id === "master") continue;
    if (!s.unlocked.includes(a.id) && a.check(s)) {
      s.unlocked.push(a.id);
      addXp(25);
    }
  }
  const others = ACHIEVEMENTS.filter((a) => a.id !== "master");
  if (!s.unlocked.includes("master") && others.every((a) => s.unlocked.includes(a.id))) {
    s.unlocked.push("master");
    addXp(100);
  }

  return s;
}
