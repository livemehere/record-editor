type IpcMainInvokeEvent = import("electron").IpcMainInvokeEvent;

type EventKey = "closeWindow" | "update" | "short-cut:start-recording";
type InvokeKey =
  | "quitApp"
  | "appSetting:get"
  | "appSetting:set"
  | "desktopSources"
  | "cache-video:clear"
  | "cache-video:save"
  | "video:list"
  | "trim-video"
  | "trim-video:progress"
  | "open-dir";

export type ConnectStreamOptions = {
  selector: string;
  audio?: boolean;
};

interface AppInterface {
  off(id: number): void;
  on(
    channel: EventKey,
    callback: (event: IpcMainInvokeEvent, ...args: any[]) => void,
  ): number;
  invoke<T = void>(channel: InvokeKey, ...args: any[]): Promise<T>;
  connectStream(id: string, options: ConnectStreamOptions): Promise<void>;
}

interface Window {
  app: AppInterface;
}

declare module Electron {
  export interface IpcMain {
    handle(
      channels: InvokeKey,
      listener: (event: string, ...args: any[]) => Promise<any> | any,
    ): void;
  }

  export interface WebContents {
    send(channel: EventKey, ...args: any[]): void;
  }
}

declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
