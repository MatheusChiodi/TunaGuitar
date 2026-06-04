import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { runMigrations } from "./lib/migrations";
import { audio } from "./lib/audio";

// CSS de bibliotecas (antes do index.css para que nossos overrides vençam)
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/shift-away-subtle.css";
import "notyf/notyf.min.css";
import "splitting/dist/splitting.css";
import "driver.js/dist/driver.css";

import "./index.css";

// Migrações de schema antes de qualquer módulo ler o storage (BP-15).
runMigrations();
// Suspende o áudio em aba oculta e retoma em gesto (BP-06).
audio.installLifecycle();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
