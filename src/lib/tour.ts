import type { DriveStep } from "driver.js";

const DONE_KEY = "tg_tour_done";

export function tourSeen(): boolean {
  return typeof window !== "undefined" && !!localStorage.getItem(DONE_KEY);
}

/** Tour de onboarding (Driver.js). Mira em elementos reais da home (Afinador). */
export async function startTour(force = false) {
  if (typeof window === "undefined") return;
  if (!force && tourSeen()) return;

  const { driver } = await import("driver.js");

  const desktop = window.innerWidth >= 768;
  const navSelector = desktop ? '[data-tour="nav-desktop"]' : '[data-tour="nav-mobile"]';

  const steps: DriveStep[] = [
    {
      element: '[data-tour="tuner"]',
      popover: {
        title: "🎸 Afinador Cromático",
        description: "Comece aqui. Toque INICIAR AFINAÇÃO, libere o microfone e dedilhe qualquer corda — o ponteiro encontra a nota em tempo real.",
        side: "right",
        align: "start",
      },
    },
    {
      element: '[data-tour="strings"]',
      popover: {
        title: "Selecione a corda",
        description: "Escolha a corda antes para um alvo mais preciso e detecção mais rápida.",
        side: "top",
        align: "center",
      },
    },
    {
      element: '[data-tour="power"]',
      popover: {
        title: "Ligar a escuta",
        description: "O pedal liga e desliga o microfone. Tudo roda no seu dispositivo — nada vai para servidores.",
        side: "top",
        align: "center",
      },
    },
    {
      element: navSelector,
      popover: {
        title: "14 ferramentas",
        description: "Metrônomo, acordes, cifrador, treino de ouvido, diário, conquistas e mais — navegue por aqui.",
        side: desktop ? "right" : "top",
        align: "start",
      },
    },
    {
      popover: {
        title: "Tudo pronto 🎸",
        description: "O TunaGuitar é 100% offline. Sem conta, sem anúncios, sem assinatura. Bons treinos!",
        align: "center",
      },
    },
  ];

  const d = driver({
    showProgress: true,
    progressText: "{{current}} de {{total}}",
    animate: true,
    smoothScroll: true,
    allowClose: true,
    overlayOpacity: 0.85,
    stagePadding: 8,
    stageRadius: 12,
    nextBtnText: "Próximo",
    prevBtnText: "Voltar",
    doneBtnText: "Concluir",
    popoverClass: "gt-tour",
    onDestroyStarted: () => {
      localStorage.setItem(DONE_KEY, "1");
      d.destroy();
    },
    steps,
  });
  d.drive();
}

/** Reinicia o tour: limpa o flag para a próxima entrada na home dispará-lo. */
export function resetTour() {
  if (typeof window !== "undefined") localStorage.removeItem(DONE_KEY);
}
