import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  resolve: {
    alias: {
      "@lib": path.resolve(root, "dist/index.mjs"),
      "@lib/core": path.resolve(root, "dist/core.mjs"),
      "@lib/react": path.resolve(root, "dist/react.mjs"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
