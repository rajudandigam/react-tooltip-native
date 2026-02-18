import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Repo root (parent of demo/)
const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, "src");
const distDir = path.join(root, "dist");
// Use dist if built (e.g. after npm run build); otherwise use source so dev works without build
const useDist = existsSync(path.join(distDir, "react.mjs"));
const libDir = useDist ? distDir : srcDir;
const ext = useDist ? ".mjs" : ".ts";

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  resolve: {
    // More specific aliases first so "@lib/react" matches before "@lib"
    alias: [
      { find: "@lib/react", replacement: path.join(libDir, "react" + ext) },
      { find: "@lib/core", replacement: path.join(libDir, "core" + ext) },
      { find: "@lib", replacement: path.join(libDir, "index" + ext) },
    ],
  },
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      allow: [root],
    },
  },
});
