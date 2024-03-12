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
    }else{
      const list = fs.readdirSync(folder);
      if(list.find(file=> file === '.DS_Store')){
        fs.rmSync(path.join(folder, '.DS_Store'));
      }
    }
    return folder;
  }
}

export const dataPath = new DataPath();
