import { Suspense, useEffect, useRef } from "react";
import { useLocation, useNavigate, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import BottomTabBar from "./BottomTabBar";
import SettingsModal from "./SettingsModal";
import SmoothScroll from "./SmoothScroll";
import { load, save } from "../lib/storage";
import { startTour, tourSeen } from "../lib/tour";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const outlet = useOutlet();
  const restored = useRef(false);
  const tourStarted = useRef(false);

  // Restaura a última aba ao abrir na raiz; salva a aba atual.
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const last = load<string>("tg.lastRoute", "/");
    if (location.pathname === "/" && last !== "/") navigate(last, { replace: true });
  }, [location.pathname, navigate]);

  useEffect(() => {
    save("tg.lastRoute", location.pathname);
  }, [location.pathname]);

  // Onboarding (Driver.js): dispara na home, após a entrada animar. Reinício via Config volta à home.
  useEffect(() => {
    if (location.pathname !== "/" || tourSeen()) return;
    if (tourStarted.current) return;
    tourStarted.current = true;
    const id = window.setTimeout(() => startTour(), 1500);
    return () => window.clearTimeout(id);
  }, [location.pathname]);

  return (
    <div className="flex min-h-dvh w-full">
      <SmoothScroll />
      <Sidebar />

      <div className="flex min-h-dvh w-full flex-1 flex-col items-center font-body text-on-surface pt-[env(safe-area-inset-top)] pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0">
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            className="flex w-full flex-1 flex-col items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <Suspense
              fallback={
                <div className="flex w-full flex-1 items-center justify-center py-20">
                  <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Carregando…</span>
                </div>
              }
            >
              {outlet}
            </Suspense>
          </motion.main>
        </AnimatePresence>

        <Footer />
      </div>

      <BottomTabBar />
      <SettingsModal />
    </div>
  );
}
