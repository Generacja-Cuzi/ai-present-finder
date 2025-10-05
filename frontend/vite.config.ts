import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
  ],
  test: {
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ["@grpc/proto-loader", "@grpc/grpc-js"], // 🧩 zapobiega błędom esbuilda
  },
  build: {
    rollupOptions: {
      external: ["@grpc/proto-loader", "@grpc/grpc-js"], // 🧩 nie bundluj tych paczek
    },
  },
});
