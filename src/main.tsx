import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const isAndroidWebView =
  navigator.userAgent.includes("wv") ||
  (navigator.userAgent.includes("Android") &&
    !navigator.userAgent.includes("Chrome/"));

if (!isAndroidWebView) {
  import("virtual:pwa-register").then(({ registerSW }) => registerSW());
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
