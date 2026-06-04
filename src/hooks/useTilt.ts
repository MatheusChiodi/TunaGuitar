import { useEffect, useRef } from "react";
import VanillaTilt from "vanilla-tilt";
import type { TiltOptions } from "vanilla-tilt";
import { motionAllowed } from "../lib/anim";

type TiltEl = HTMLElement & { vanillaTilt?: { destroy: () => void } };

/** Tilt 3D GPU-accelerated via VanillaTilt, gated por preferências de movimento. */
export function useTilt<T extends HTMLElement>(options: TiltOptions) {
  const ref = useRef<T>(null);
  const opts = useRef(options);
  opts.current = options;
  useEffect(() => {
    const el = ref.current as TiltEl | null;
    if (!el || !motionAllowed()) return;
    VanillaTilt.init(el, opts.current);
    return () => el.vanillaTilt?.destroy();
  }, []);
  return ref;
}
