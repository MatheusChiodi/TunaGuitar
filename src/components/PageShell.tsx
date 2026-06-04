import type { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function PageShell({ title, subtitle, children }: Props) {
  return (
    <div className="w-full max-w-3xl flex-1 px-5 py-8 md:px-8 md:py-12">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 font-label text-xs tracking-widest text-on-surface-variant transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> AFINADOR
      </Link>

      <motion.div variants={container} initial="hidden" animate="show">
        <motion.h1 variants={item} className="font-headline text-3xl font-bold text-primary md:text-4xl">
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p variants={item} className="mt-2 font-share-tech text-sm text-secondary">
            {subtitle}
          </motion.p>
        )}
        <motion.div variants={item} className="mt-8 flex flex-col gap-5 leading-relaxed text-on-surface-variant">
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

export { container, item };
