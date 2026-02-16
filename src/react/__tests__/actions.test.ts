import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  runEngineAction,
  initialState,
} from "../actions.js";
import * as engine from "../../core/engine.js";

vi.mock("../../core/engine.js", () => ({
  runEngine: vi.fn(),
}));

describe("runEngineAction", () => {
  beforeEach(() => {
    vi.mocked(engine.runEngine).mockResolvedValue({
      success: true,
      method: "fast",
    });
  });

  it("initialState has result null and error null", () => {
    expect(initialState).toEqual({ result: null, error: null });
  });

  it("reads input from formData and returns result", async () => {
    const formData = new FormData();
    formData.set("input", "hello");
    const state = await runEngineAction(initialState, formData);
    expect(engine.runEngine).toHaveBeenCalledWith("hello");
    expect(state.result).toEqual({ success: true, method: "fast" });
    expect(state.error).toBe(null);
  });

  it("uses empty string when input missing", async () => {
    const formData = new FormData();
    const state = await runEngineAction(initialState, formData);
    expect(engine.runEngine).toHaveBeenCalledWith("");
    expect(state.result).toBeDefined();
  });

  it("sets error when result is not success", async () => {
    vi.mocked(engine.runEngine).mockResolvedValueOnce({
      success: false,
      method: "failed",
      code: "UNKNOWN",
    });
    const formData = new FormData();
    formData.set("input", "x");
    const state = await runEngineAction(initialState, formData);
    expect(state.result).toEqual({
      success: false,
      method: "failed",
      code: "UNKNOWN",
    });
    expect(state.error).toBeTruthy();
  });

  it("catches thrown errors and returns error state", async () => {
    vi.mocked(engine.runEngine).mockRejectedValueOnce(new Error("boom"));
    const formData = new FormData();
    formData.set("input", "x");
    const state = await runEngineAction(initialState, formData);
    expect(state.result).toBe(null);
    expect(state.error).toBe("boom");
  });
});
