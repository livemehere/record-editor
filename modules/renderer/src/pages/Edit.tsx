import { css } from "@emotion/react";
import { FC, useEffect, useMemo, useState } from "react";
import Button from "@renderer/components/ui/Button";
import { LeftAside } from "@renderer/components/styleOnly/LeftAside";
import styled from "@emotion/styled";
import { Video } from "@renderer/components/Video";
import useCacheVideoFiles from "@renderer/hooks/useCacheVideoFiles";
import { useStreamAtom } from "@renderer/store/streamAtom";
import NewIcon from "@renderer/components/icons/NewIcon";
import { EditCanvasLayer } from "@renderer/components/EditCanvasLayer";
import RangeBar from "@renderer/components/RangeBar";
import { AnimatePresence, motion } from "framer-motion";
import { useGlobalAtom } from "@renderer/store";
import { fadeIn } from "@renderer/framer";
import { debug } from "@renderer/utils/log";
import { TrimVideoOptions } from "../../../main/ffmpeg-util";
import { VideoCacheData } from "../../../main/videoCache";
import { BiCartDownload } from "react-icons/bi";
import { TfiVideoClapper } from "react-icons/tfi";
import { FaCropAlt } from "react-icons/fa";
import { CiSaveDown2 } from "react-icons/ci";
import { useModal } from "async-modal-react";
import { GifOptionModal } from "@renderer/components/modals/GifOptionModal";

const VIDEO_WRAPPER_WIDTH = 1600;
const VIDEO_WRAPPER_HEIGHT = 750;
const VIDEO_WRAPPER_PADDING = 20;

export const Edit: FC = () => {
  const { setLoading } = useGlobalAtom();
  const {
    state: { latestVideoPath },
    removeLatest,
  } = useStreamAtom();
  const [selectFile, setSelectFile] = useState<any>();
  const { files, refetch } = useCacheVideoFiles();

  const [minTimestamp, setMinTimestamp] = useState(0);
  const [maxTimestamp, setMaxTimestamp] = useState(0);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });
  const [isCrop, setIsCrop] = useState(false);
  const { pushModal } = useModal();

  const toggleCrop = () => {
    setIsCrop(!isCrop);
  };

  /** 영상의 원본 사이즈 */
  const originSize = useMemo<VideoCacheData["size"]>(() => {
    debug("origin size :: ", selectFile?.videoMetaData?.size);
    return selectFile?.videoMetaData?.size || null;
  }, [selectFile]);

  /** Crop 사이즈 init */
  useEffect(() => {
    if (originSize) {
      setCrop({
        ...crop,
        w: originSize.width,
        h: originSize.height,
      });
    }
  }, [originSize]);

  /** 최근 촬영 영상 자동 선택 */
  useEffect(() => {
    if (files) {
      files.some((file) => {
        if (latestVideoPath === file.path) {
          setSelectFile(file);
          return true;
        }
        return false;
      });
    }
  }, [latestVideoPath, files]);

  /** 영상 길이 */
  const duration = useMemo(
    () => selectFile?.videoMetaData.duration,
    [selectFile],
  );

  /** 파일을 선택할 때 마다 duration 을 maxTimestamp 로 초기화. */
  useEffect(() => {
    if (!selectFile) return;
    setMaxTimestamp(selectFile?.videoMetaData.duration);
  }, [selectFile]);

  const resizeWidth = useMemo(() => {
    if (!originSize) return 0;
    const ratio = originSize?.width / originSize?.height;
    return ratio * VIDEO_WRAPPER_HEIGHT;
  }, [originSize]);

  const clearCacheVideoList = async () => {
    // @ts-ignore
    const result = await window.app.invoke<boolean>("cache-video:clear");
    if (result) {
      refetch();
    }
  };

  const createMp4 = async () => {
    let id = 0;
    const trimmedDuration = maxTimestamp - minTimestamp;
    const args: TrimVideoOptions = {
      inputPath: selectFile.path,
      outputPath: selectFile.path
        .replace("cache-video", "result-video")
        .replace("webm", "mp4"),
      startTime: minTimestamp,
      duration: trimmedDuration,
      crop: isCrop ? crop : undefined,
      originSize,
    };
    try {
      // @ts-ignore
      id = window.app.on("trim-video:progress", (progress: number) => {
        setLoading(true, `${(progress * 100).toFixed(0)}%`);
      });
      // @ts-ignore
      const res = await window.app.invoke("trim-video", args);
      // @ts-ignore
      await window.app.invoke("open-dir", "result-video");
    } catch (e) {
    } finally {
      setLoading(false);
      // @ts-ignore
      window.app.off(id);
    }
  };

  const createGif = async () => {
    const fps = await pushModal<number>(GifOptionModal);
    let id = 0;
    const trimmedDuration = maxTimestamp - minTimestamp;
    const args: TrimVideoOptions = {
      inputPath: selectFile.path,
      outputPath: selectFile.path
        .replace("cache-video", "result-video")
        .replace("webm", "gif"),
      startTime: minTimestamp,
      duration: trimmedDuration,
      crop: isCrop ? crop : undefined,
      originSize,
      fps,
    };
    try {
      // @ts-ignore
      id = window.app.on("trim-video:progress", (progress: number) => {
        setLoading(true, `${(progress * 100).toFixed(0)}%`);
      });
      // @ts-ignore
      const res = await window.app.invoke("trim-video", args);
      // @ts-ignore
      await window.app.invoke("open-dir", "result-video");
    } catch (e) {
    } finally {
      setLoading(false);
      // @ts-ignore
      window.app.off(id);
    }
  };

  return (
    <div
      css={css`
        display: flex;
      `}
    >
      <LeftAside>
        <h3>
          <span
            css={css`
              margin-right: 10px;
            `}
          >
            녹화된 영상
          </span>
          <Button type={"danger"} onClick={clearCacheVideoList} size={"small"}>
            모두 삭제
          </Button>
        </h3>
        <div
          css={css`
            margin-top: 20px;
            display: inline-flex;
            flex-direction: column;
            gap: 4px;

            > div {
              cursor: pointer;
              padding: 4px 8px;
              &:hover {
                background-color: var(--whiteOpacity50);
              }
            }
          `}
        >
          <AnimatePresence>
            {files?.map((file, i) => (
              <motion.div
                variants={fadeIn}
                initial={latestVideoPath === file.path ? "hidden" : "show"}
                animate={"show"}
                exit={"hidden"}
                custom={files.length - i}
                key={file.name}
                onClick={() => {
                  setSelectFile(file);
                  if (latestVideoPath === file.path) removeLatest();
                }}
                css={css`
                  position: relative;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  padding: 4px;
                  min-height: 40px;
                  background-color: ${selectFile?.name === file.name
                    ? "var(--whiteOpacity50)"
                    : ""};
                  > img {
                    position: absolute;
                    transform: translateY(2px);
                    right: 0;
                  }
                  .duration {
                    font-size: 0.9rem;
                    margin-left: 8px;
                    color: var(--whiteOpacity500);
                  }
                `}
              >
                <span>
                  <span>{file.name}</span>
                  <span className={"duration"}>
                    ( {file.videoMetaData.duration.toFixed(1)}초 )
                  </span>
                </span>
                {latestVideoPath === file.path && <NewIcon />}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </LeftAside>
      <EditorSection>
        <div className="video-section">
          {selectFile && (
            <Video
              src={selectFile.path}
              duration={selectFile.videoMetaData.duration}
              play={true}
              onChangeTimestamp={(timestamp) => {
                setCurrentTimestamp(timestamp);
              }}
              minTimestamp={minTimestamp}
              maxTimestamp={maxTimestamp}
            />
          )}
          <EditCanvasLayer
            width={resizeWidth}
            height={VIDEO_WRAPPER_HEIGHT}
            isCrop={isCrop}
            onChangeRectArea={(rect) => {
              const originX = (rect.x / resizeWidth) * originSize?.width;
              const originY =
                (rect.y / VIDEO_WRAPPER_HEIGHT) * originSize?.height;
              const originWidth =
                (rect.width / resizeWidth) * originSize?.width;
              const originHeight =
                (rect.height / VIDEO_WRAPPER_HEIGHT) * originSize?.height;

              setCrop({
                x: originX,
                y: originY,
                w: originWidth,
                h: originHeight,
              });
            }}
          />
        </div>
        <section
          css={css`
            margin: 10px 0;
          `}
        >
          <div>
            {currentTimestamp.toFixed(1)}초 / {duration?.toFixed(1)}초
          </div>
          <div
            css={css`
              .range-display {
                display: flex;
                justify-content: space-between;
                margin-top: 10px;
              }
            `}
          >
            <RangeBar
              width={VIDEO_WRAPPER_WIDTH - VIDEO_WRAPPER_PADDING * 2}
              height={40}
              min={0}
              max={duration || 1}
              displayValue={currentTimestamp}
              onChange={(min, max) => {
                setMinTimestamp(min);
                setMaxTimestamp(max);
              }}
            />
            <div className={"range-display"}>
              <div>시작 {minTimestamp.toFixed(1)}초</div>
              <div>길이 {(maxTimestamp - minTimestamp).toFixed(1)}초</div>
              <div>끝 {maxTimestamp.toFixed(1)}초</div>
            </div>
          </div>
        </section>
        <section
          css={css`
            display: flex;
            justify-content: center;
            margin-top: 20px;
            gap: 20px;
          `}
        >
          <Button
            onClick={createMp4}
            icon={<CiSaveDown2 strokeWidth={2} />}
            size={"medium"}
          >
            동영상 저장
          </Button>
          <Button
            onClick={createGif}
            icon={<CiSaveDown2 strokeWidth={2} />}
            size={"medium"}
          >
            GIF 저장
          </Button>
          <Button
            type={isCrop ? "warm" : "gray"}
            onClick={toggleCrop}
            icon={<FaCropAlt />}
            size={"medium"}
          >
            자르기 {isCrop ? "ON" : "OFF"}
          </Button>
        </section>
      </EditorSection>
    </div>
  );
};

const EditorSection = styled.section`
  max-width: ${VIDEO_WRAPPER_WIDTH}px;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-left: ${VIDEO_WRAPPER_PADDING}px;

  > .video-section {
    position: relative;
    background-color: #000;
    height: ${VIDEO_WRAPPER_HEIGHT}px;

    > .EditCanvasLayer {
      position: absolute;
      inset: 0;
      display: flex;
      justify-content: center;
    }
  }
`;
