import { Link } from "react-router-dom";

const links = [
  { label: "Termos", to: "/termos" },
  { label: "Privacidade", to: "/privacidade" },
  { label: "Manual", to: "/manual" },
];

/** Rodapé — apenas desktop. */
export default function Footer() {
  return (
    <footer className="mt-auto hidden w-full flex-col items-center justify-between gap-4 border-t border-outline-variant bg-surface-lowest px-5 py-6 opacity-80 transition-opacity hover:opacity-100 md:flex md:flex-row md:px-10">
      <span className="font-label text-[11px] tracking-widest text-on-surface-variant">
        © 2026 TunaGuitar — Precisão analógica.
      </span>
      <div className="flex gap-4">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="font-label text-[11px] tracking-widest text-tertiary transition-colors hover:text-secondary"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
