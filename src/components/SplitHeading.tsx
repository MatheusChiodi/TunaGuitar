import { memo, useEffect, useRef } from "react";
import Splitting from "splitting";
import { motionAllowed } from "../lib/anim";

/** Título com animação letra-a-letra (Splitting.js). memo evita que o React desfaça os spans. */
function SplitHeadingBase({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || el.dataset.split === "1") return; // evita double-split no StrictMode (dev)
    el.dataset.split = "1";
    Splitting({ target: el, by: "chars" });
    if (!motionAllowed()) return;
    el.classList.add("heading-reveal");
    const id = requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("visible")));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <h1 ref={ref} data-splitting className={className}>
      {text}
    </h1>
  );
}

export default memo(SplitHeadingBase);
