import electron from "electron";
import * as path from "path";
import * as fs from "fs";
class DataPath {
  get root() {
    return electron.app.getPath("userData");
  }

  getFolder(type: string) {
    const folder = path.join(this.root, type);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    return folder;
  }
}

export const dataPath = new DataPath();
