import { Notyf } from "notyf";

export type ToastType = "tuned" | "achievement" | "info" | "warning";

let inst: Notyf | null = null;

function notyf(): Notyf {
  if (inst) return inst;
  inst = new Notyf({
    duration: 3500,
    position: { x: "right", y: "bottom" },
    ripple: false,
    dismissible: true,
    types: [
      { type: "tuned", background: "linear-gradient(135deg, #0e2a1c 0%, #162e1e 100%)", icon: false, className: "notyf-tuned" },
      { type: "achievement", background: "linear-gradient(135deg, #1e100a 0%, #2a160e 100%)", icon: false, className: "notyf-achievement" },
      { type: "info", background: "linear-gradient(135deg, #0e1a2a 0%, #101e30 100%)", icon: false, className: "notyf-info" },
      { type: "warning", background: "linear-gradient(135deg, #2a1e08 0%, #30220a 100%)", icon: false, className: "notyf-warning" },
    ],
  });
  return inst;
}

let last = "";
function open(type: ToastType, message: string) {
  if (typeof window === "undefined") return;
  // Evita repetir o mesmo toast em sequência (ex.: agulha entrando/saindo do verde).
  const sig = `${type}:${message}`;
  if (sig === last) return;
  last = sig;
  window.setTimeout(() => {
    if (last === sig) last = "";
  }, 1500);
  notyf().open({ type, message });
}

export const toast = {
  tuned: (m: string) => open("tuned", m),
  achievement: (m: string) => open("achievement", m),
  info: (m: string) => open("info", m),
  warning: (m: string) => open("warning", m),
};
