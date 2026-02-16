import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RunEngine } from "../Component.jsx";
import * as engine from "../../core/engine.js";

vi.mock("../../core/engine.js", () => ({
  runEngine: vi.fn(),
}));

describe("RunEngine", () => {
  beforeEach(() => {
    vi.mocked(engine.runEngine).mockResolvedValue({
      success: true,
      method: "fast",
    });
  });

  it("renders child and runs engine on click", async () => {
    const onResult = vi.fn();
    render(
      <RunEngine input="hello" onResult={onResult}>
        <button type="button">Run</button>
      </RunEngine>
    );
    const btn = screen.getByRole("button", { name: "Run" });
    fireEvent.click(btn);
    await vi.waitFor(() => {
      expect(engine.runEngine).toHaveBeenCalledWith("hello");
    });
    await vi.waitFor(() => {
      expect(onResult).toHaveBeenCalledWith({
        success: true,
        method: "fast",
      });
    });
  });

  it("calls onSuccess when result is success", async () => {
    const onSuccess = vi.fn();
    render(
      <RunEngine input="hi" onSuccess={onSuccess}>
        <button type="button">Run</button>
      </RunEngine>
    );
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    await vi.waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({
        success: true,
        method: "fast",
      });
    });
  });

  it("calls onError when result is not success", async () => {
    vi.mocked(engine.runEngine).mockResolvedValueOnce({
      success: false,
      method: "failed",
      code: "UNKNOWN",
    });
    const onError = vi.fn();
    render(
      <RunEngine input="xxxxxxxxxx" onError={onError}>
        <button type="button">Run</button>
      </RunEngine>
    );
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    await vi.waitFor(() => {
      expect(onError).toHaveBeenCalledWith({
        success: false,
        method: "failed",
        code: "UNKNOWN",
      });
    });
  });

  it("renders non-element child as span and runs engine on click", async () => {
    const onResult = vi.fn();
    render(
      <RunEngine input="span" onResult={onResult}>
        just text
      </RunEngine>
    );
    const el = screen.getByText("just text");
    fireEvent.click(el);
    await vi.waitFor(() => {
      expect(engine.runEngine).toHaveBeenCalledWith("span");
      expect(onResult).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, method: "fast" })
      );
    });
  });

  it("does not run engine when child preventDefault", async () => {
    render(
      <RunEngine input="hello">
        <button
          type="button"
          onClick={(e: React.MouseEvent) => e.preventDefault()}
        >
          Prevent
        </button>
      </RunEngine>
    );
    fireEvent.click(screen.getByRole("button", { name: "Prevent" }));
    await vi.waitFor(() => {});
    expect(engine.runEngine).not.toHaveBeenCalled();
  });
});
