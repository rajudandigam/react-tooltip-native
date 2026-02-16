import type { EngineResult, EngineOptions } from "./types.js";

/**
 * Tiered engine: SSR guard → fast path → fallback → failed.
 * Returns structured result (metadata moat). No top-level browser access.
 */
export async function runEngine(
  input: string,
  _options?: EngineOptions
): Promise<EngineResult> {
  // Tier 0 — SSR guard
  if (typeof window === "undefined" || typeof document === "undefined") {
    return {
      success: false,
      method: "unsupported",
      code: "NO_SUPPORT",
    };
  }

  // Tier 1 — fast path: non-empty, short input succeeds
  try {
    if (input.length > 0 && input.length < 10) {
      return { success: true, method: "fast" };
    }
  } catch {
    // fall through to tier 2
  }

  // Tier 2 — fallback: empty or very short (length < 10) succeeds
  try {
    if (input.length < 10) {
      return { success: true, method: "fallback" };
    }
  } catch {
    // fall through to failed
  }

  // Tier 3 — failed: length >= 10
  return {
    success: false,
    method: "failed",
    code: "UNKNOWN",
  };
}
