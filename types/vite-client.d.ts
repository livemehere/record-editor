/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly MODE: string;
  readonly VITE_DEV_RENDERER_SERVER_URL: string;
}
