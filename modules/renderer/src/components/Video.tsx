import { css } from "@emotion/react";
import { FC, useEffect, useRef, useState } from "react";
import Loading from "@renderer/components/Lotties/Loading";

interface Props {
  isFile?: boolean;
  duration: number;
  src: string;
  minTimestamp?: number;
  maxTimestamp?: number;
  play?: boolean;
  onChangeTimestamp?: (currentTimestamp: number) => void;
  onChangeDuration?: (duration: number) => void;
}
export const Video: FC<Props> = ({
  isFile = true,
  src,
  minTimestamp = 0,
  maxTimestamp,
  play,
  onChangeTimestamp,
  duration,
}) => {
  const ref = useRef<HTMLVideoElement | null>(null);
  const srcContent = isFile ? `file://${src}` : src;
  const [dimmed, setDimmed] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /** min,max 조절시 dimmed 표시 */
    let id = 0;
    setDimmed(true);
    id = window.setTimeout(() => {
      setDimmed(false);
    }, 100);

    /** min, max 조절시 비디오를 처음부터 다시 재생 */
    el.currentTime = minTimestamp;

    if (play) {
      el.play();
      el.loop = true;
    } else {
      el.pause();
    }

    /** 재생되면서 min, max 시간 확인해서 재시작하는 루프 */
    const timeupdate = () => {
      if (
        el.currentTime < minTimestamp ||
        (maxTimestamp && el.currentTime > maxTimestamp)
      ) {
        el.currentTime = minTimestamp;
      }
      onChangeTimestamp?.(el.currentTime);
    };
    el.addEventListener("timeupdate", timeupdate);

    return () => {
      el.removeEventListener("timeupdate", timeupdate);
      clearTimeout(id);
    };
  }, [play, minTimestamp, maxTimestamp]);

  return (
    <div
      css={css`
        position: relative;
        width: 100%;
        height: 100%;

        .dimmed {
          position: absolute;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}
    >
      {dimmed && (
        <div className={"dimmed"}>
          <Loading width={150} height={150} />
        </div>
      )}
      <video
        ref={ref}
        src={srcContent}
        css={css`
          width: 100%;
          height: 100%;
        `}
      />
    </div>
  );
};
