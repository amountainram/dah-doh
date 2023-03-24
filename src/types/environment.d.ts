export {}

declare global {
  interface ImportMeta {
    env?: {
      PROD?: boolean
    }
  }
}
