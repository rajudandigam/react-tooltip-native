import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useEngine } from "../useThing.js";
import * as engine from "../../core/engine.js";

vi.mock("../../core/engine.js", () => ({
  runEngine: vi.fn(),
}));

describe("useEngine", () => {
  beforeEach(() => {
    vi.mocked(engine.runEngine).mockResolvedValue({
      success: true,
      method: "fast",
    });
  });

  it("returns run, running, lastResult, reset", () => {
    const { result } = renderHook(() => useEngine());
    expect(result.current.run).toBeDefined();
    expect(typeof result.current.run).toBe("function");
    expect(result.current.running).toBe(false);
    expect(result.current.lastResult).toBe(null);
    expect(result.current.reset).toBeDefined();
  });

  it("run() calls runEngine and sets lastResult", async () => {
    const { result } = renderHook(() => useEngine());
    let resolved: ReturnType<typeof engine.runEngine> extends Promise<infer T> ? T : never;
    act(() => {
      result.current.run("hello").then((r) => (resolved = r));
    });
    expect(result.current.running).toBe(true);
    await waitFor(() => {
      expect(result.current.running).toBe(false);
    });
    expect(result.current.lastResult).toEqual({
      success: true,
      method: "fast",
    });
    expect(engine.runEngine).toHaveBeenCalledWith("hello", { timeout: undefined });
  });

  it("reset() clears lastResult", async () => {
    const { result } = renderHook(() => useEngine());
    act(() => {
      result.current.run("hi");
    });
    await waitFor(() => {
      expect(result.current.lastResult).not.toBe(null);
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.lastResult).toBe(null);
  });

  it("passes options.timeout to runEngine", async () => {
    const { result } = renderHook(() => useEngine({ timeout: 500 }));
    act(() => {
      result.current.run("x");
    });
    await waitFor(() => {
      expect(engine.runEngine).toHaveBeenCalledWith("x", { timeout: 500 });
    });
  });
});
