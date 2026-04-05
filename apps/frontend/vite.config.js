import { defineConfig } from "vite";
import tsconfigPaths from 'vite-tsconfig-paths';
import react from "@vitejs/plugin-react";

/**
 * Vite Configuration
 *
 * Enhancements:
 * - Inject cache version into Service Worker
 * - Maintain clean minimal setup
 */
export default defineConfig({
  plugins: [react() , tsconfigPaths()],

  define: {
    /**
     * Injected into service-worker.js at build time
     * Used for cache versioning
     *
     * @example "v1"
     */
    __CACHE_VERSION__: JSON.stringify(
      process.env.VITE_SW_CACHE_VERSION || "v1"
    ),
  },
});