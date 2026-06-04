/** Movimento habilitado? Reflete o gate global `reduce-anim` (Configurações → Animações). */
export const animOn = (): boolean =>
  typeof document !== "undefined" && !document.documentElement.classList.contains("reduce-anim");

/** Usuário pediu menos movimento no SO. */
export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Movimento permitido considerando preferências do app e do SO. */
export const motionAllowed = (): boolean => animOn() && !prefersReducedMotion();
