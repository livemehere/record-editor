import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  desktopCapturer,
  DesktopCapturerSource,
  Display,
  ipcMain,
  screen,
  shell,
  globalShortcut,
  dialog,
} from "electron";
import { setting } from "./setting";
import path, { join } from "path";
import * as fs from "fs";
import { dataPath } from "./dataPath";
import { getFileMetaData, trimVideo } from "./ffmpeg-util";
import rimraf from "rimraf";
import { VideoCacheData, videoCacheManager } from "./videoCache";

export type CaptureSource = DesktopCapturerSource & {
  dataURL: string;
  display?: Display;
};

export class MainWindow {
  private window: BrowserWindow;
  private bounds = setting.get("bounds");

  private init = () => {
    const bound: BrowserWindowConstructorOptions = this.bounds.main || {
      x: 0,
      y: 0,
    };
    this.window = new BrowserWindow({
      ...bound,
      resizable: true,
      frame: false,
      movable: true,
      titleBarStyle: "hidden",
      titleBarOverlay: {
        color: "#2f3241",
        symbolColor: "#74b1be",
        height: 34,
      },
      minWidth: 1920,
      minHeight: 1080,
      webPreferences: {
        preload: join(__dirname, "preload.js"),
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false,
        devTools: !app.isPackaged,
      },
    });

    this.addMoveEvent();
    this.addCloseEvent();
    this.addFacade();
    this.addGlobalShortCut();

    if (!app.isPackaged) {
      this.window.webContents.openDevTools({ mode: "detach" });
    }
    this.window.on("ready-to-show", () =>
      setTimeout(() => this.window.show(), 100),
    );

    // FIXME:
    const load = async () => {
      // @ts-ignore
      if (import.meta.env.MODE === "development") {
        return (
          this.window
            // @ts-ignore
            .loadURL(import.meta.env.VITE_DEV_RENDERER_SERVER_URL)
            .then(() => this.window)
        );
      } else {
        return this.window
          .loadFile(join(__dirname, "index.html"))
          .then(() => this.window);
      }
    };

    return load();
  };

  get = () => this.window;

  create = async () => {
    const window = await this.init();
    if (window.isMinimized() || !window.isVisible()) {
      window.show();
      window.focus();
    }
    return window;
  };

  private addMoveEvent() {
    const saveBounds = () => {
      this.bounds.main = this.window.getBounds();
      setting.set("bounds", this.bounds);
    };

    this.window.addListener("resized", saveBounds);
    this.window.addListener("moved", saveBounds);
  }

  private addCloseEvent() {
    this.window.addListener("closed", app.quit);
  }

  private addGlobalShortCut() {
    globalShortcut.register("Control+Alt+1", () => {
      this.window.show();
      this.window.webContents.send("short-cut:start-recording");
    });
  }

  private addFacade() {
    ipcMain.handle("quitApp", app.quit);
    ipcMain.handle("appSetting:get", (event, args) => setting.get(args));
    ipcMain.handle("appSetting:set", (event, args) =>
      setting.set(args[0], args[1]),
    );

    /** 모니터,실행중인 윈도우 목록 반환 */
    ipcMain.handle("desktopSources", async () => {
      return this.getConnectedScreens();
    });

    ipcMain.handle(
      "cache-video:save",
      async (
        event,
        arrayBuffer: ArrayBuffer,
        duration: number,
        width: number,
        height: number,
      ) => {
        try {
          const buffer = Buffer.from(arrayBuffer);
          const fileName = `${Date.now()}.webm`;
          const filePath = path.join(
            dataPath.getFolder("cache-video"),
            fileName,
          );
          fs.writeFileSync(filePath, buffer);
          const cacheData: VideoCacheData = {
            fileName,
            filePath,
            duration,
            size: {
              width,
              height,
            },
          };
          videoCacheManager.set(fileName, cacheData);
          return cacheData;
        } catch (e) {
          console.error(e);
          return null;
        }
      },
    );

    /* FIXME: 아마 result-video 목록은 파일 자체에서 메타데이터 읽도록 바꿔야할 듯. */
    ipcMain.handle(
      "video:list",
      async (event, type: "cache" | "result" = "cache") => {
        const files = fs.readdirSync(dataPath.getFolder(`${type}-video`));
        let result = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const input = path.join(dataPath.getFolder(`${type}-video`), file);
          const data = {
            name: file,
            path: input,
            meta: await getFileMetaData(input),
            videoMetaData: videoCacheManager.get(file),
          };
          result.push(data);
        }
        return result;
      },
    );

    /** 영상 앞뒤 컷, 구간 Crop 해서 wemb -> mp4 전환. */
    ipcMain.handle("trim-video", (event, args) => {
      /** 폴더 없으면 생성 */
      dataPath.getFolder("result-video");
      return new Promise((resolve, reject) => {
        trimVideo({
          ...args,
          onProgress: (progress) => {
            this.window.webContents.send("trim-video:progress", progress);
          },
          onError: (e) => {
            reject(e);
          },
          onEnd: () => {
            resolve(true);
          },
        });
      });
    });

    ipcMain.handle("cache-video:clear", async () => {
      await rimraf.rimraf(dataPath.getFolder("cache-video"));
      videoCacheManager.clear();
      return true;
    });

    ipcMain.handle("open-dir", (event, dir) => {
      shell.openPath(dataPath.getFolder(dir));
    });
  }

  private async getConnectedScreens() {
    let screens = await desktopCapturer.getSources({
      types: ["screen", "window"],
      thumbnailSize: {
        width: 720,
        height: 480,
      },
      fetchWindowIcons: true,
    });

    const displays = screen.getAllDisplays();
    screens = screens.map((src) => ({
      ...src,
      dataURL: src.thumbnail.toDataURL(),
      display: displays.find((d) => d.id === +src.display_id),
    }));

    return screens;
  }
}
