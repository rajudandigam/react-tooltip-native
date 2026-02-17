import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFallbackAdapter } from "../fallbackAdapter";
import * as fallbackPositioning from "../../positioning/fallbackPositioning";
import * as scrollParents from "../../positioning/scrollParents";

describe("fallbackAdapter", () => {
  let triggerEl: HTMLElement;
  let overlayEl: HTMLElement;

  beforeEach(() => {
    triggerEl = document.createElement("button");
    overlayEl = document.createElement("div");
    document.body.appendChild(triggerEl);
    document.body.appendChild(overlayEl);

    vi.spyOn(triggerEl, "getBoundingClientRect").mockReturnValue(
      new DOMRect(100, 50, 80, 32)
    );
    vi.spyOn(overlayEl, "getBoundingClientRect").mockReturnValue(
      new DOMRect(0, 0, 120, 40)
    );

    Object.defineProperty(window, "innerWidth", { value: 800, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 600, configurable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (triggerEl.parentNode) triggerEl.parentNode.removeChild(triggerEl);
    if (overlayEl.parentNode) overlayEl.parentNode.removeChild(overlayEl);
  });

  it("open() applies position:fixed and sets top/left from computeFallbackPosition", () => {
    const computeSpy = vi.spyOn(fallbackPositioning, "computeFallbackPosition").mockReturnValue({ top: 10, left: 60 });

    const adapter = createFallbackAdapter({
      triggerEl,
      overlayEl,
      id: "x",
      placement: "top",
      offset: 8,
      closeOnOutsidePress: false,
      closeOnEsc: false,
    });

    adapter.open();

    expect(overlayEl.style.position).toBe("fixed");
    expect(overlayEl.style.zIndex).toBe("1");
    expect(overlayEl.style.top).toBe("10px");
    expect(overlayEl.style.left).toBe("60px");
    expect(computeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        placement: "top",
        offset: 8,
        viewportWidth: 800,
        viewportHeight: 600,
      })
    );

    adapter.destroy();
  });

  it("reposition called on scroll parent scroll event", () => {
    const scrollable = document.createElement("div");
    scrollable.style.overflow = "auto";
    scrollable.appendChild(triggerEl);
    document.body.appendChild(scrollable);

    vi.spyOn(scrollParents, "getScrollParents").mockReturnValue([scrollable, window]);

    const computeSpy = vi.spyOn(fallbackPositioning, "computeFallbackPosition").mockReturnValue({ top: 10, left: 60 });

    const adapter = createFallbackAdapter({
      triggerEl,
      overlayEl,
      id: "x",
      placement: "top",
      offset: 8,
      closeOnOutsidePress: false,
      closeOnEsc: false,
    });

    adapter.open();
    expect(computeSpy).toHaveBeenCalledTimes(1);

    computeSpy.mockReturnValue({ top: 12, left: 62 });
    const callsBeforeScroll = computeSpy.mock.calls.length;
    scrollable.dispatchEvent(new Event("scroll", { bubbles: true }));

    expect(computeSpy.mock.calls.length).toBeGreaterThanOrEqual(callsBeforeScroll + 1);
    expect(overlayEl.style.top).toBe("12px");
    expect(overlayEl.style.left).toBe("62px");

    adapter.destroy();
    document.body.removeChild(scrollable);
  });

  it("ResizeObserver observe called for trigger and overlay on open, disconnect on close", () => {
    const disconnectMock = vi.fn();
    const observeMock = vi.fn();

    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe = observeMock;
        disconnect = disconnectMock;
      }
    );

    vi.spyOn(fallbackPositioning, "computeFallbackPosition").mockReturnValue({ top: 0, left: 0 });

    const adapter = createFallbackAdapter({
      triggerEl,
      overlayEl,
      id: "x",
      placement: "top",
      offset: 8,
      closeOnOutsidePress: false,
      closeOnEsc: false,
    });

    adapter.open();
    expect(observeMock).toHaveBeenCalledTimes(2);
    expect(observeMock).toHaveBeenCalledWith(triggerEl);
    expect(observeMock).toHaveBeenCalledWith(overlayEl);

    adapter.close();
    expect(disconnectMock).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });

  it("outside press requests close when closeOnOutsidePress is true", () => {
    const onRequestClose = vi.fn();

    const adapter = createFallbackAdapter({
      triggerEl,
      overlayEl,
      id: "x",
      placement: "top",
      offset: 8,
      closeOnOutsidePress: true,
      closeOnEsc: false,
      onRequestClose,
    });

    adapter.open();

    document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(onRequestClose).toHaveBeenCalledWith("outside-press");

    onRequestClose.mockClear();
    triggerEl.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(onRequestClose).not.toHaveBeenCalled();

    overlayEl.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(onRequestClose).not.toHaveBeenCalled();

    adapter.destroy();
  });

  it("outside press does NOT request close when closeOnOutsidePress is false", () => {
    const onRequestClose = vi.fn();

    const adapter = createFallbackAdapter({
      triggerEl,
      overlayEl,
      id: "x",
      placement: "top",
      offset: 8,
      closeOnOutsidePress: false,
      closeOnEsc: false,
      onRequestClose,
    });

    adapter.open();
    document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(onRequestClose).not.toHaveBeenCalled();

    adapter.destroy();
  });

  it("Escape requests close when closeOnEsc is true", () => {
    const onRequestClose = vi.fn();

    const adapter = createFallbackAdapter({
      triggerEl,
      overlayEl,
      id: "x",
      placement: "top",
      offset: 8,
      closeOnOutsidePress: false,
      closeOnEsc: true,
      onRequestClose,
    });

    adapter.open();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onRequestClose).toHaveBeenCalledWith("escape");

    adapter.destroy();
  });

  it("Escape does NOT request close when closeOnEsc is false", () => {
    const onRequestClose = vi.fn();

    const adapter = createFallbackAdapter({
      triggerEl,
      overlayEl,
      id: "x",
      placement: "top",
      offset: 8,
      closeOnOutsidePress: false,
      closeOnEsc: false,
      onRequestClose,
    });

    adapter.open();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onRequestClose).not.toHaveBeenCalled();

    adapter.destroy();
  });

  it("close() and destroy() remove listeners (no onRequestClose or reposition after)", () => {
    const onRequestClose = vi.fn();
    const computeSpy = vi.spyOn(fallbackPositioning, "computeFallbackPosition").mockReturnValue({ top: 0, left: 0 });

    const adapter = createFallbackAdapter({
      triggerEl,
      overlayEl,
      id: "x",
      placement: "top",
      offset: 8,
      closeOnOutsidePress: true,
      closeOnEsc: true,
      onRequestClose,
    });

    adapter.open();
    const callCountAfterOpen = computeSpy.mock.calls.length;

    adapter.close();

    document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    window.dispatchEvent(new Event("scroll"));

    expect(onRequestClose).not.toHaveBeenCalled();
    expect(computeSpy.mock.calls.length).toBe(callCountAfterOpen);

    adapter.destroy();
  });

  it("destroy() removes listeners and clears overlay styles", () => {
    const onRequestClose = vi.fn();

    const adapter = createFallbackAdapter({
      triggerEl,
      overlayEl,
      id: "x",
      placement: "top",
      offset: 8,
      closeOnOutsidePress: true,
      closeOnEsc: true,
      onRequestClose,
    });

    adapter.open();
    adapter.destroy();

    expect(overlayEl.style.position).toBe("");
    expect(overlayEl.style.top).toBe("");
    expect(overlayEl.style.left).toBe("");

    document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onRequestClose).not.toHaveBeenCalled();
  });

  it("open() is idempotent (second open no-ops)", () => {
    const computeSpy = vi.spyOn(fallbackPositioning, "computeFallbackPosition").mockReturnValue({ top: 0, left: 0 });
    const addSpy = vi.spyOn(document, "addEventListener");

    const adapter = createFallbackAdapter({
      triggerEl,
      overlayEl,
      id: "x",
      placement: "top",
      offset: 8,
      closeOnOutsidePress: true,
      closeOnEsc: true,
    });

    adapter.open();
    const computeCallsAfterFirst = computeSpy.mock.calls.length;
    const addCallsAfterFirst = addSpy.mock.calls.length;

    adapter.open();
    expect(computeSpy.mock.calls.length).toBe(computeCallsAfterFirst);
    expect(addSpy.mock.calls.length).toBe(addCallsAfterFirst);

    adapter.destroy();
    addSpy.mockRestore();
  });

  it("close() is idempotent (second close no-ops)", () => {
    const onAfterClose = vi.fn();

    const adapter = createFallbackAdapter({
      triggerEl,
      overlayEl,
      id: "x",
      placement: "top",
      offset: 8,
      closeOnOutsidePress: false,
      closeOnEsc: false,
      onAfterClose,
    });

    adapter.open();
    adapter.close();
    expect(onAfterClose).toHaveBeenCalledTimes(1);
    adapter.close();
    expect(onAfterClose).toHaveBeenCalledTimes(1);
  });

  it("updatePlacement repositions when open", () => {
    const computeSpy = vi.spyOn(fallbackPositioning, "computeFallbackPosition").mockReturnValue({ top: 0, left: 0 });

    const adapter = createFallbackAdapter({
      triggerEl,
      overlayEl,
      id: "x",
      placement: "top",
      offset: 8,
      closeOnOutsidePress: false,
      closeOnEsc: false,
    });

    adapter.open();
    computeSpy.mockClear();
    computeSpy.mockReturnValue({ top: 100, left: 200 });

    adapter.updatePlacement("bottom");
    expect(computeSpy).toHaveBeenCalledWith(
      expect.objectContaining({ placement: "bottom" })
    );
    expect(overlayEl.style.top).toBe("100px");
    expect(overlayEl.style.left).toBe("200px");

    adapter.destroy();
  });

  it("calls onAfterOpen on open and onAfterClose on close", () => {
    const onAfterOpen = vi.fn();
    const onAfterClose = vi.fn();

    const adapter = createFallbackAdapter({
      triggerEl,
      overlayEl,
      id: "x",
      placement: "top",
      offset: 8,
      closeOnOutsidePress: false,
      closeOnEsc: false,
      onAfterOpen,
      onAfterClose,
    });

    adapter.open();
    expect(onAfterOpen).toHaveBeenCalledTimes(1);
    expect(onAfterClose).not.toHaveBeenCalled();

    adapter.close();
    expect(onAfterClose).toHaveBeenCalledTimes(1);
  });
});
