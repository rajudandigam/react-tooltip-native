/**
 * Vitest setup: enable React act() so tests using act() don't warn.
 */
import { beforeAll } from "vitest";

beforeAll(() => {
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});
