/**
 * Engine method used for the run.
 */
export type EngineMethod = "fast" | "fallback" | "unsupported" | "failed";

/**
 * Error codes for structured failure reporting.
 */
export type EngineErrorCode = "NO_SUPPORT" | "UNKNOWN";

/**
 * Structured result from runEngine.
 */
export type EngineResult = {
  success: boolean;
  method: EngineMethod;
  code?: EngineErrorCode;
  error?: unknown;
};

/**
 * Options for runEngine.
 */
export type EngineOptions = {
  /** Optional timeout in ms (reserved for future use). */
  timeout?: number;
};
