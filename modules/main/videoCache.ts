import { join } from "path";
import { dataPath } from "./dataPath";
import { parseDataFile } from "./setting";
import fs from "fs";

export type VideoCacheData = {
  fileName: string;
  filePath: string;
  duration: number;
  size: {
    width: number;
    height: number;
  };
};

class VideoCacheManager {
  path: string;
  data: { [key: string]: VideoCacheData };
  constructor() {
    this.path = join(dataPath.root, "videoCacheData.json");
    this.data = parseDataFile(this.path, {});
  }

  get(fileName: string) {
    return this.data[fileName] ?? null;
  }

  set(fileName: string, data: VideoCacheData) {
    this.data[fileName] = data;
    fs.writeFileSync(this.path, JSON.stringify(this.data));
    this.data = parseDataFile(this.path, {});
  }

  clear() {
    this.data = {};
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }

  remove(fileName: string) {
    delete this.data[fileName];
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

export const videoCacheManager = new VideoCacheManager();
