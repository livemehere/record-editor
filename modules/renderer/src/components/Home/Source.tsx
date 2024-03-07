import { css } from "@emotion/react";
import { FC } from "react";
import { CaptureSource } from "../../../../main/MainWindow";

interface Props {
  source: CaptureSource;
  onClick: () => void;
  isSelected: boolean;
}
export const Source: FC<Props> = ({ source, onClick, isSelected }) => {
  return (
    <div
      key={source.id}
      onClick={onClick}
      css={css`
        position: relative;
        cursor: pointer;

        :hover {
          outline: 2px solid var(--red500);
        }

        ${isSelected &&
        css`
          outline: 2px solid var(--red500);
        `}

        p {
          position: absolute;
          top: 10px;
          left: 10px;
          font-weight: 700;
          font-size: 0.7rem;
          background-color: var(--blue400);
          padding: 2px 4px;
          border-radius: 4px;
          box-shadow:
            rgba(0, 0, 0, 0.3) 0px 19px 38px,
            rgba(0, 0, 0, 0.22) 0px 15px 12px;
        }
      `}
    >
      <img src={source.dataURL} alt={source.name} />
      <p>{source.name}</p>
    </div>
  );
};
