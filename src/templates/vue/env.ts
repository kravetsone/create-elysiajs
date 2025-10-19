export function getEnvDTs() {
	return `/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // More environment variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}`;
}
