import { ParticlesProvider, Particles } from "@tsparticles/react";
import type { Engine, ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { loadTextShape } from "@tsparticles/shape-text";
import { useSettings } from "../context/SettingsContext";

const initEngine = async (engine: Engine) => {
  await loadSlim(engine);
  await loadTextShape(engine);
};

const OPTIONS: ISourceOptions = {
  fullScreen: { enable: false },
  detectRetina: true,
  fpsLimit: 40,
  background: { color: "transparent" },
  particles: {
    number: { value: 18, density: { enable: true, width: 1000, height: 1000 } },
    color: { value: ["#FF5555", "#F5A623", "#ffffff"] },
    opacity: {
      value: { min: 0.04, max: 0.12 },
      animation: { enable: true, speed: 0.4, sync: false },
    },
    size: { value: { min: 10, max: 18 } },
    move: {
      enable: true,
      speed: 0.25,
      direction: "top",
      random: true,
      straight: false,
      outModes: { default: "out", bottom: "destroy" },
    },
    shape: {
      type: "char",
      options: {
        char: [
          { value: "♩", font: "Verdana", weight: "400", style: "" },
          { value: "♪", font: "Verdana", weight: "400", style: "" },
          { value: "♫", font: "Verdana", weight: "400", style: "" },
          { value: "𝄞", font: "Verdana", weight: "400", style: "" },
          { value: "♬", font: "Verdana", weight: "400", style: "" },
        ],
      },
    },
    rotate: {
      value: { min: 0, max: 360 },
      animation: { enable: true, speed: 3, sync: false },
    },
  },
  interactivity: {
    events: { onHover: { enable: true, mode: "repulse" }, resize: { enable: true } },
    modes: { repulse: { distance: 80, duration: 0.4 } },
  },
};

/** Notas musicais flutuando ao fundo. Isolado num provider próprio para não bloquear a UI. */
export default function ParticlesBg() {
  const { animations } = useSettings();
  if (animations !== "all") return null;
  return (
    <ParticlesProvider init={initEngine}>
      <Particles id="tsparticles" className="pointer-events-none fixed inset-0 z-0" options={OPTIONS} />
    </ParticlesProvider>
  );
}
