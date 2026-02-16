import { useState, useCallback, useRef, useEffect } from "react";
import { runEngine } from "../core/engine.js";
import type { EngineResult } from "../core/types.js";

export type UseEngineOptions = {
  timeout?: number;
};

export type UseEngineReturn = {
  run: (input: string) => Promise<EngineResult | undefined>;
  running: boolean;
  lastResult: EngineResult | null;
  reset: () => void;
};

/**
 * React hook wrapping runEngine. Manages running state and last result.
 * Cleans up on unmount; no state updates after unmount.
 */
export function useEngine(options?: UseEngineOptions): UseEngineReturn {
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<EngineResult | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  const run = useCallback(
    async (input: string): Promise<EngineResult | undefined> => {
      setRunning(true);
      setLastResult(null);
      try {
        const result = await runEngine(input, { timeout: options?.timeout });
        if (mountedRef.current) {
          setLastResult(result);
        }
        return result;
      } finally {
        if (mountedRef.current) {
          setRunning(false);
        }
      }
    },
    [options?.timeout]
  );

  const reset = useCallback(() => {
    setLastResult(null);
  }, []);

  return { run, running, lastResult, reset };
}
