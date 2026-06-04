import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { applyEvent, EMPTY_GAMIFY, type GamifyState } from "../lib/gamification";
import { load, save } from "../lib/storage";

interface GamifyCtx {
  state: GamifyState;
  track: (event: string, amount?: number) => void;
  refresh: () => void;
}

const Ctx = createContext<GamifyCtx | null>(null);

export function GamifyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GamifyState>(() => ({ ...EMPTY_GAMIFY, ...load("tg.gamify", EMPTY_GAMIFY) }));

  const track = useCallback((event: string, amount = 1) => {
    setState((prev) => {
      const next = applyEvent(prev, event, amount);
      save("tg.gamify", next);
      return next;
    });
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
