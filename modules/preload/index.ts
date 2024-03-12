import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron";
import { debug } from "@renderer/utils/log";
import type { ConnectStreamOptions } from "../../types/global";

type Listener = (e: IpcRendererEvent, ...args: any[]) => void;
type PairMap = {
  [key: number]: {
    channel: string;
    listener: Listener;
  };
};
const pairMap = {} as PairMap;
let seq = 0;
contextBridge.exposeInMainWorld("app", {
  invoke: (channel: string, ...args: any) =>
    ipcRenderer.invoke(channel, ...args),
  on: (channel: string, callback: (...args: any[]) => void) => {
    seq++;
    const listener: Listener = (e, ...args) => callback(...args);
    ipcRenderer.on(channel, listener);
    pairMap[seq] = { channel, listener };
    return seq;
  },
  off: (id: number) => {
    const { channel, listener } = pairMap[id];
    ipcRenderer.off(channel, listener);
    delete pairMap[id];
  },
  connectStream: async (id: string, options: ConnectStreamOptions) => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          // @ts-ignore
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: id,
            maxFrameRate: 60,
          },
        },
      });

      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          // @ts-ignore
          mandatory: {
            chromeMediaSource: "desktop",
          },
        },
        video: {
          // @ts-ignore
          mandatory: {
            chromeMediaSource: "desktop",
          },
        },
      });

      const selector = options.selector;
      const video = document.querySelector(selector) as HTMLVideoElement;
      if (!video) {
        throw new Error(`${selector} not found`);
      }
      video.srcObject = videoStream;
      video.autoplay = true;
    } catch (e) {
      debug(e);
      throw e;
    }
  },
});
