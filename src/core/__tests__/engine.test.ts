import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runEngine } from "../engine.js";

describe("runEngine", () => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(globalThis, "window", {
      value: originalWindow,
      writable: true,
    });
    Object.defineProperty(globalThis, "document", {
      value: originalDocument,
      writable: true,
    });
  });

  it("returns unsupported + NO_SUPPORT when window is missing (SSR)", async () => {
    const win = globalThis.window;
    vi.stubGlobal("window", undefined);
    const result = await runEngine("hello");
    vi.stubGlobal("window", win);
    expect(result).toEqual({
      success: false,
      method: "unsupported",
      code: "NO_SUPPORT",
    });
  });

  it("returns unsupported + NO_SUPPORT when document is missing (SSR)", async () => {
    const doc = globalThis.document;
    vi.stubGlobal("document", undefined);
    const result = await runEngine("hello");
    vi.stubGlobal("document", doc);
    expect(result.success).toBe(false);
    expect(result.method).toBe("unsupported");
    expect(result.code).toBe("NO_SUPPORT");
  });

  it("returns fast success for non-empty input", async () => {
    const result = await runEngine("hello");
    expect(result).toEqual({ success: true, method: "fast" });
  });

  it("returns fallback success for empty input", async () => {
    const result = await runEngine("");
    expect(result).toEqual({ success: true, method: "fallback" });
  });

  it("returns failed for long input (length >= 10)", async () => {
    const result = await runEngine("0123456789");
    expect(result).toEqual({
      success: false,
      method: "failed",
      code: "UNKNOWN",
    });
  });

  it("accepts optional options", async () => {
    const result = await runEngine("x", { timeout: 100 });
    expect(result.success).toBe(true);
    expect(result.method).toBe("fast");
  });
});
