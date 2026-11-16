import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: [
      { find: "virtual:pwa-register", replacement: path.resolve(__dirname, "./src/test/pwa-register.ts") },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
});
