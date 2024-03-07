import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";
import { useEffect } from "react";

export const darkModeAtom = atomWithStorage<boolean>("darkMode", true);
darkModeAtom.debugLabel = "darkModeAtom";
export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useAtom(darkModeAtom);

  const toggle = () => {
    setIsDarkMode((prev) => !prev);
  };

  const set = (v: boolean) => {
    setIsDarkMode(v);
  };

  useEffect(() => {
    setTheme(isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  return {
    isDarkMode,
    toggle,
    set,
  };
};

function setTheme(theme: "light" | "dark") {
  document.body.className = theme;
}

function toggleTheme() {
  document.body.classList.toggle("dark");
}

function getTheme() {
  return document.body.className;
}
