import { build as viteBuild, createLogger } from "vite";
import { join } from "path";
import getBaseConfig from "./config.mjs";
import chalk from "chalk";
import electronBuilder, { createTargets } from "electron-builder";
const { build: electronBuild, Platform } = electronBuilder;

import 'dotenv/config';

const mode = process.env.MODE || "production";
const os = process.env.BUILD_OS || "all";
async function buildVitePackages(...moduleNames) {
  for (const moduleName of moduleNames) {
    const config =
      moduleName === "renderer"
        ? {
            configFile: join(
              process.cwd(),
              "modules",
              "renderer",
              "vite.config.ts",
            ),
          }
        : getBaseConfig(moduleName);
    await viteBuild({
      mode,
      ...config,
    });
  }
}

async function build() {
  await buildVitePackages("main", "renderer", "preload");

  if(os === 'win' || os === 'all'){
    await electronBuild({
      targets: createTargets([Platform.WINDOWS], "nsis", "x64"),
    });
  }

  if(os === 'mac' || os === 'all'){
    await electronBuild({
      targets: createTargets([Platform.MAC], "dmg", "arm64"),
    });
    await electronBuild({
      targets: createTargets([Platform.MAC], "dmg", "x64"),
    });
  }

}

build().catch((e) => {
  createLogger().error(
    chalk.red(`error during build application:\n${e.stack || e}`),
  );
  process.exit(1);
});
