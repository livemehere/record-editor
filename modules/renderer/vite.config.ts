import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as process from "process";
import { join } from "path";

const config = defineConfig({
  root: __dirname,
  base: "./",
  envDir: process.cwd(),
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: join(process.cwd(), "dist"),
  },
  resolve: {
    alias: {
      "@renderer": join(__dirname, "src"),
      "@public": join(__dirname, "public"),
      "@main": join(process.cwd(), "modules", "main"),
      "@preload": join(process.cwd(), "modules", "preload"),
    },
  },
});

export default config;
