import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import { GamifyProvider } from "./context/GamifyContext";
import Layout from "./components/Layout";
import TunerPage from "./pages/TunerPage";
import MetronomePage from "./pages/MetronomePage";
import ChordsPage from "./pages/ChordsPage";
import EarTrainingPage from "./pages/EarTrainingPage";
import ScalesPage from "./pages/ScalesPage";
import CapoPage from "./pages/CapoPage";
import PracticePage from "./pages/PracticePage";
import TheoryPage from "./pages/TheoryPage";
import ManualPage from "./pages/ManualPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import CifradorPage from "./pages/CifradorPage";
import LoopStationPage from "./pages/LoopStationPage";
import ProgressionPage from "./pages/ProgressionPage";
import RhythmPage from "./pages/RhythmPage";
import AchievementsPage from "./pages/AchievementsPage";
import PerformancePage from "./pages/PerformancePage";
import ConfigPage from "./pages/ConfigPage";

function Router() {
  const { animations } = useSettings();
  return (
    <MotionConfig reducedMotion={animations === "all" ? "never" : "always"}>
      <BrowserRouter>
        <Routes>
          <Route path="/performance" element={<PerformancePage />} />
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
        <Router />
      </GamifyProvider>
    </SettingsProvider>
  );
}
