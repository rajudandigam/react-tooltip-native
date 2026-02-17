import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createNativeAdapter } from "../nativeAdapter";

describe("nativeAdapter", () => {
  let triggerEl: HTMLElement;
  let overlayEl: HTMLElement;
  let showPopoverMock: ReturnType<typeof vi.fn>;
  let hidePopoverMock: ReturnType<typeof vi.fn>;
  let rafCallback: (() => void) | null;

  beforeEach(() => {
    triggerEl = document.createElement("button");
    overlayEl = document.createElement("div");
    document.body.appendChild(triggerEl);
    document.body.appendChild(overlayEl);

    showPopoverMock = vi.fn();
    hidePopoverMock = vi.fn();
    (overlayEl as unknown as { showPopover: () => void }).showPopover = showPopoverMock;
    (overlayEl as unknown as { hidePopover: () => void }).hidePopover = hidePopoverMock;

    rafCallback = null;
    vi.stubGlobal(
      "requestAnimationFrame",
      (cb: () => void) => {
        rafCallback = cb;
        return 1;
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.removeChild(triggerEl);
    document.body.removeChild(overlayEl);
  });

  it("open() injects anchorName on trigger and positionAnchor on overlay", () => {
    const adapter = createNativeAdapter({
      triggerEl,
      overlayEl,
      id: "test-id",
      mode: "auto",
      placement: "top",
      offset: 8,
    });

    adapter.open();
    expect(triggerEl.style.anchorName).toBe("--rt-test-id");
    expect((overlayEl.style as unknown as { positionAnchor?: string }).positionAnchor).toBe("--rt-test-id");

    if (rafCallback) rafCallback();
    if (rafCallback) rafCallback();
    adapter.destroy();
  });

  it("open() sets popover attribute and calls showPopover after rAF", () => {
    const adapter = createNativeAdapter({
      triggerEl,
      overlayEl,
      id: "x",
      mode: "manual",
      placement: "bottom",
      offset: 8,
    });

    adapter.open();
    expect(overlayEl.getAttribute("popover")).toBe("manual");
    expect(showPopoverMock).not.toHaveBeenCalled();

    if (rafCallback) rafCallback();
    expect(showPopoverMock).toHaveBeenCalledTimes(1);

    if (rafCallback) rafCallback();
    adapter.destroy();
  });

  it("open() applies placement as positionArea", () => {
    const adapter = createNativeAdapter({
      triggerEl,
      overlayEl,
      id: "x",
      mode: "auto",
      placement: "top-end",
      offset: 8,
    });

    adapter.open();
    if (rafCallback) rafCallback();
    const positionArea = (overlayEl.style as unknown as { positionArea?: string }).positionArea;
    expect(positionArea === "top end" || positionArea === "top-end").toBe(true);
    adapter.destroy();
  });

  it("open() uses visibility hidden then restores (flicker mitigation)", () => {
    const adapter = createNativeAdapter({
      triggerEl,
      overlayEl,
      id: "x",
      mode: "auto",
      placement: "top",
      offset: 8,
    });

    adapter.open();
    expect(overlayEl.style.visibility).toBe("hidden");
    if (rafCallback) rafCallback();
    if (rafCallback) rafCallback();
    expect(overlayEl.style.visibility).toBe("");
    adapter.destroy();
  });

  it("open() calls onAfterOpen after second rAF", () => {
    const onAfterOpen = vi.fn();
    const adapter = createNativeAdapter({
      triggerEl,
      overlayEl,
      id: "x",
      mode: "auto",
      placement: "top",
      offset: 8,
      onAfterOpen,
    });

    adapter.open();
    expect(onAfterOpen).not.toHaveBeenCalled();
    if (rafCallback) rafCallback();
    expect(onAfterOpen).not.toHaveBeenCalled();
    if (rafCallback) rafCallback();
    expect(onAfterOpen).toHaveBeenCalledTimes(1);
    adapter.destroy();
  });

  it("close() calls hidePopover", () => {
    (overlayEl as unknown as { matches: (s: string) => boolean }).matches = vi.fn((sel: string) => sel === ":popover-open");

    const adapter = createNativeAdapter({
      triggerEl,
      overlayEl,
      id: "x",
      mode: "auto",
      placement: "top",
      offset: 8,
    });

    adapter.open();
    if (rafCallback) rafCallback();
    if (rafCallback) rafCallback();
    adapter.close();
    expect(hidePopoverMock).toHaveBeenCalledTimes(1);
  });

  it("close() calls onAfterClose", () => {
    const onAfterClose = vi.fn();
    const adapter = createNativeAdapter({
      triggerEl,
      overlayEl,
      id: "x",
      mode: "auto",
      placement: "top",
      offset: 8,
      onAfterClose,
    });

    adapter.open();
    if (rafCallback) rafCallback();
    if (rafCallback) rafCallback();
    adapter.close();
    expect(onAfterClose).toHaveBeenCalledTimes(1);
  });

  it("updatePlacement updates positionArea", () => {
    const adapter = createNativeAdapter({
      triggerEl,
      overlayEl,
      id: "x",
      mode: "auto",
      placement: "top",
      offset: 8,
    });

    adapter.open();
    if (rafCallback) rafCallback();
    const areaTop = (overlayEl.style as unknown as { positionArea?: string }).positionArea;
    expect(areaTop === "top center" || areaTop === "top").toBe(true);

    adapter.updatePlacement("bottom-end");
    const areaBottom = (overlayEl.style as unknown as { positionArea?: string }).positionArea;
    expect(areaBottom === "bottom end" || areaBottom === "bottom-end").toBe(true);

    adapter.destroy();
  });

  it("destroy() removes injected styles", () => {
    const adapter = createNativeAdapter({
      triggerEl,
      overlayEl,
      id: "x",
      mode: "auto",
      placement: "top",
      offset: 8,
    });

    adapter.open();
    expect(triggerEl.style.anchorName).toBe("--rt-x");
    expect((overlayEl.style as unknown as { positionAnchor?: string }).positionAnchor).toBe("--rt-x");

    adapter.destroy();
    expect(triggerEl.style.anchorName).toBe("");
    expect((overlayEl.style as unknown as { positionAnchor?: string }).positionAnchor).toBe("");
  });

  it("does not throw if showPopover is not present (guard)", () => {
    delete (overlayEl as unknown as { showPopover?: () => void }).showPopover;

    const adapter = createNativeAdapter({
      triggerEl,
      overlayEl,
      id: "x",
      mode: "auto",
      placement: "top",
      offset: 8,
    });

    adapter.open();
    if (rafCallback) rafCallback();
    expect(() => {
      if (rafCallback) rafCallback();
    }).not.toThrow();
    adapter.destroy();
  });
});
