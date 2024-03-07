import {
  ButtonHTMLAttributes,
  FC,
  HTMLAttributes,
  ReactNode,
  useMemo,
} from "react";
import { css } from "@emotion/react";

interface Props {
  children: ReactNode;
  type?: "primary" | "danger" | "warm" | "gray";
  size?: "small" | "medium" | "large" | "full";
  icon?: ReactNode;
}

const Button: FC<
  Props & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">
> = ({ children, icon, type = "primary", size = "medium", ...props }) => {
  const theme = useMemo(() => {
    switch (type) {
      case "primary":
        return {
          bgColor: "var(--blue700)",
          hoverBgColor: "var(--blue900)",
        };
      case "warm":
        return {
          bgColor: "var(--orange700)",
          hoverBgColor: "var(--orange900)",
        };
      case "gray":
        return {
          bgColor: "var(--inverseGrey300)",
          hoverBgColor: "var(--darkLayeredBackground)",
          color: "var(--whiteOpacity600)",
        };
      default:
        return {
          bgColor: "var(--red700)",
          hoverBgColor: "var(--red900)",
        };
    }
  }, [type]);

  const sizeCss = {
    small: css`
      padding: 4px 10px;
    `,
    medium: css`
      padding: 8px 16px;
    `,
    large: css`
      padding: 12px 20px;
    `,
    full: css`
      width: 100%;
      padding: 12px 0;
    `,
  };
  return (
    <button
      css={css`
        background-color: ${theme.bgColor};
        border-radius: 4px;
        padding: 4px 10px;
        transition: all 250ms;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        gap: 8px;

        ${sizeCss[size]};
        color: ${theme.color || "var(--white)"};

        :hover:not(:disabled) {
          background-color: ${theme.hoverBgColor};
        }

        &:disabled {
          filter: grayscale();
          cursor: not-allowed;
        }
      `}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
};

export default Button;
