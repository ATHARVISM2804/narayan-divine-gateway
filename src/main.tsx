import { createRoot } from "react-dom/client";
import "./i18n";
import App from "./App.tsx";
import "./index.css";
import { reloadOnce } from "./lib/chunkReload";

// A shared chunk or stylesheet from an older deploy failed to load: reload once.
window.addEventListener("vite:preloadError", (e) => {
  if (reloadOnce()) e.preventDefault();
});

createRoot(document.getElementById("root")!).render(<App />);
