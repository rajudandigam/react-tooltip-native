import React, { act, createRef } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTooltip } from "../useTooltip";
import { useOverlayEngine } from "../../core/useOverlayEngine";
import { makeAnchorName } from "../../positioning/anchorInjection";

vi.mock("../../core/useOverlayEngine");

function TooltipHarness({
  options,
  resultRef,
}: {
  options: Parameters<typeof useTooltip>[0];
  resultRef: React.MutableRefObject<ReturnType<typeof useTooltip> | null>;
}) {
  const result = useTooltip(options);
  resultRef.current = result;
  return (
    <>
      <button type="button" {...result.getTriggerProps()}>
        trigger
      </button>
      <div {...result.getTooltipProps()}>tooltip</div>
    </>
  );
}

function renderTooltip(options: Parameters<typeof useTooltip>[0] = {}) {
  const resultRef = createRef<ReturnType<typeof useTooltip> | null>() as React.MutableRefObject<ReturnType<typeof useTooltip> | null>;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<TooltipHarness options={options} resultRef={resultRef} />);
  });
  return {
    resultRef,
    unmount: () => {
      act(() => root.unmount());
      document.body.removeChild(container);
    },
  };
}

describe("useTooltip", () => {
  let mockHandlers: ReturnType<typeof createMockHandlers>;
  let mockEngineReturn: ReturnType<typeof useOverlayEngine>;

  function createMockHandlers() {
    return {
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
  }

  beforeEach(() => {
    mockHandlers = createMockHandlers();
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

  it("aria-describedby is absent when closed (describeOnlyWhenOpen default true)", () => {
    const { resultRef, unmount } = renderTooltip();
    const triggerProps = resultRef.current!.getTriggerProps();
    expect(triggerProps["aria-describedby"]).toBeUndefined();
    unmount();
  });

  it("aria-describedby is set when open", () => {
    vi.mocked(useOverlayEngine).mockReturnValue({
      ...mockEngineReturn,
      open: true,
    });
    const { resultRef, unmount } = renderTooltip({ id: "my-tooltip" });
    const triggerProps = resultRef.current!.getTriggerProps();
    expect(triggerProps["aria-describedby"]).toBe("my-tooltip");
    unmount();
  });

  it("injects anchorName into trigger style", () => {
    const { resultRef, unmount } = renderTooltip({ id: "t1" });
    const triggerProps = resultRef.current!.getTriggerProps();
    expect(triggerProps.style?.anchorName).toBe(makeAnchorName("t1"));
    unmount();
  });

  it("injects positionAnchor into tooltip style", () => {
    const { resultRef, unmount } = renderTooltip({ id: "t2" });
    const tooltipProps = resultRef.current!.getTooltipProps();
    expect(tooltipProps.style?.positionAnchor).toBe(makeAnchorName("t2"));
    unmount();
  });

  it("pointer enter on trigger calls interaction onPointerEnterTrigger", () => {
    const { resultRef, unmount } = renderTooltip();
    const triggerProps = resultRef.current!.getTriggerProps();
    act(() => {
      triggerProps.onPointerEnter?.({} as React.PointerEvent<HTMLElement>);
    });
    expect(mockHandlers.onPointerEnterTrigger).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("keydown Escape on trigger calls onKeyDownEscape", () => {
    const { resultRef, unmount } = renderTooltip();
    const triggerProps = resultRef.current!.getTriggerProps();
    act(() => {
      triggerProps.onKeyDown?.({ key: "Escape" } as React.KeyboardEvent<HTMLElement>);
    });
    expect(mockHandlers.onKeyDownEscape).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("pointer enter on overlay calls onPointerEnterOverlay (hoverable content)", () => {
    const { resultRef, unmount } = renderTooltip();
    const tooltipProps = resultRef.current!.getTooltipProps();
    act(() => {
      tooltipProps.onPointerEnter?.({} as React.PointerEvent<HTMLElement>);
    });
    expect(mockHandlers.onPointerEnterOverlay).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("returns role tooltip and id on getTooltipProps", () => {
    const { resultRef, unmount } = renderTooltip({ id: "tip-id" });
    const tooltipProps = resultRef.current!.getTooltipProps();
    expect(tooltipProps.role).toBe("tooltip");
    expect(tooltipProps.id).toBe("tip-id");
    unmount();
  });

  it("calls useOverlayEngine with tooltip config", () => {
    renderTooltip({
      placement: "bottom",
      offset: 10,
      openDelay: 200,
      closeDelay: 50,
      hoverableContent: true,
      dismissOnEsc: true,
    });
    expect(useOverlayEngine).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "tooltip",
        mode: "auto",
        placement: "bottom",
        offset: 10,
        interactionConfig: expect.objectContaining({
          openDelayMs: 200,
          closeDelayMs: 50,
          hoverableContent: true,
          dismissOnEsc: true,
        }),
        closeOnOutsidePress: false,
        closeOnEsc: true,
      })
    );
  });
});
