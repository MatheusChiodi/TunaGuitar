import { useEffect, useState } from "react";

/** Retorna `value` com atraso — evita recalcular filtros a cada tecla (BP-09). */
export function useDebouncedValue<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
