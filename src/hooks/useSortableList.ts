import { useEffect, useRef } from "react";
import Sortable, { type Options } from "sortablejs";

/** Drag-and-drop com SortableJS (touch + acessível). `enabled` liga/desliga em runtime. */
export function useSortableList<T extends HTMLElement>(
  onReorder: (oldIndex: number, newIndex: number) => void,
  enabled = true,
  extra?: Options,
) {
  const ref = useRef<T>(null);
  const cb = useRef(onReorder);
  cb.current = onReorder;
  const sortable = useRef<Sortable | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const s = Sortable.create(el, {
      animation: 200,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
      handle: ".drag-handle",
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      dragClass: "sortable-drag",
      ...extra,
      onEnd: (evt) => {
        const { oldIndex, newIndex } = evt;
        if (oldIndex != null && newIndex != null && oldIndex !== newIndex) cb.current(oldIndex, newIndex);
      },
    });
    sortable.current = s;
    return () => {
      s.destroy();
      sortable.current = null;
    };
  }, []);

  useEffect(() => {
    sortable.current?.option("disabled", !enabled);
  }, [enabled]);

  return ref;
}
