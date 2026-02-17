import React, { act, createRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useOverlayEngine } from "../useOverlayEngine";
import * as featureDetection from "../../strategy/featureDetection";
import * as resolveStrategyModule from "../../strategy/resolveStrategy";
import * as nativeAdapterModule from "../../strategy/nativeAdapter";
import * as fallbackAdapterModule from "../../strategy/fallbackAdapter";

vi.mock("../../strategy/featureDetection");
vi.mock("../../strategy/resolveStrategy");
vi.mock("../../strategy/nativeAdapter");
vi.mock("../../strategy/fallbackAdapter");

function renderWithRefs(
  ui: React.ReactElement
): { container: HTMLElement; root: Root; rerender: (next: React.ReactElement) => void; unmount: () => void } {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(ui);
  });
  return {
    container,
    root,
    rerender: (next: React.ReactElement) => {
      act(() => {
        root.render(next);
      });
    },
    unmount: () => {
      act(() => {
        root.unmount();
      });
      document.body.removeChild(container);
    },
  };
}

const defaultOptions = {
  kind: "tooltip" as const,
  placement: "top" as const,
  offset: 8,
  interactionConfig: {
    openDelayMs: 0,
    closeDelayMs: 0,
    hoverableContent: false,
    dismissOnEsc: true,
  },
};

function TestHarness({
  options,
  engineRef,
}: {
  options: Parameters<typeof useOverlayEngine>[0];
  engineRef: React.MutableRefObject<ReturnType<typeof useOverlayEngine> | null>;
}) {
  const engine = useOverlayEngine(options);
  engineRef.current = engine;
  return (
    <div>
      <button ref={engine.triggerRef} type="button">
        trigger
      </button>
      <div ref={engine.overlayRef}>overlay</div>
    </div>
  );
}

describe("useOverlayEngine", () => {
  let fallbackOpenMock: ReturnType<typeof vi.fn>;
  let fallbackCloseMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.mocked(featureDetection.detectSupports).mockReturnValue({
      popover: false,
      anchorPositioning: false,
    });
    vi.mocked(resolveStrategyModule.resolveStrategy).mockReturnValue("fallback");

    fallbackOpenMock = vi.fn();
    fallbackCloseMock = vi.fn();

    vi.mocked(fallbackAdapterModule.createFallbackAdapter).mockImplementation(() => ({
      open: fallbackOpenMock,
      close: fallbackCloseMock,
      updatePlacement: vi.fn(),
      destroy: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uncontrolled: setOpen(true) dispatches REQUEST_OPEN and adapter.open is called", () => {
    const engineRef = createRef<ReturnType<typeof useOverlayEngine> | null>(null);
    const { unmount } = renderWithRefs(
      <TestHarness
        options={defaultOptions}
        engineRef={engineRef as React.MutableRefObject<ReturnType<typeof useOverlayEngine> | null>}
      />
    );

    act(() => {
      engineRef.current!.setOpen(true);
    });

    expect(fallbackOpenMock).toHaveBeenCalled();
    expect(engineRef.current!.open).toBe(true);
    unmount();
  });

  it("controlled: setOpen calls onOpenChange and does not mutate internal open from prop", () => {
    const onOpenChange = vi.fn();
    const engineRef = createRef<ReturnType<typeof useOverlayEngine> | null>(null);

    const { unmount } = renderWithRefs(
      <TestHarness
        options={{
          ...defaultOptions,
          controlledOpen: false,
          onOpenChange,
        }}
        engineRef={engineRef as React.MutableRefObject<ReturnType<typeof useOverlayEngine> | null>}
      />
    );

    act(() => {
      engineRef.current!.setOpen(true, "click");
    });

    expect(onOpenChange).toHaveBeenCalledWith(true, "click");
    expect(engineRef.current!.open).toBe(false);
    unmount();
  });

  it("strategy resolution: native adapter created when popover supported", () => {
    vi.mocked(featureDetection.detectSupports).mockReturnValue({
      popover: true,
      anchorPositioning: true,
    });
    vi.mocked(resolveStrategyModule.resolveStrategy).mockReturnValue("native");

    vi.mocked(nativeAdapterModule.createNativeAdapter).mockImplementation(() => ({
      open: vi.fn(),
      close: vi.fn(),
      updatePlacement: vi.fn(),
      destroy: vi.fn(),
    }));

    const engineRef = createRef<ReturnType<typeof useOverlayEngine> | null>(null);
    const { unmount } = renderWithRefs(
      <TestHarness
        options={defaultOptions}
        engineRef={engineRef as React.MutableRefObject<ReturnType<typeof useOverlayEngine> | null>}
      />
    );

    expect(nativeAdapterModule.createNativeAdapter).toHaveBeenCalled();
    expect(fallbackAdapterModule.createFallbackAdapter).not.toHaveBeenCalled();
    unmount();
  });

  it("strategy resolution: fallback adapter when popover not supported", () => {
    vi.mocked(featureDetection.detectSupports).mockReturnValue({
      popover: false,
      anchorPositioning: false,
    });
    vi.mocked(resolveStrategyModule.resolveStrategy).mockReturnValue("fallback");

    const engineRef = createRef<ReturnType<typeof useOverlayEngine> | null>(null);
    const { unmount } = renderWithRefs(
      <TestHarness
        options={defaultOptions}
        engineRef={engineRef as React.MutableRefObject<ReturnType<typeof useOverlayEngine> | null>}
      />
    );

    expect(fallbackAdapterModule.createFallbackAdapter).toHaveBeenCalled();
    unmount();
  });

  it("fallback onRequestClose('outside-press') triggers REQUEST_CLOSE and adapter.close", () => {
    let capturedOnRequestClose: ((reason: "outside-press" | "escape") => void) | undefined;
    const closeMock = vi.fn();
    vi.mocked(fallbackAdapterModule.createFallbackAdapter).mockImplementation((opts) => {
      capturedOnRequestClose = opts.onRequestClose;
      return {
        open: vi.fn(),
        close: closeMock,
        updatePlacement: vi.fn(),
        destroy: vi.fn(),
      };
    });

    const engineRef = createRef<ReturnType<typeof useOverlayEngine> | null>(null);
    const { unmount } = renderWithRefs(
      <TestHarness
        options={defaultOptions}
        engineRef={engineRef as React.MutableRefObject<ReturnType<typeof useOverlayEngine> | null>}
      />
    );

    act(() => {
      engineRef.current!.setOpen(true);
    });
    expect(closeMock).toHaveBeenCalledTimes(0);

    act(() => {
      const fn = capturedOnRequestClose!;
      fn("outside-press");
    });
    expect(closeMock).toHaveBeenCalled();
    unmount();
  });

  it("fallback onRequestClose('escape') triggers close", () => {
    let capturedOnRequestClose: ((reason: "outside-press" | "escape") => void) | undefined;
    const closeMock = vi.fn();
    vi.mocked(fallbackAdapterModule.createFallbackAdapter).mockImplementation((opts) => {
      capturedOnRequestClose = opts.onRequestClose;
      return {
        open: vi.fn(),
        close: closeMock,
        updatePlacement: vi.fn(),
        destroy: vi.fn(),
      };
    });

    const engineRef = createRef<ReturnType<typeof useOverlayEngine> | null>(null);
    const { unmount } = renderWithRefs(
      <TestHarness
        options={defaultOptions}
        engineRef={engineRef as React.MutableRefObject<ReturnType<typeof useOverlayEngine> | null>}
      />
    );

    act(() => {
      engineRef.current!.setOpen(true);
    });
    act(() => {
      const fn = capturedOnRequestClose!;
      fn("escape");
    });
    expect(closeMock).toHaveBeenCalled();
    unmount();
  });

  it("placement change calls adapter.updatePlacement", () => {
    const updatePlacementMock = vi.fn();
    vi.mocked(fallbackAdapterModule.createFallbackAdapter).mockImplementation(() => ({
      open: vi.fn(),
      close: vi.fn(),
      updatePlacement: updatePlacementMock,
      destroy: vi.fn(),
    }));

    const engineRef = createRef<ReturnType<typeof useOverlayEngine> | null>(null);
    const { rerender, unmount } = renderWithRefs(
      <TestHarness
        options={{ ...defaultOptions, placement: "top" }}
        engineRef={engineRef as React.MutableRefObject<ReturnType<typeof useOverlayEngine> | null>}
      />
    );

    expect(updatePlacementMock).not.toHaveBeenCalled();

    rerender(
      <TestHarness
        options={{ ...defaultOptions, placement: "bottom" }}
        engineRef={engineRef as React.MutableRefObject<ReturnType<typeof useOverlayEngine> | null>}
      />
    );

    expect(updatePlacementMock).toHaveBeenCalledWith("bottom");
    unmount();
  });

  it("unmount calls adapter.destroy", () => {
    const destroyMock = vi.fn();
    vi.mocked(fallbackAdapterModule.createFallbackAdapter).mockImplementation(() => ({
      open: vi.fn(),
      close: vi.fn(),
      updatePlacement: vi.fn(),
      destroy: destroyMock,
    }));

    const engineRef = createRef<ReturnType<typeof useOverlayEngine> | null>(null);
    const { unmount } = renderWithRefs(
      <TestHarness
        options={defaultOptions}
        engineRef={engineRef as React.MutableRefObject<ReturnType<typeof useOverlayEngine> | null>}
      />
    );

    unmount();
    expect(destroyMock).toHaveBeenCalled();
  });

  it("returns supports from detectSupports", () => {
    vi.mocked(featureDetection.detectSupports).mockReturnValue({
      popover: true,
      anchorPositioning: true,
    });

    const engineRef = createRef<ReturnType<typeof useOverlayEngine> | null>(null);
    const { unmount } = renderWithRefs(
      <TestHarness
        options={defaultOptions}
        engineRef={engineRef as React.MutableRefObject<ReturnType<typeof useOverlayEngine> | null>}
      />
    );

    expect(engineRef.current!.supports).toEqual({
      popover: true,
      anchorPositioning: true,
    });
    unmount();
  });
});
