import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { configureStore } from "@reduxjs/toolkit";
import { store } from "./store/index.js";

import App from "./App.jsx";
import reportWebVitals from "./reportWebVitals.js";

import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { register as registerServiceWorker } from "./serviceWorkerRegistration.js";
import { initGA as analytics } from "./analytics.js";

import * as Sentry from "@sentry/react";

// =========================
// CONFIG FROM ENV
// =========================
const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === "true";
const QUERY_RETRY = Number(import.meta.env.VITE_API_RETRY_COUNT || 2);
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

// =========================
// SENTRY INIT (if DSN provided)
// =========================
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    sendDefaultPii: true,
  });
}

// =========================
// STORE & REACT QUERY CLIENT
// =========================
const appStore = configureStore({
  reducer: store,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

const appClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30 menit hardcoded
      retry: QUERY_RETRY, // retry dari env
      refetchOnWindowFocus: false, // hardcoded
    },
  },
});

// =========================
// RENDER APP
// =========================
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={appClient}>
      <Provider store={appStore}>
        <App />
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);

// =========================
// SERVICE WORKER
// =========================
registerServiceWorker({
  onSuccess: (registration) =>
    console.log("[SW] Registration successful", registration),
  onUpdate: (registration) =>
    console.log("[SW] Update available", registration),
});

// =========================
// ANALYTICS
// =========================
if (ENABLE_ANALYTICS) {
  analytics();
}

// =========================
// WEB VITALS
// =========================
reportWebVitals();
