import React, { act, createRef } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePopover } from "../usePopover";
import { useOverlayEngine } from "../../core/useOverlayEngine";
import { makeAnchorName } from "../../positioning/anchorInjection";

vi.mock("../../core/useOverlayEngine");

function PopoverHarness({
  options,
  resultRef,
}: {
  options: Parameters<typeof usePopover>[0];
  resultRef: React.MutableRefObject<ReturnType<typeof usePopover> | null>;
}) {
  const result = usePopover(options);
  resultRef.current = result;
  return (
    <>
      <button type="button" {...result.getTriggerProps()}>
        trigger
      </button>
      <div {...result.getPopoverProps()}>popover</div>
    </>
  );
}

function renderPopover(options: Parameters<typeof usePopover>[0] = {}) {
  const resultRef = createRef<ReturnType<typeof usePopover> | null>() as React.MutableRefObject<ReturnType<typeof usePopover> | null>;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<PopoverHarness options={options} resultRef={resultRef} />);
  });
  return {
    resultRef,
    unmount: () => {
      act(() => root.unmount());
      document.body.removeChild(container);
    },
  };
}

describe("usePopover", () => {
  let mockHandlers: {
    onPointerEnterTrigger: ReturnType<typeof vi.fn>;
    onPointerLeaveTrigger: ReturnType<typeof vi.fn>;
    onClickTrigger: ReturnType<typeof vi.fn>;
    onKeyDownEscape: ReturnType<typeof vi.fn>;
    destroy: ReturnType<typeof vi.fn>;
  };
  let mockEngineReturn: ReturnType<typeof useOverlayEngine>;

  beforeEach(() => {
    mockHandlers = {
      onPointerEnterTrigger: vi.fn(),
      onPointerLeaveTrigger: vi.fn(),
      onPointerEnterOverlay: vi.fn(),
      onPointerLeaveOverlay: vi.fn(),
      onFocusTrigger: vi.fn(),
      onBlurTrigger: vi.fn(),
      onClickTrigger: vi.fn(),
      onKeyDownEscape: vi.fn(),
      destroy: vi.fn(),
    };
    mockEngineReturn = {
      open: false,
      setOpen: vi.fn(),
      triggerRef: vi.fn(),
      overlayRef: vi.fn(),
      getInteractionHandlers: () => mockHandlers,
      supports: { popover: false, anchorPositioning: false },
    };
    vi.mocked(useOverlayEngine).mockReturnValue(mockEngineReturn);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("click on trigger calls onClickTrigger", () => {
    const { resultRef, unmount } = renderPopover();
    const triggerProps = resultRef.current!.getTriggerProps();
    act(() => {
      triggerProps.onClick?.({} as React.MouseEvent<HTMLElement>);
    });
    expect(mockHandlers.onClickTrigger).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("toggle() calls setOpen with negated open and reason click", () => {
    const setOpen = vi.fn();
    vi.mocked(useOverlayEngine).mockReturnValue({
      ...mockEngineReturn,
      open: false,
      setOpen,
    });
    const { resultRef, unmount } = renderPopover();
    act(() => {
      resultRef.current!.toggle("click");
    });
    expect(setOpen).toHaveBeenCalledWith(true, "click");
    unmount();
  });

  it("aria-expanded and aria-controls on trigger", () => {
    vi.mocked(useOverlayEngine).mockReturnValue({
      ...mockEngineReturn,
      open: true,
    });
    const { resultRef, unmount } = renderPopover({ id: "pop-1" });
    const triggerProps = resultRef.current!.getTriggerProps();
    expect(triggerProps["aria-expanded"]).toBe(true);
    expect(triggerProps["aria-controls"]).toBe("pop-1");
    unmount();
  });

  it("injects anchorName into trigger and positionAnchor into popover", () => {
    const { resultRef, unmount } = renderPopover({ id: "p1" });
    const triggerProps = resultRef.current!.getTriggerProps();
    const popoverProps = resultRef.current!.getPopoverProps();
    expect(triggerProps.style?.anchorName).toBe(makeAnchorName("p1"));
    expect(popoverProps.style?.positionAnchor).toBe(makeAnchorName("p1"));
    unmount();
  });

  it("keydown Enter on trigger calls onClickTrigger", () => {
    const { resultRef, unmount } = renderPopover();
    const triggerProps = resultRef.current!.getTriggerProps();
    act(() => {
      triggerProps.onKeyDown?.({
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(mockHandlers.onClickTrigger).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("keydown Escape calls onKeyDownEscape", () => {
    const { resultRef, unmount } = renderPopover();
    const triggerProps = resultRef.current!.getTriggerProps();
    act(() => {
      triggerProps.onKeyDown?.({ key: "Escape" } as React.KeyboardEvent<HTMLElement>);
    });
    expect(mockHandlers.onKeyDownEscape).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("calls useOverlayEngine with closeOnOutsidePress false for mode manual", () => {
    renderPopover({ mode: "manual" });
    expect(useOverlayEngine).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "popover",
        mode: "manual",
        closeOnOutsidePress: false,
      })
    );
  });

  it("calls useOverlayEngine with closeOnOutsidePress true for mode auto", () => {
    renderPopover({ mode: "auto" });
    expect(useOverlayEngine).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "popover",
        mode: "auto",
        closeOnOutsidePress: true,
      })
    );
  });

  it("returns id on getPopoverProps", () => {
    const { resultRef, unmount } = renderPopover({ id: "popover-id" });
    expect(resultRef.current!.getPopoverProps().id).toBe("popover-id");
    unmount();
  });
});
