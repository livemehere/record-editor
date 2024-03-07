import { build, createServer, mergeConfig } from "vite";
import { join } from "path";
import chalk from "chalk";
import { spawn } from "cross-spawn";
import getBaseConfig from "./config.mjs";

/**
 *
 * @param moduleName {string}
 * @param inlineConfig {import("vite").UserConfig}
 * @returns {import("vite").UserConfig}
 */
const config = (moduleName, inlineConfig) =>
  mergeConfig(getBaseConfig(moduleName), inlineConfig);

const mode = process.env.MODE || "development";
async function rendererServer() {
  const server = await createServer({
    mode,
    configFile: join(process.cwd(), "modules", "renderer", "vite.config.ts"),
  });
  await server.listen();

  console.log(
    chalk.green(
      `🚀 Renderer server running at : ${server.resolvedUrls.local[0]}`,
    ),
  );
  return server;
}

async function preloadWatcher({ ws }) {
  return build(
    config("preload", {
      mode,
      build: {
        watch: {},
      },
      plugins: [
        {
          name: "reload-on-preload-changes",
          writeBundle() {
            ws.send({ type: "full-reload" });
          },
        },
      ],
    }),
  );
}

async function mainWatcher({ resolvedUrls }) {
  [process.env.VITE_DEV_RENDERER_SERVER_URL] = resolvedUrls.local;

  let electronApp = null;
  return build(
    config("main", {
      mode,
      build: {
        watch: {},
      },
      plugins: [
        {
          name: "restart-on-main-changes",
          writeBundle() {
            if (electronApp) {
              electronApp.removeListener("exit", process.exit);
              electronApp.kill("SIGINT");
              electronApp = null;
            }

            electronApp = spawn("electron", ["."], { stdio: "inherit" });
            electronApp.addListener("exit", process.exit);
          },
        },
      ],
    }),
  );
}

async function run() {
  const devServer = await rendererServer();
  await preloadWatcher(devServer);
  await mainWatcher(devServer);
}

run();
