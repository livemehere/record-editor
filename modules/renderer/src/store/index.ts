import { atom, useAtom } from "jotai";

type LoadingIconType = "default" | "nexon";
interface GlobalAtom {
  isLoading: boolean;
  loadingText?: string;
  iconType: LoadingIconType;
}

const globalAtom = atom<GlobalAtom>({
  isLoading: false,
  loadingText: undefined,
  iconType: "default",
});
globalAtom.debugLabel = "globalAtom";

export const useGlobalAtom = () => {
  const [state, setState] = useAtom(globalAtom);

  const setLoading = (
    v: boolean,
    loadingText = "",
    iconType: LoadingIconType = "default",
  ) => {
    setState((prev) => ({
      ...prev,
      isLoading: v,
      loadingText,
      iconType,
    }));
  };

  return {
    state,
    setLoading,
  };
};
