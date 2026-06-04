import type { CSSProperties, ReactNode } from "react";
import type { TiltOptions } from "vanilla-tilt";
import { useTilt } from "../hooks/useTilt";

export default function TiltCard({
  options,
  className,
  style,
  children,
}: {
  options: TiltOptions;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useTilt<HTMLDivElement>(options);
  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
