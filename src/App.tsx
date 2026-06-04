import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import { GamifyProvider } from "./context/GamifyContext";
import ParticlesBg from "./components/ParticlesBg";
import Layout from "./components/Layout";
import TunerPage from "./pages/TunerPage";

// Páginas carregadas sob demanda — Chart.js/áudio pesado fica fora do bundle inicial.
const MetronomePage = lazy(() => import("./pages/MetronomePage"));
const ChordsPage = lazy(() => import("./pages/ChordsPage"));
const EarTrainingPage = lazy(() => import("./pages/EarTrainingPage"));
const ScalesPage = lazy(() => import("./pages/ScalesPage"));
const CapoPage = lazy(() => import("./pages/CapoPage"));
const PracticePage = lazy(() => import("./pages/PracticePage"));
const TheoryPage = lazy(() => import("./pages/TheoryPage"));
const ManualPage = lazy(() => import("./pages/ManualPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const CifradorPage = lazy(() => import("./pages/CifradorPage"));
const LoopStationPage = lazy(() => import("./pages/LoopStationPage"));
const ProgressionPage = lazy(() => import("./pages/ProgressionPage"));
const RhythmPage = lazy(() => import("./pages/RhythmPage"));
const AchievementsPage = lazy(() => import("./pages/AchievementsPage"));
const PerformancePage = lazy(() => import("./pages/PerformancePage"));
const ConfigPage = lazy(() => import("./pages/ConfigPage"));

function Fallback() {
  return (
    <div className="flex min-h-dvh w-full flex-1 items-center justify-center">
      <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Carregando…</span>
    </div>
  );
}

function Router() {
  const { animations } = useSettings();
  return (
    <MotionConfig reducedMotion={animations === "all" ? "never" : "always"}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/performance"
            element={
              <Suspense fallback={<Fallback />}>
                <PerformancePage />
              </Suspense>
            }
          />
          <Route element={<Layout />}>
            <Route index element={<TunerPage />} />
            <Route path="metronomo" element={<MetronomePage />} />
            <Route path="acordes" element={<ChordsPage />} />
            <Route path="cifrador" element={<CifradorPage />} />
            <Route path="progressoes" element={<ProgressionPage />} />
            <Route path="ritmos" element={<RhythmPage />} />
            <Route path="ouvido" element={<EarTrainingPage />} />
            <Route path="escalas" element={<ScalesPage />} />
            <Route path="capotraste" element={<CapoPage />} />
            <Route path="loop" element={<LoopStationPage />} />
            <Route path="diario" element={<PracticePage />} />
            <Route path="conquistas" element={<AchievementsPage />} />
            <Route path="teoria" element={<TheoryPage />} />
            <Route path="config" element={<ConfigPage />} />
            <Route path="manual" element={<ManualPage />} />
            <Route path="privacidade" element={<PrivacyPage />} />
            <Route path="termos" element={<TermsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <GamifyProvider>
        <ParticlesBg />
        <Router />
      </GamifyProvider>
    </SettingsProvider>
  );
}
