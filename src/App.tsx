import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SettingsProvider } from "./context/SettingsContext";
import Layout from "./components/Layout";
import TunerPage from "./pages/TunerPage";
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
            <Route path="manual" element={<ManualPage />} />
            <Route path="privacidade" element={<PrivacyPage />} />
            <Route path="termos" element={<TermsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}
