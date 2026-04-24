import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
  ],
  server: {
    host: true,
    allowedHosts: true
  },
  preview: {
    host: true,
    port: 8080,
    allowedHosts: true
  }
});
