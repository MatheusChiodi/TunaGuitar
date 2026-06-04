import { useEffect, useRef } from "react";
import gsap from "gsap";
import { motionAllowed } from "../lib/anim";

/** Efeito "magnético" GSAP: o elemento segue levemente o cursor e volta com elástico. */
export function useMagnetic<T extends HTMLElement>(strength = 0.22) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let active = false;
    const move = (e: MouseEvent) => {
      if (!motionAllowed()) return;
      active = true;
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - r.left - r.width / 2) * strength,
        y: (e.clientY - r.top - r.height / 2) * strength,
        duration: 0.35,
        ease: "power2.out",
      });
    };
    const leave = () => {
      if (!active) return;
      active = false;
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
    };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
      gsap.killTweensOf(el);
    };
  }, [strength]);
  return ref;
}
