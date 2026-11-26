import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "katex/dist/katex.min.css";
import "@xyflow/react/dist/style.css";
import "@/app/globals.css";
import { App } from "./App";

// sql.js loads its WebAssembly file from next to the page.
(window as unknown as { __SQL_WASM_URL__: string }).__SQL_WASM_URL__ = new URL("sql-wasm.wasm", window.location.href).href;

try {
  const t = localStorage.getItem("guesslab:theme");
  if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
} catch {
  /* storage blocked */
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
