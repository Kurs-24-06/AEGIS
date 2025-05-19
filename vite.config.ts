// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      // Konfiguriere den Proxy für API-Anfragen
      "/api": {
        target: "http://localhost:8080", // Ändere dies auf die URL deines Backends
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Verhindere Konflikte mit Angular
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
