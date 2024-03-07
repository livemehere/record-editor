import LoadingJson from "../../../public/lotties/loading.json";
import { css } from "@emotion/react";
import Lottie from "lottie-react";
import { FC } from "react";

interface Props {
  width?: number;
  height?: number;
}

const Loading: FC<Props> = ({ width = 100, height = 100 }) => {
  return (
    <Lottie
      animationData={LoadingJson}
      autoplay={true}
      loop={true}
      css={css`
        margin: auto;
        width: ${width}px;
        height: ${height}px;
      `}
    />
  );
};

export default Loading;
