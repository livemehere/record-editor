import { useGlobalAtom } from "@renderer/store";
import { css } from "@emotion/react";
import Loading from "@renderer/components/Lotties/Loading";
import NexonLogoImg from "@public/img/nexon-logo.png";
import { motion } from "framer-motion";

export const GlobalLoadingSpinner = () => {
  const {
    state: { isLoading, loadingText, iconType },
  } = useGlobalAtom();

  if (!isLoading) return null;

  return (
    <div
      css={css`
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 10;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;

        h2 {
          position: absolute;
          top: 64%;
          > span {
            color: var(--orange500);
            font-weight: 700;
          }
        }
      `}
    >
      {iconType === "default" ? (
        <Loading width={300} height={300} />
      ) : (
        <motion.img
          src={NexonLogoImg}
          alt="nexon"
          initial={{
            y: "15%",
          }}
          animate={{
            y: "-15%",
            transition: {
              type: "spring",
            },
          }}
        />
      )}
      {loadingText && (
        <h2 dangerouslySetInnerHTML={{ __html: loadingText }}></h2>
      )}
    </div>
  );
};
