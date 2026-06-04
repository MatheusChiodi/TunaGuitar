import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SettingsProvider } from "./context/SettingsContext";
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

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<TunerPage />} />
            <Route path="metronomo" element={<MetronomePage />} />
            <Route path="acordes" element={<ChordsPage />} />
            <Route path="ouvido" element={<EarTrainingPage />} />
            <Route path="escalas" element={<ScalesPage />} />
            <Route path="capotraste" element={<CapoPage />} />
            <Route path="diario" element={<PracticePage />} />
            <Route path="teoria" element={<TheoryPage />} />
            <Route path="manual" element={<ManualPage />} />
            <Route path="privacidade" element={<PrivacyPage />} />
            <Route path="termos" element={<TermsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}
