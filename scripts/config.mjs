import { defineConfig } from "vite";
import { join } from "path";

const getBaseConfig = (moduleName) =>
  defineConfig({
    root: join(process.cwd(), "modules", moduleName),
    envDir: process.cwd(),
    resolve: {
      alias: {
        "@renderer": join(process.cwd(), "modules", "renderer","src"),
        "@main": join(process.cwd(), "modules", "main"),
        "@preload": join(process.cwd(), "modules", "preload"),
      },
    },
    build: {
      ssr: true,
      outDir: join(process.cwd(), "dist"),
      lib: {
        entry: "index.ts",
        formats: ["cjs"],
      },
      emptyOutDir: false,
      rollupOptions: {
        output: {
          entryFileNames: `${moduleName}.js`,
        },
      },
    },
  });

export default getBaseConfig;
