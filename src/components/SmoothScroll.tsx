import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSettings } from "../context/SettingsContext";
import { prefersReducedMotion } from "../lib/anim";

gsap.registerPlugin(ScrollTrigger);

/** Scroll suave (Lenis) sincronizado ao ticker do GSAP + reveals por rota. Sem UI. */
export default function SmoothScroll() {
  const { animations, isSettingsOpen } = useSettings();
  const location = useLocation();
  const lenisRef = useRef<Lenis | null>(null);
  const allowed = animations === "all" && !prefersReducedMotion();

  useEffect(() => {
    if (!allowed) return;
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.8,
    });
    lenisRef.current = lenis;
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [allowed]);

  // Pausa o scroll suave enquanto o modal de Configurações está aberto.
  useEffect(() => {
    const l = lenisRef.current;
    if (!l) return;
    if (isSettingsOpen) l.stop();
    else l.start();
  }, [isSettingsOpen]);

  // Reveals com ScrollTrigger para elementos [data-reveal] da rota atual.
  useEffect(() => {
    if (!allowed) return;
    const els = gsap.utils.toArray<HTMLElement>("[data-reveal]");
    if (!els.length) return;
    const tweens = els.map((el) =>
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
        y: 28,
        opacity: 0,
        duration: 0.6,
        ease: "expo.out",
        clearProps: "transform,opacity",
      }),
    );
    ScrollTrigger.refresh();
    return () => {
      tweens.forEach((tw) => {
        tw.scrollTrigger?.kill();
        tw.kill();
      });
    };
  }, [location.pathname, allowed]);

  return null;
}
