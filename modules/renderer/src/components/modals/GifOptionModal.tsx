import { css } from "@emotion/react";
import { ModalProps } from "async-modal-react/dist/types/modal";
import { FC, useState } from "react";
import Button from "@renderer/components/ui/Button";

export interface Props extends ModalProps {}
export const GifOptionModal: FC<Props> = ({ resolve }) => {
  const [fps, setFps] = useState(24);

  return (
    <div
      css={css`
        background: var(--darkLayeredBackground);
        border-radius: 8px;
        text-align: center;
        padding: 40px;
        strong {
          font-size: 1.3rem;
          color: var(--blue700);
        }
      `}
    >
      <div>
        <strong>{fps}</strong> 프레임으로 만듭니다
      </div>
      <div
        css={css`
          margin: 20px 0;
          display: flex;
          gap: 12px;
        `}
      >
        <Button
          onClick={() => setFps(16)}
          type={fps === 16 ? "primary" : "gray"}
        >
          16 FPS
        </Button>
        <Button
          onClick={() => setFps(24)}
          type={fps === 24 ? "primary" : "gray"}
        >
          24 FPS
        </Button>
        <Button
          onClick={() => setFps(30)}
          type={fps === 30 ? "primary" : "gray"}
        >
          30 FPS
        </Button>
        <Button
          onClick={() => setFps(60)}
          type={fps === 60 ? "primary" : "gray"}
        >
          60 FPS
        </Button>
      </div>
      <Button onClick={() => resolve(fps)} size={"full"}>
        만들기
      </Button>
    </div>
  );
};
