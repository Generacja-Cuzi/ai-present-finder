export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  jitterMs: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  jitterMs: 500,
};

export function calculateRetryDelay(
  attempt: number,
  config: RetryConfig,
): number {
  const base = Math.min(4000, config.baseDelayMs * 2 ** (attempt - 1));
  const jitter = Math.floor(Math.random() * config.jitterMs);
  return base + jitter;
}

export function isRetryableError(error: unknown): boolean {
  const errorObject = error as { code?: string; message?: string };

  return (
    errorObject.code === "ENOTFOUND" ||
    errorObject.code === "ECONNRESET" ||
    (errorObject.message?.includes("429") ?? false) ||
    (errorObject.message?.includes("500") ?? false) ||
    (errorObject.message?.includes("502") ?? false) ||
    (errorObject.message?.includes("503") ?? false) ||
    (errorObject.message?.includes("504") ?? false)
  );
}
