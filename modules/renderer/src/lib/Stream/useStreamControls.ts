import { useRef } from "react";
import { StreamControl } from "@renderer/lib/Stream/Stream";

export const useStreamControls = () => {
  return useRef<StreamControl>();
};
