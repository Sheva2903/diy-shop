import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8081",
        changeOrigin: true,
        cookieDomainRewrite: { "127.0.0.1": "localhost", "*": "localhost" }
      },
      "/media": {
        target: "http://localhost:8081",
        changeOrigin: true,
        cookieDomainRewrite: { "*": "localhost" }
      }
    }
  },
  test: {
    environment: "jsdom"
  }
});
