import React, {
  FC,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import uuid from "@renderer/utils/uuid";
import { css } from "@emotion/react";
import type { CaptureSource } from "../../../../main/MainWindow";
import { VideoCacheData } from "../../../../main/videoCache";
import { debug } from "@renderer/utils/log";

export type StreamControlStartOptions = {
  videoBitsPerSecond?: number;
  size?: { width: number; height: number };
};
export type StreamStatus = "recording" | "none";
export type StreamControl = {
  start: (
    source: CaptureSource,
    options?: StreamControlStartOptions,
  ) => Promise<void>;
  connectStream: (source: CaptureSource) => Promise<void>;
  disconnectStream: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isRecording: () => boolean;
  getCurrentSource: () => CaptureSource | undefined;
};
interface Props {
  control: React.MutableRefObject<StreamControl | undefined>;
  onChangeStatus?: (state: StreamStatus) => void;
  onSuccess?: (cacheData: VideoCacheData) => void;
}
export const Stream: FC<Props> = ({ onSuccess, onChangeStatus, control }) => {
  const [id, setId] = useState(uuid());
  const sourceRef = useRef<CaptureSource>();
  const mediaRecorderRef = useRef<MediaRecorder>();
  const chunk = useRef<Blob[]>([]);
  const startTimestamp = useRef(0);

  useImperativeHandle(control, () => {
    return {
      async connectStream(source: CaptureSource) {
        if (mediaRecorderRef.current) {
          throw new Error("Already recording");
        }

        sourceRef.current = source;
        // @ts-ignore
        await window.app.connectStream(source.id, {
          selector: `[data-uuid='${id}']`,
          size: source.display?.size,
        });
      },
      disconnectStream() {
        const videoElement = document.querySelector(
          `[data-uuid='${id}']`,
        ) as HTMLVideoElement;
        if (videoElement) {
          videoElement.srcObject = null;
          this.cleanUp();
        }
      },

      async start(source: CaptureSource, options?: StreamControlStartOptions) {
        if (mediaRecorderRef.current) {
          throw new Error("Already recording");
        }

        /** 이미 stream 에 연결된 소스가 동일하다면 그대로 사용 */
        if (sourceRef.current?.id !== source.id) {
          await this.connectStream(source);
        }

        const videoElement = document.querySelector(
          `[data-uuid='${id}']`,
        ) as HTMLVideoElement;
        const stream = videoElement.srcObject as MediaStream;

        const recorder = new MediaRecorder(stream, {
          mimeType: "video/webm;",
          videoBitsPerSecond: options?.videoBitsPerSecond ?? 8 * 1024 * 1024,
        });
        mediaRecorderRef.current = recorder;

        recorder.onstart = () => {
          startTimestamp.current = Date.now();
          chunk.current = [];
          onChangeStatus?.("recording");
          debug("recorder start");
        };

        recorder.ondataavailable = (e) => {
          chunk.current.push(e.data);
        };

        recorder.onstop = () => {
          const source = sourceRef.current;
          if (!source) {
            throw new Error("sourceRef.current is undefined");
          }

          const duration = (Date.now() - startTimestamp.current) / 1000;
          const blob = new Blob(chunk.current, {
            type: "video/webm",
          });

          /** 녹화를 다 하면, 그때 비디오 사이즈를 그대로 저장함.  */
          blob.arrayBuffer().then((buffer) => {
            const { width, height } = stream.getVideoTracks()[0].getSettings();
            // @ts-ignore
            window.app
              .invoke<VideoCacheData>(
                "cache-video:save",
                buffer,
                duration,
                width,
                height,
              )
              .then((cacheData: VideoCacheData) => {
                /** Clean up */
                this.cleanUp();
                onSuccess?.(cacheData);
              });
          });
        };

        recorder.onerror = (e) => {
          this.cleanUp();
          sourceRef.current = undefined;
          throw e;
        };
        recorder.start();
      },
      stop() {
        mediaRecorderRef.current?.stop();
      },
      pause() {
        mediaRecorderRef.current?.pause();
      },
      resume() {
        mediaRecorderRef.current?.resume();
      },
      isRecording() {
        return !!mediaRecorderRef.current;
      },
      getCurrentSource() {
        return sourceRef.current;
      },
      cleanUp() {
        chunk.current = [];
        mediaRecorderRef.current = undefined;
        onChangeStatus?.("none");
        setId(uuid());
      },
    };
  });

  return (
    <div
      css={css`
        position: relative;
        width: 100%;
        height: 100%;
        background-color: #000;
        z-index: 1;
        video {
          width: 100%;
          height: 100%;
        }
      `}
    >
      <video data-uuid={id}></video>
    </div>
  );
};
