/// <reference types="vite/client" />

declare module "*.css?url" {
  const url: string;
  export default url;
}

declare module "*.css" {
  const css: string;
  export default css;
}

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
