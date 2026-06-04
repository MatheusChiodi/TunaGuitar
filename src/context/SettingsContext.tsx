import { createContext, useContext, useState, type ReactNode } from "react";

interface SettingsState {
  a4: number;
  setA4: (v: number) => void;
  tolerance: number; // cents para considerar "afinado"
  setTolerance: (v: number) => void;
  tuningId: string;
  setTuningId: (v: string) => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

const SettingsContext = createContext<SettingsState | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [a4, setA4] = useState(440);
  const [tolerance, setTolerance] = useState(5);
  const [tuningId, setTuningId] = useState("standard");
  const [isSettingsOpen, setOpen] = useState(false);

  return (
    <SettingsContext.Provider
      value={{
        a4,
        setA4,
        tolerance,
        setTolerance,
        tuningId,
        setTuningId,
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
