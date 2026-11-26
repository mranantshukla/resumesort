// Static single-page build of GuessLab (no server). Used to host the app as plain files.
// Next.js stays the primary build; this reuses the same pages and components through shims.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  root: path.resolve(__dirname, "spa"),
  base: "./",
  publicDir: false,
  plugins: [react()],
  define: {
    "process.env.NEXT_PUBLIC_AI_PROVIDER": JSON.stringify("local"),
  },
  resolve: {
    alias: [
      { find: /^next\/link$/, replacement: path.resolve(__dirname, "spa/shims/link.tsx") },
      { find: /^next\/navigation$/, replacement: path.resolve(__dirname, "spa/shims/navigation.ts") },
      { find: /^(fs|path|crypto)$/, replacement: path.resolve(__dirname, "spa/empty.ts") },
      { find: "@", replacement: path.resolve(__dirname, "src") },
    ],
  },
  css: { postcss: path.resolve(__dirname) },
  build: {
    outDir: path.resolve(__dirname, "dist-spa"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
    assetsInlineLimit: 0,
  },
});
