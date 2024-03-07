import { css } from "@emotion/react";
import { useDarkMode } from "@renderer/store/darkModeAtom";

const Settings = () => {
  const { isDarkMode, toggle, set } = useDarkMode();
  return (
    <div>
      <h1>Settings</h1>
      <div>
        <h3>Theme</h3>
        <p>{isDarkMode ? "dark" : "light"}</p>
        <div
          css={css`
            display: flex;
            gap: 1rem;
          `}
        >
          <button onClick={() => set(false)}>Light</button>
          <button onClick={() => set(true)}>Dark</button>
          <button
            onClick={() => {
              toggle();
            }}
          >
            Toggle
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
