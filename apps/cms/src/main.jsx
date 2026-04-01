import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { configureStore } from "@reduxjs/toolkit";
import { store } from "./store/index.js";
import reportWebVitals from "./reportWebVitals.js";
import { register as registerServiceWorker } from "./serviceWorkerRegistration.js";

import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "react-quill/dist/quill.snow.css";




import App from "./App.jsx";
import ReactDOM from "react-dom/client";
import React from "react";

const appStore = configureStore({
  reducer: store,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

const appClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

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

registerServiceWorker({
  onSuccess: (registration) =>
    console.log("[SW] Registration successful", registration),
  onUpdate: (registration) =>
    console.log("[SW] Update available", registration),
});



reportWebVitals()