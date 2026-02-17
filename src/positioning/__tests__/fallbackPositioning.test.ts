import { describe, expect, it } from "vitest";
import type { Placement } from "../../types";
import { computeFallbackPosition } from "../fallbackPositioning";

const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 600;

function makeTrigger(overrides?: Partial<DOMRect>): DOMRect {
  return {
    top: 100,
    left: 100,
    width: 100,
    height: 40,
    right: 200,
    bottom: 140,
    x: 100,
    y: 100,
    toJSON: () => ({}),
    ...overrides,
  } as DOMRect;
}

function makeOverlay(width: number, height: number): DOMRect {
  return {
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect;
}

function compute(
  trigger: DOMRect,
  overlay: DOMRect,
  placement: Placement,
  offset: number
) {
  return computeFallbackPosition({
    triggerRect: trigger,
    overlayRect: overlay,
    placement,
    offset,
    viewportWidth: VIEWPORT_WIDTH,
    viewportHeight: VIEWPORT_HEIGHT,
  });
}

describe("fallbackPositioning", () => {
  const trigger = makeTrigger();
  const overlay = makeOverlay(80, 50);
  const offset = 8;

  it('"top" placement: overlay above trigger, centered', () => {
    const r = compute(trigger, overlay, "top", offset);
    expect(r.top).toBe(100 - 50 - 8);
    expect(r.left).toBe(100 + 100 / 2 - 80 / 2);
    expect(Number.isNaN(r.top)).toBe(false);
    expect(Number.isNaN(r.left)).toBe(false);
  });

  it('"bottom" placement: overlay below trigger, centered', () => {
    const r = compute(trigger, overlay, "bottom", offset);
    expect(r.top).toBe(140 + 8);
    expect(r.left).toBe(100 + 100 / 2 - 80 / 2);
  });

  it('"left" placement: overlay left of trigger, vertically centered', () => {
    const r = compute(trigger, overlay, "left", offset);
    expect(r.left).toBe(100 - 80 - 8);
    expect(r.top).toBe(100 + 40 / 2 - 50 / 2);
  });

  it('"right" placement: overlay right of trigger, vertically centered', () => {
    const r = compute(trigger, overlay, "right", offset);
    expect(r.left).toBe(200 + 8);
    expect(r.top).toBe(100 + 40 / 2 - 50 / 2);
  });

  it('"top-start" placement: overlay above, left-aligned', () => {
    const r = compute(trigger, overlay, "top-start", offset);
    expect(r.top).toBe(100 - 50 - 8);
    expect(r.left).toBe(100);
  });

  it('"top-end" placement: overlay above, right-aligned', () => {
    const r = compute(trigger, overlay, "top-end", offset);
    expect(r.top).toBe(100 - 50 - 8);
    expect(r.left).toBe(200 - 80);
  });

  it('"bottom-start" and "bottom-end"', () => {
    const rStart = compute(trigger, overlay, "bottom-start", offset);
    expect(rStart.top).toBe(148);
    expect(rStart.left).toBe(100);

    const rEnd = compute(trigger, overlay, "bottom-end", offset);
    expect(rEnd.top).toBe(148);
    expect(rEnd.left).toBe(120);
  });

  it('"left-start" and "left-end"', () => {
    const rStart = compute(trigger, overlay, "left-start", offset);
    expect(rStart.left).toBe(100 - 80 - 8);
    expect(rStart.top).toBe(100);

    const rEnd = compute(trigger, overlay, "left-end", offset);
    expect(rEnd.left).toBe(12);
    expect(rEnd.top).toBe(140 - 50);
  });

  it('"right-start" and "right-end"', () => {
    const rStart = compute(trigger, overlay, "right-start", offset);
    expect(rStart.left).toBe(208);
    expect(rStart.top).toBe(100);

    const rEnd = compute(trigger, overlay, "right-end", offset);
    expect(rEnd.left).toBe(208);
    expect(rEnd.top).toBe(90);
  });

  it("clamping when negative: left and top clamped to 0", () => {
    const t = makeTrigger({ left: 10, top: 10, right: 110, bottom: 50 });
    const o = makeOverlay(200, 100);
    const r = compute(t, o, "top", 8);
    expect(r.top).toBe(0);
    expect(r.left).toBeGreaterThanOrEqual(0);
  });

  it("clamping when exceeding viewport: right and bottom clamped", () => {
    const t = makeTrigger({
      left: 700,
      top: 500,
      width: 100,
      height: 40,
      right: 800,
      bottom: 540,
    });
    const o = makeOverlay(150, 100);
    const r = compute(t, o, "bottom-end", 8);
    expect(r.left).toBeLessThanOrEqual(VIEWPORT_WIDTH - 150);
    expect(r.top).toBeLessThanOrEqual(VIEWPORT_HEIGHT - 100);
    expect(r.left).toBe(VIEWPORT_WIDTH - 150);
    expect(r.top).toBe(VIEWPORT_HEIGHT - 100);
  });

  it("returns deterministic values (no NaN)", () => {
    const r1 = compute(trigger, overlay, "top", offset);
    const r2 = compute(trigger, overlay, "top", offset);
    expect(r1).toEqual(r2);
    expect(Number.isFinite(r1.top)).toBe(true);
    expect(Number.isFinite(r1.left)).toBe(true);
  });

  it("result never negative after clamp", () => {
    const placements = [
      "top",
      "bottom",
      "left",
      "right",
      "top-start",
      "top-end",
      "bottom-start",
      "bottom-end",
      "left-start",
      "left-end",
      "right-start",
      "right-end",
    ] as const;
    for (const p of placements) {
      const r = compute(trigger, overlay, p, offset);
      expect(r.top).toBeGreaterThanOrEqual(0);
      expect(r.left).toBeGreaterThanOrEqual(0);
      expect(r.top + overlay.height).toBeLessThanOrEqual(VIEWPORT_HEIGHT);
      expect(r.left + overlay.width).toBeLessThanOrEqual(VIEWPORT_WIDTH);
    }
  });
});
