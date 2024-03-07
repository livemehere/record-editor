import { FC } from "react";
import { css } from "@emotion/react";
import { Link, NavLink } from "react-router-dom";
import router from "@renderer/router";

const Nav: FC = () => {
  return (
    <nav
      css={css`
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        height: var(--navH);
        a {
          text-decoration: none;
          background-color: var(--darkBackground);
          color: var(--whiteOpacity800);
          padding: 8px 14px;
          border-radius: 4px;
          font-weight: bold;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          &.active {
            color: var(--blue500);
          }
          &:hover {
            color: var(--blue400);
            background-color: var(--darkLayeredBackground);
          }
        }
      `}
    >
      {router.map((route) => (
        <NavLink
          key={route.path}
          to={route.path}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          {route?.icon}
          {route.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default Nav;
