import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_PROXY_TARGET || "http://localhost:8081",
        changeOrigin: true
      },
      "/media": {
        target: process.env.VITE_PROXY_TARGET || "http://localhost:8081",
        changeOrigin: true
      }
    }
  },
  test: {
    environment: "jsdom"
  }
});
