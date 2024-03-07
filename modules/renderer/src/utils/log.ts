export const debug = (...args: any[]) => {
  // @ts-ignore
  if (import.meta.env.PROD) return;
  console.log("DEBUG:: ", ...args);
};
