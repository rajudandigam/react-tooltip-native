import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tooltip } from "../Tooltip";

function renderTooltip(props: Partial<React.ComponentProps<typeof Tooltip>> = {}) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(
      <Tooltip
        content="Tooltip text"
        strategy="fallback"
        disableAnchorPositioning
        {...props}
      >
        <button type="button">Trigger</button>
      </Tooltip>
    );
  });
  return {
    container,
    unmount: () => {
      act(() => root.unmount());
      document.body.removeChild(container);
    },
  };
}

describe("Tooltip", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("when closed overlay is hidden (not removed, for ref/engine)", () => {
    const { container, unmount } = renderTooltip();
    const overlay = container.querySelector("[data-rt-overlay='tooltip']");
    expect(overlay).not.toBeNull();
    expect((overlay as HTMLElement).style.display).toBe("none");
    expect(container.querySelector("button")?.textContent).toBe("Trigger");
    unmount();
  });

  it("opens and renders overlay on pointer enter", () => {
    vi.useFakeTimers();
    const { container, unmount } = renderTooltip({ openDelay: 0, closeDelay: 0 });
    const button = container.querySelector("button");
    expect(button).not.toBeNull();

    act(() => {
      button!.dispatchEvent(new Event("pointerenter", { bubbles: true }));
    });
    act(() => {
      vi.advanceTimersByTime(0);
    });

    const overlay = container.querySelector("[data-rt-overlay='tooltip']");
    expect(overlay).not.toBeNull();
    expect(overlay?.textContent).toContain("Tooltip text");
    vi.useRealTimers();
    unmount();
  });

  it("aria-describedby absent when closed (default describeOnlyWhenOpen)", () => {
    const { container, unmount } = renderTooltip();
    const button = container.querySelector("button");
    expect(button?.getAttribute("aria-describedby")).toBeNull();
    unmount();
  });

  it("aria-describedby present when open", () => {
    const { container, unmount } = renderTooltip({
      defaultOpen: true,
      openDelay: 0,
      closeDelay: 0,
    });
    const button = container.querySelector("button");
    const overlay = container.querySelector("[data-rt-overlay='tooltip']");
    expect(overlay).not.toBeNull();
    const id = overlay?.getAttribute("id");
    expect(button?.getAttribute("aria-describedby")).toBe(id);
    unmount();
  });

  it("hoverableContent: overlay visible when defaultOpen and has role tooltip", () => {
    const { container, unmount } = renderTooltip({
      defaultOpen: true,
      hoverableContent: true,
      openDelay: 0,
      closeDelay: 100,
    });
    const overlay = container.querySelector("[data-rt-overlay='tooltip']");
    expect(overlay).not.toBeNull();
    expect((overlay as HTMLElement).style.display).not.toBe("none");
    expect(overlay?.getAttribute("role")).toBe("tooltip");
    unmount();
  });
});
