import {
  cloneElement,
  type ReactElement,
  type ReactNode,
  useCallback,
} from "react";
import { runEngine } from "../core/engine.js";
import type { EngineResult } from "../core/types.js";

export type RunEngineProps = {
  input: string;
  children: ReactNode;
  onResult?: (result: EngineResult) => void;
  onSuccess?: (result: EngineResult) => void;
  onError?: (result: EngineResult) => void;
};

/**
 * Component wrapper: injects onClick that runs the engine with `input`.
 * Preserves child's onClick; supports onResult / onSuccess / onError.
 * Respects preventDefault from child.
 */
export function RunEngine({
  input,
  children,
  onResult,
  onSuccess,
  onError,
}: RunEngineProps): ReactElement {
  const run = useCallback(async () => {
    const result = await runEngine(input);
    onResult?.(result);
    if (result.success) {
      onSuccess?.(result);
    } else {
      onError?.(result);
    }
  }, [input, onResult, onSuccess, onError]);

  const child =
    typeof children === "object" &&
    children !== null &&
    "props" in (children as object)
      ? (children as ReactElement<{ onClick?: (e: React.MouseEvent) => void }>)
      : null;

  if (!child || typeof child !== "object") {
    return (
      <span
        onClick={(e) => {
          e.preventDefault();
          run();
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && run()}
      >
        {children}
      </span>
    );
  }

  return cloneElement(child, {
    ...child.props,
    onClick: (e: React.MouseEvent) => {
      child.props.onClick?.(e);
      if (!e.defaultPrevented) {
        run();
      }
    },
  });
}
