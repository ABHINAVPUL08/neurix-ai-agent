const isDev = process.env.NODE_ENV === "development";

/** Development-only logging — stripped in production builds */
export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  error: (scope: string, error: unknown) => {
    if (isDev) {
      console.error(`[${scope}]`, error);
      return;
    }
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`[${scope}]`, message);
  },
};
