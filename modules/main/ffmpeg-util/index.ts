import * as fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { path as ffprobePath } from "@ffprobe-installer/ffprobe";

const replacePath = (path: string) => {
  // @ts-ignore
  return import.meta.env.PROD
    ? path.replace("app.asar", "app.asar.unpacked")
    : path;
};

ffmpeg.setFfmpegPath(replacePath(ffmpegPath));
ffmpeg.setFfprobePath(replacePath(ffprobePath));

function noop() {}

export type TrimVideoOptions = {
  inputPath: string;
  outputPath: string;
  startTime: number;
  duration: number;
  crop?: { x: number; y: number; w: number; h: number };
  originSize: { width: number; height: number };
  fps?: number;
  onProgress?: (...args: any[]) => void;
  onError?: (...args: any[]) => void;
  onEnd?: (...args: any[]) => void;
};

export function trimVideo(options: TrimVideoOptions) {
  const command = ffmpeg(options.inputPath);

  const videoFilters = [];
  if (options.crop) {
    const x = Math.max(0, options.crop.x);
    const y = Math.max(0, options.crop.y);
    const w = Math.min(options.originSize.width - 1, options.crop.w);
    const h = Math.min(options.originSize.height - 1, options.crop.h);
    console.log(x, y, w, h);
    videoFilters.push(`crop=${w}:${h}:${x}:${y}`);
  } else {
    videoFilters.push(
      `scale=${options.originSize.width}:${options.originSize.height}`,
    );
  }

  command
    .setStartTime(options.startTime)
    .duration(options.duration)
    .fpsOutput(options.fps ?? 60)
    .videoFilter(videoFilters)
    .on("progress", (e) => {
      let percent = 0;
      if (e.timemark) {
        const time = parseInt(e.timemark.replace(/:/g, ""));
        percent = time / options.duration;
      }
      options.onProgress?.(percent);
    })
    .on("error", options.onError || noop)
    .on("end", options.onEnd || noop)

    .output(options.outputPath)
    .run();
}

export async function getFileMetaData(path: string) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        reject(err);
      }
      resolve(stats);
    });
  });
}
export async function getVideoMetaData(path: string) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

export function convertWebmToMp4(
  path: string,
  outputPath: string,
  // duration: number,
) {
  return new Promise((resolve, reject) => {
    ffmpeg(path)
      // .outputOptions("-metadata", `duration=${duration}`)
      .output(outputPath)
      .outputFormat("mp4")
      .on("error", reject)
      .on("end", resolve)
      .run();
  });
}
