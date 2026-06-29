declare global {
  interface Window {
    __PLAYWRIGHT_MOCK__?: boolean;
  }
}

export {};
