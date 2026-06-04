import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BottomTabBar from "./BottomTabBar";
import SettingsModal from "./SettingsModal";

export default function Layout() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div className="flex min-h-dvh flex-col items-center bg-surface font-body text-on-surface pt-[env(safe-area-inset-top)] pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0 md:pt-20">
      <Navbar />

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          className="flex w-full flex-1 flex-col items-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          {outlet}
        </motion.main>
      </AnimatePresence>

      <Footer />
      <BottomTabBar />
      <SettingsModal />
    </div>
  );
}
