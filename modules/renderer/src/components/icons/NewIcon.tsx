import { css } from "@emotion/react";
import NewIconImg from "@public/img/new-icon.png";

const NewIcon = () => {
  return (
    <img
      src={NewIconImg}
      alt=""
      css={css`
        width: 30px !important;
      `}
    />
  );
};

export default NewIcon;
