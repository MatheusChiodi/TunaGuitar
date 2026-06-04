import Tippy from "@tippyjs/react";
import type { ReactElement, ReactNode } from "react";

type Placement = "top" | "bottom" | "left" | "right";

/** Tooltip Tippy com o tema escuro "gt" da aplicação. */
export default function Tip({
  content,
  children,
  placement = "top",
}: {
  content: ReactNode;
  children: ReactElement;
  placement?: Placement;
}) {
  if (content == null || content === "") return children;
  return (
    <Tippy
      content={content}
      theme="gt"
      animation="shift-away-subtle"
      delay={[400, 0]}
      duration={[200, 150]}
      arrow
      offset={[0, 8]}
      placement={placement}
    >
      {children}
    </Tippy>
  );
}
