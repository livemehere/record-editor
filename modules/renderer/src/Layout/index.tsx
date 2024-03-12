import { FC, ReactNode } from "react";
import { css } from "@emotion/react";
import Nav from "@renderer/Layout/Nav";
import LogoImg from "@public/img/icon-no-bg.png";

interface Props {
  children: ReactNode;
}

const Layout: FC<Props> = ({ children }) => {
  return (
    <div
      css={css`
        --navH: 70px;
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        padding: 30px 20px 20px 20px;
        overflow: hidden;
        .dragbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 34px;
          -webkit-user-select: none;
          -webkit-app-region: drag;

          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          padding-left: 10px;
          padding-top: 10px;
          img {
            width: 28px;
          }
          h1 {
            font-size: 1rem;
            line-height: 110%;
          }
        }
      `}
    >
      <div className="dragbar">
        <img src={LogoImg} alt="logo" />
        <h1>Record Editor</h1>
      </div>
      <Nav />
      <main
        css={css`
          height: calc(100% - var(--navH));
          > * {
            height: 100%;
          }
        `}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
