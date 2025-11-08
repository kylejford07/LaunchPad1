declare global {
  interface ImportMetaEnv {
    readonly VITE_OPENAI_API_KEY?: string
    readonly VITE_DEBUG?: string
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

export {};
