import { useAtom, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

interface StreamAtom {
  latestVideoPath: string | null;
  latestScreenSourceId: string | null;
}

export const streamAtom = atomWithStorage<StreamAtom>("streamAtom", {
  latestVideoPath: null,
  latestScreenSourceId: null,
});
streamAtom.debugLabel = "streamAtom";

export const useStreamAtom = () => {
  const [state, setState] = useAtom(streamAtom);

  const setLatest = (latest: string) => {
    setState((prev) => ({ ...prev, latestVideoPath: latest }));
  };

  const removeLatest = () => {
    setState((prev) => ({ ...prev, latestVideoPath: null }));
  };

  const setLatestScreenSourceId = (id: string) => {
    setState((prev) => ({ ...prev, latestScreenSourceId: id }));
  };

  return {
    state,
    setLatest,
    removeLatest,
    setLatestScreenSourceId,
  };
};
