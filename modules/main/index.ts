import { app } from "electron";
import { MainWindow } from "./MainWindow";

class Main {
  app = app;
  mainWindow = new MainWindow();

  constructor() {
    this.appSettings();
    this.ready().catch((err) => console.error("Fail to create window:", err));
  }

  static init() {
    return new Main();
  }

  private appSettings() {
    this.app.disableHardwareAcceleration();
    this.app.on("window-all-closed", this.app.quit);
    this.app.on("activate", () => this.mainWindow.get()?.show());
  }

  private ready = async () => {
    await this.app.whenReady();
    await this.mainWindow.create();
  };
}

Main.init();
