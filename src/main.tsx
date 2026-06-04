import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// CSS de bibliotecas (antes do index.css para que nossos overrides vençam)
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/shift-away-subtle.css";
import "notyf/notyf.min.css";
import "splitting/dist/splitting.css";
import "driver.js/dist/driver.css";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
