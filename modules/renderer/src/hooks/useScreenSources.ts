import { useEffect, useState } from "react";
import { CaptureSource } from "../../../main/MainWindow";

const useScreenSources = (autoUpdate?: number) => {
  const [sources, setSources] = useState<CaptureSource[]>();
  const fetch = async () => {
    // @ts-ignore
    const res = await window.app.invoke<CaptureSource[]>("desktopSources");
    setSources(res);
  };

  useEffect(() => {
    let id = 0;
    if (autoUpdate) {
      id = window.setInterval(() => {
        fetch();
      }, autoUpdate);
    } else {
      fetch();
    }

    return () => {
      clearInterval(id);
    };
  }, [autoUpdate]);

  return { sources, refetch: fetch };
};

export default useScreenSources;
