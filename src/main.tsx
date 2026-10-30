import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import { store } from "./store";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </HelmetProvider>
  </React.StrictMode>,
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  navigator.serviceWorker
    .register("/sw.js", { updateViaCache: "none" })
    .then(async () => {
      await navigator.serviceWorker.ready;
      await navigator.serviceWorker.getRegistration().then((registration) =>
        registration?.update(),
      );
      const registration = await navigator.serviceWorker.ready;
      const assets = Array.from(
        document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>(
          'script[src], link[rel="stylesheet"][href]',
        ),
      ).map((element) =>
        element instanceof HTMLScriptElement ? element.src : element.href,
      );
      registration.active?.postMessage({ type: "CACHE_APP_ASSETS", assets });
    })
    .catch((error: unknown) => {
      console.error("Service worker registration failed:", error);
    });
}
