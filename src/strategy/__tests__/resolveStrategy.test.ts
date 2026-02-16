import { describe, expect, it } from "vitest";
import type { Supports } from "../featureDetection";
import { resolveStrategy } from "../resolveStrategy";

describe("resolveStrategy", () => {
  it("returns fallback when strategy is fallback (regardless of supports)", () => {
    expect(
      resolveStrategy({ strategy: "fallback", supports: { popover: true, anchorPositioning: true } })
    ).toBe("fallback");
    expect(
      resolveStrategy({ strategy: "fallback", supports: { popover: false, anchorPositioning: true } })
    ).toBe("fallback");
    expect(
      resolveStrategy({ strategy: "fallback", supports: { popover: true, anchorPositioning: false } })
    ).toBe("fallback");
    expect(
      resolveStrategy({ strategy: "fallback", supports: { popover: false, anchorPositioning: false } })
    ).toBe("fallback");
  });

  it("returns native when strategy is native and supports.popover is true", () => {
    expect(
      resolveStrategy({ strategy: "native", supports: { popover: true, anchorPositioning: false } })
    ).toBe("native");
    expect(
      resolveStrategy({ strategy: "native", supports: { popover: true, anchorPositioning: true } })
    ).toBe("native");
  });

  it("returns fallback when strategy is native and supports.popover is false", () => {
    expect(
      resolveStrategy({ strategy: "native", supports: { popover: false, anchorPositioning: true } })
    ).toBe("fallback");
    expect(
      resolveStrategy({ strategy: "native", supports: { popover: false, anchorPositioning: false } })
    ).toBe("fallback");
  });

  it("returns native when strategy is auto and supports.popover is true", () => {
    expect(
      resolveStrategy({ strategy: "auto", supports: { popover: true, anchorPositioning: false } })
    ).toBe("native");
    expect(
      resolveStrategy({ strategy: "auto", supports: { popover: true, anchorPositioning: true } })
    ).toBe("native");
  });

  it("returns fallback when strategy is auto and supports.popover is false", () => {
    expect(
      resolveStrategy({ strategy: "auto", supports: { popover: false, anchorPositioning: true } })
    ).toBe("fallback");
    expect(
      resolveStrategy({ strategy: "auto", supports: { popover: false, anchorPositioning: false } })
    ).toBe("fallback");
  });

  it("treats undefined strategy as auto (native if popover, else fallback)", () => {
    expect(
      resolveStrategy({ supports: { popover: true, anchorPositioning: false } })
    ).toBe("native");
    expect(
      resolveStrategy({ supports: { popover: false, anchorPositioning: true } })
    ).toBe("fallback");
  });

  it("anchorPositioning does not affect result (only popover matters)", () => {
    const withPopover: Supports = { popover: true, anchorPositioning: false };
    const withAnchor: Supports = { popover: true, anchorPositioning: true };
    expect(resolveStrategy({ strategy: "auto", supports: withPopover })).toBe("native");
    expect(resolveStrategy({ strategy: "auto", supports: withAnchor })).toBe("native");

    const noPopoverNoAnchor: Supports = { popover: false, anchorPositioning: false };
    const noPopoverWithAnchor: Supports = { popover: false, anchorPositioning: true };
    expect(resolveStrategy({ strategy: "auto", supports: noPopoverNoAnchor })).toBe("fallback");
    expect(resolveStrategy({ strategy: "auto", supports: noPopoverWithAnchor })).toBe("fallback");
  });
});
