export type Lang = "ptBR" | "en";

type Dict = Record<string, { ptBR: string; en: string }>;

export const STRINGS: Dict = {
  "nav.tuner": { ptBR: "Afinador", en: "Tuner" },
  "nav.metronome": { ptBR: "Metrônomo", en: "Metronome" },
  "nav.chords": { ptBR: "Acordes", en: "Chords" },
  "nav.ear": { ptBR: "Ouvido", en: "Ear" },
  "nav.scales": { ptBR: "Escalas", en: "Scales" },
  "nav.capo": { ptBR: "Capotraste", en: "Capo" },
  "nav.diary": { ptBR: "Diário", en: "Diary" },
  "nav.theory": { ptBR: "Teoria", en: "Theory" },
  "nav.cifras": { ptBR: "Cifrador", en: "Chart Editor" },
  "nav.loop": { ptBR: "Loop", en: "Loop" },
  "nav.progression": { ptBR: "Progressões", en: "Progressions" },
  "nav.rhythm": { ptBR: "Ritmos", en: "Rhythms" },
  "nav.achievements": { ptBR: "Conquistas", en: "Achievements" },
  "nav.performance": { ptBR: "Performance", en: "Performance" },
  "nav.config": { ptBR: "Config", en: "Settings" },
  "config.title": { ptBR: "Configurações", en: "Settings" },
  "config.profile": { ptBR: "Perfil", en: "Profile" },
  "config.audio": { ptBR: "Áudio", en: "Audio" },
  "config.appearance": { ptBR: "Aparência", en: "Appearance" },
  "config.data": { ptBR: "Dados e Privacidade", en: "Data & Privacy" },
  "config.shortcuts": { ptBR: "Atalhos de Teclado", en: "Keyboard Shortcuts" },
  "config.about": { ptBR: "Sobre", en: "About" },
  "common.save": { ptBR: "Salvar", en: "Save" },
  "common.cancel": { ptBR: "Cancelar", en: "Cancel" },
  "common.listen": { ptBR: "Ouvir", en: "Listen" },
};

export function t(lang: Lang, key: string): string {
  return STRINGS[key]?.[lang] ?? STRINGS[key]?.ptBR ?? key;
}
