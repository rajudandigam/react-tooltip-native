import { runEngine } from "../core/engine.js";
import type { EngineResult } from "../core/types.js";

export type ActionState = {
  result: EngineResult | null;
  error: string | null;
};

const initialState: ActionState = {
  result: null,
  error: null,
};

/**
 * React 19 action helper for useActionState.
 * Reads "input" from formData and calls runEngine.
 */
export async function runEngineAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const input = formData.get("input");
  const text = typeof input === "string" ? input : "";
  try {
    const result = await runEngine(text);
    return {
      result,
      error: result.success ? null : (result.error as string) ?? result.code ?? "Unknown",
    };
  } catch (err) {
    return {
      result: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export { initialState };
