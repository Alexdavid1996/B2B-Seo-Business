/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA_MEASUREMENT_ID: string;
  readonly VITE_FB_PIXEL_ID: string;
  readonly VITE_GTM_CONTAINER_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}