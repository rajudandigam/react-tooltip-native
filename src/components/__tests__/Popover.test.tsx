import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { Popover } from "../Popover";

function renderPopover(props: Partial<React.ComponentProps<typeof Popover>> = {}) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(
      <Popover
        content={<div><button type="button">First focusable</button></div>}
        strategy="fallback"
        disableAnchorPositioning
        {...props}
      >
        <button type="button">Trigger</button>
      </Popover>
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

describe("Popover", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("when closed panel is hidden (not removed, for ref/engine)", () => {
    const { container, unmount } = renderPopover();
    const panel = container.querySelector("[data-rt-overlay='popover']");
    expect(panel).not.toBeNull();
    expect((panel as HTMLElement).style.display).toBe("none");
    expect(container.querySelector("button")?.textContent).toBe("Trigger");
    unmount();
  });

  it("panel visible and has content when defaultOpen", () => {
    const { container, unmount } = renderPopover({ defaultOpen: true });
    act(() => {}); // flush adapter open
    const panel = container.querySelector("[data-rt-overlay='popover']");
    expect(panel).not.toBeNull();
    expect(panel?.textContent).toContain("First focusable");
    expect((panel as HTMLElement).style.display).not.toBe("none");
    unmount();
  });

  it("aria-expanded true when defaultOpen", () => {
    const { container, unmount } = renderPopover({ defaultOpen: true });
    act(() => {});
    const trigger = container.querySelector("button");
    expect(trigger?.getAttribute("aria-expanded")).toBe("true");
    unmount();
  });

  it("initialFocus first: first focusable in panel receives focus after open", () => {
    const { container, unmount } = renderPopover({
      defaultOpen: true,
      initialFocus: "first",
    });
    act(() => {}); // flush open + focus effect
    const panel = container.querySelector("[data-rt-overlay='popover']");
    const firstFocusable = panel?.querySelector("button");
    expect(document.activeElement).toBe(firstFocusable);
    unmount();
  });

  it("panel has id and trigger has aria-controls pointing to it", () => {
    const { container, unmount } = renderPopover({ defaultOpen: true, id: "pop-id" });
    act(() => {});
    const trigger = container.querySelector("button");
    const panel = container.querySelector("[data-rt-overlay='popover']");
    expect(panel?.getAttribute("id")).toBe("pop-id");
    expect(trigger?.getAttribute("aria-controls")).toBe("pop-id");
    unmount();
  });
});
