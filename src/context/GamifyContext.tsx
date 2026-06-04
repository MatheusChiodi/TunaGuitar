import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { applyEvent, ACHIEVEMENTS, EMPTY_GAMIFY, MISSIONS, type GamifyState } from "../lib/gamification";
import { load, save } from "../lib/storage";
import { toast } from "../lib/toast";

interface GamifyCtx {
  state: GamifyState;
  track: (event: string, amount?: number) => void;
  refresh: () => void;
}

const Ctx = createContext<GamifyCtx | null>(null);

export function GamifyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GamifyState>(() => ({ ...EMPTY_GAMIFY, ...load("tg.gamify", EMPTY_GAMIFY) }));
  const ref = useRef(state);
  ref.current = state;

  const track = useCallback((event: string, amount = 1) => {
    const prev = ref.current;
    const next = applyEvent(prev, event, amount);

    // Feedback (Notyf) para desbloqueios novos — calculado fora do setState para não duplicar no StrictMode.
    next.unlocked
      .filter((id) => !prev.unlocked.includes(id))
      .forEach((id) => {
        const a = ACHIEVEMENTS.find((x) => x.id === id);
        if (a) toast.achievement(`🏆 Conquista desbloqueada: ${a.name}`);
      });
    next.daily.awarded
      .filter((id) => !prev.daily.awarded.includes(id))
      .forEach((id) => {
        const m = MISSIONS.find((x) => x.id === id);
        if (m) toast.info(`✅ Missão concluída: ${m.label} (+${m.xp} XP)`);
      });

    ref.current = next;
    setState(next);
    save("tg.gamify", next);
  }, []);

  const refresh = useCallback(() => track("noop", 0), [track]);

  return <Ctx.Provider value={{ state, track, refresh }}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGamify(): GamifyCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useGamify deve ser usado dentro de GamifyProvider");
  return ctx;
}
